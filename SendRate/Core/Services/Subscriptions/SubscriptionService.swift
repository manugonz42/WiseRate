import Foundation
import StoreKit

/// SendRate Premium via StoreKit 2. One entitlement (`isPremium`), two SKUs.
/// See docs/services/subscriptions.md.
///
/// Server-side receipt reconciliation and RevenueCat are deferred — the entitlement is
/// derived locally from `Transaction.currentEntitlements` and cached via persistence.
protocol SubscriptionServiceProtocol {
    func getSubscriptionStatus() async -> SubscriptionStatus
    func getAvailablePlans() -> [SubscriptionPlan]
    func purchasePlan(_ plan: SubscriptionPlan) async throws
    func restorePurchases() async throws
}

enum SubscriptionStatus {
    case free
    case premium(plan: SubscriptionPlan)
    case trial
}

enum SubscriptionError: Error {
    case productNotFound
    case userCancelled
    case pending
    case verificationFailed
}

struct SubscriptionPlan: Identifiable {
    let id: String
    let name: String
    let price: Double
    let period: String
    let features: [String]
    let isPopular: Bool

    /// App Store product identifier (docs/services/subscriptions.md § SKUs).
    var productID: String {
        switch id {
        case "yearly": return "sendrate_premium_yearly"
        default: return "sendrate_premium_monthly"
        }
    }

    static let plans: [SubscriptionPlan] = [
        SubscriptionPlan(
            id: "monthly",
            name: "Monthly",
            price: 4.99,
            period: "month",
            features: ["Rate alerts", "Historical analytics", "Unlimited comparisons", "No ads"],
            isPopular: false
        ),
        SubscriptionPlan(
            id: "yearly",
            name: "Yearly",
            price: 39.99,
            period: "year",
            features: ["All Monthly features", "Personalized recommendations", "Priority support", "Save 33%"],
            isPopular: true
        )
    ]

    static func forProductID(_ productID: String) -> SubscriptionPlan? {
        plans.first { $0.productID == productID }
    }
}

final class SubscriptionService: SubscriptionServiceProtocol {
    static let shared = SubscriptionService()

    private var productIDs: [String] { SubscriptionPlan.plans.map(\.productID) }
    private var updatesTask: Task<Void, Never>?

    private init() {
        // Catch renewals / purchases made outside the app (Ask to Buy, other devices).
        updatesTask = Task { [weak self] in
            for await update in Transaction.updates {
                guard let self, case .verified(let transaction) = update else { continue }
                await transaction.finish()
                _ = await self.getSubscriptionStatus()
            }
        }
    }

    deinit { updatesTask?.cancel() }

    func getAvailablePlans() -> [SubscriptionPlan] { SubscriptionPlan.plans }

    func getSubscriptionStatus() async -> SubscriptionStatus {
        var status: SubscriptionStatus = .free
        var expiry: Date?

        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result,
                  productIDs.contains(transaction.productID),
                  transaction.revocationDate == nil else { continue }
            if let exp = transaction.expirationDate, exp < .now { continue }

            if let plan = SubscriptionPlan.forProductID(transaction.productID) {
                status = .premium(plan: plan)
                expiry = transaction.expirationDate
            }
        }

        await cacheEntitlement(status, expiry: expiry)
        return status
    }

    func purchasePlan(_ plan: SubscriptionPlan) async throws {
        guard let product = try await Product.products(for: [plan.productID]).first else {
            throw SubscriptionError.productNotFound
        }

        switch try await product.purchase() {
        case .success(let verification):
            guard case .verified(let transaction) = verification else {
                throw SubscriptionError.verificationFailed
            }
            await transaction.finish()
            await cacheEntitlement(.premium(plan: plan), expiry: transaction.expirationDate)   // optimistic
        case .userCancelled:
            throw SubscriptionError.userCancelled
        case .pending:
            throw SubscriptionError.pending
        @unknown default:
            throw SubscriptionError.verificationFailed
        }
    }

    func restorePurchases() async throws {
        try await AppStore.sync()
        _ = await getSubscriptionStatus()
    }

    /// Caches the entitlement boolean + expiry only (source of truth is the App Store).
    /// See docs/services/persistence.md § "What NOT to persist".
    private func cacheEntitlement(_ status: SubscriptionStatus, expiry: Date?) async {
        let isPremium: Bool
        if case .premium = status { isPremium = true } else { isPremium = false }

        await MainActor.run {
            var profile = PersistenceService.shared.profile.load()
            if profile.isPremium != isPremium {
                profile.isPremium = isPremium
                PersistenceService.shared.profile.save(profile)
            }
            let settings = PersistenceService.shared.settings
            if let expiry { settings.set("premiumExpiry", ISO8601DateFormatter().string(from: expiry)) }
            else { settings.set("premiumExpiry", "") }
        }
    }
}
