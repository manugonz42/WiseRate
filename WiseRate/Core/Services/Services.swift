import Foundation
import SwiftUI
import UserNotifications
import StoreKit

// MARK: - Exchange Rate Service

protocol ExchangeRateServiceProtocol {
    func getCurrentRate(from: String, to: String) async throws -> Rate
    func getHistoricalRates(from: String, to: String, timeFrame: TimeFrame) async throws -> [HistoricalRate]
    func getRatesStream(from: String, to: String) -> AsyncStream<Double>
}

/// Real exchange-rate service backed by Frankfurter (ECB daily data, no API key).
/// See docs/services/exchange-rate.md.
class ExchangeRateService: ExchangeRateServiceProtocol {
    static let shared = ExchangeRateService()

    private let http = HTTPClient.shared
    private let cache = RateCache.shared

    private let spotMemTTL: TimeInterval = 300        // 5 min

    func getCurrentRate(from: String, to: String) async throws -> Rate {
        let key = "rate-\(from)-\(to)"

        if let cached = await cache.load(Rate.self, key: key), cached.age < spotMemTTL {
            return cached.value
        }

        do {
            // One timeseries call covers latest + prior closes for the deltas.
            let start = Calendar.current.date(byAdding: .day, value: -12, to: Date())!
            let url = Frankfurter.timeseriesURL(base: from, symbol: to, start: start, end: nil)
            let series: FrankfurterTimeseries = try await http.get(url)
            let points = series.points(symbol: to)

            guard let latest = points.last else { throw ExchangeRateError.unsupportedPair }

            let rate = Rate(
                rate: latest.rate,
                timestamp: latest.date,
                delta24h: percentChange(to: latest, from: points.dropLast().last?.rate),
                delta7d: percentChange(to: latest, from: closeAtOrBefore(points, days: 7)),
                isStale: false
            )
            await cache.store(rate, key: key)
            return rate
        } catch {
            // Stale-while-revalidate: serve last cached value flagged stale.
            if let cached = await cache.load(Rate.self, key: key) {
                let v = cached.value
                return Rate(rate: v.rate, timestamp: v.timestamp,
                            delta24h: v.delta24h, delta7d: v.delta7d, isStale: true)
            }
            throw error
        }
    }

    func getHistoricalRates(from: String, to: String, timeFrame: TimeFrame) async throws -> [HistoricalRate] {
        let key = "historical-\(from)-\(to)-\(timeFrame.rawValue)"
        let memTTL: TimeInterval = timeFrame == .day24 ? 300 : 3600   // 24H 5min, ≥7D 1h

        if let cached = await cache.load([HistoricalRate].self, key: key), cached.age < memTTL {
            return cached.value
        }

        do {
            let start = Calendar.current.date(byAdding: .day, value: -timeFrame.lookbackDays, to: Date())!
            let url = Frankfurter.timeseriesURL(base: from, symbol: to, start: start, end: nil)
            let series: FrankfurterTimeseries = try await http.get(url)
            let rates = series.points(symbol: to).map {
                HistoricalRate(date: $0.date, rate: $0.rate, provider: nil)
            }
            await cache.store(rates, key: key)
            return rates
        } catch {
            if let cached = await cache.load([HistoricalRate].self, key: key) {
                return cached.value
            }
            throw error
        }
    }

    func getRatesStream(from: String, to: String) -> AsyncStream<Double> {
        AsyncStream { continuation in
            let task = Task {
                while !Task.isCancelled {
                    if let rate = try? await getCurrentRate(from: from, to: to) {
                        // ECB updates daily; cosmetic jitter keeps the ticker moving.
                        continuation.yield(rate.rate + Double.random(in: -0.02...0.02))
                    }
                    try? await Task.sleep(for: .seconds(60))
                }
            }
            continuation.onTermination = { _ in
                task.cancel()
            }
        }
    }

    // MARK: Delta helpers

    private func percentChange(to latest: (date: Date, rate: Double), from previous: Double?) -> Double {
        guard let previous, previous != 0 else { return 0 }
        return (latest.rate - previous) / previous * 100
    }

    /// Most recent close at least `days` calendar days before the latest point.
    private func closeAtOrBefore(_ points: [(date: Date, rate: Double)], days: Int) -> Double? {
        guard let latest = points.last else { return nil }
        let cutoff = Calendar.current.date(byAdding: .day, value: -days, to: latest.date)!
        return points.last(where: { $0.date <= cutoff })?.rate ?? points.first?.rate
    }
}

// MARK: - Transfer Provider Service

protocol TransferProviderServiceProtocol {
    func getQuotes(amount: Double, from: String, to: String, deliveryMethod: DeliveryMethod?) async throws -> [TransferQuote]
    func getProviderDetail(id: String) async throws -> ProviderDetail?
    func searchProviders(query: String) -> [TransferProvider]
}

class TransferProviderService: TransferProviderServiceProtocol {
    static let shared = TransferProviderService()
    
    func getQuotes(amount: Double, from: String, to: String, deliveryMethod: DeliveryMethod? = nil) async throws -> [TransferQuote] {
        // Provider quotes are still mock (server proxy /api/quotes is pending),
        // but anchored to the real mid-market rate. See docs/services/exchange-rate.md.
        let baseRate = (try? await ExchangeRateService.shared.getCurrentRate(from: from, to: to).rate) ?? 63.50

        var quotes = MockData.generateQuotes(for: amount, baseRate: baseRate)
        
        if let deliveryMethod {
            // Filter by delivery method (mock - all providers support all methods)
            quotes = quotes.map { quote in
                var q = quote
                q = TransferQuote(
                    providerID: quote.providerID,
                    providerName: quote.providerName,
                    providerIcon: quote.providerIcon,
                    sendAmount: quote.sendAmount,
                    sendCurrency: quote.sendCurrency,
                    receiveCurrency: quote.receiveCurrency,
                    exchangeRate: quote.exchangeRate,
                    fee: quote.fee,
                    feeCurrency: quote.feeCurrency,
                    receiveAmount: quote.receiveAmount,
                    deliveryEstimate: quote.deliveryEstimate,
                    deliveryMethod: deliveryMethod,
                    markup: quote.markup,
                    rateValidUntil: quote.rateValidUntil,
                    isPromotion: quote.isPromotion,
                    promotionText: quote.promotionText
                )
                return q
            }
        }
        
        return quotes
    }
    
    func getProviderDetail(id: String) async throws -> ProviderDetail? {
        try await Task.sleep(for: .milliseconds(200))
        return MockData.providerDetails[id]
    }
    
    func searchProviders(query: String) -> [TransferProvider] {
        guard !query.isEmpty else { return MockData.providers }
        return MockData.providers.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }
}

// MARK: - Analytics Service

protocol AnalyticsServiceProtocol {
    func trackEvent(_ event: AnalyticsEvent)
    func trackProviderClick(providerID: String, source: String)
    func trackComparison(amount: Double, providerCount: Int)
}

enum AnalyticsEvent {
    case appOpen
    case comparisonStarted(amount: Double)
    case providerSelected(providerID: String)
    case transferInitiated(providerID: String, amount: Double)
    case alertCreated(targetRate: Double)
    case premiumUpgrade
    case referralShared
}

class AnalyticsService: AnalyticsServiceProtocol {
    static let shared = AnalyticsService()
    
    func trackEvent(_ event: AnalyticsEvent) {
        // Analytics implementation
        print("Analytics: \(event)")
    }
    
    func trackProviderClick(providerID: String, source: String) {
        print("Provider click: \(providerID) from \(source)")
    }
    
    func trackComparison(amount: Double, providerCount: Int) {
        print("Comparison: €\(amount) across \(providerCount) providers")
    }
}

// MARK: - Notification Service

protocol NotificationServiceProtocol {
    func requestPermission() async -> Bool
    func authorizationStatus() async -> UNAuthorizationStatus
    func cancel(alertID: UUID)
    /// Evaluates enabled, not-yet-triggered alerts against the current rate and fires
    /// a local notification for each that is now due. Returns the IDs fired so the
    /// caller can persist `triggeredAt`. See docs/services/notifications.md.
    @discardableResult
    func checkAndFireDueAlerts(_ alerts: [RateAlert], currentRate: Double) async -> [UUID]
}

class NotificationService: NotificationServiceProtocol {
    static let shared = NotificationService()

    private let center = UNUserNotificationCenter.current()
    private func identifier(_ id: UUID) -> String { "alert-\(id.uuidString)" }

    func requestPermission() async -> Bool {
        (try? await center.requestAuthorization(options: [.alert, .sound, .badge])) ?? false
    }

    func authorizationStatus() async -> UNAuthorizationStatus {
        await center.notificationSettings().authorizationStatus
    }

    func cancel(alertID: UUID) {
        let id = identifier(alertID)
        center.removePendingNotificationRequests(withIdentifiers: [id])
        center.removeDeliveredNotifications(withIdentifiers: [id])
    }

    func checkAndFireDueAlerts(_ alerts: [RateAlert], currentRate: Double) async -> [UUID] {
        guard await authorizationStatus() == .authorized else { return [] }
        var fired: [UUID] = []
        for alert in alerts where alert.isEnabled && alert.triggeredAt == nil {
            let due: Bool
            switch alert.notifyType {
            case .rateAbove: due = currentRate >= alert.targetRate
            case .rateBelow: due = currentRate <= alert.targetRate
            case .providerCheapest: due = false // TODO: needs provider quotes to evaluate
            }
            guard due else { continue }

            let content = UNMutableNotificationContent()
            content.title = "Rate alert hit"
            content.body = String(format: "EUR→PHP is now %.2f (target %.2f).", currentRate, alert.targetRate)
            content.sound = .default
            content.userInfo = ["alertID": alert.id.uuidString]

            let request = UNNotificationRequest(identifier: identifier(alert.id), content: content, trigger: nil)
            try? await center.add(request)
            fired.append(alert.id)
        }
        return fired
    }
}

/// Handles foreground presentation and taps. Tapping deep-links to the Alerts tab.
final class NotificationDelegate: NSObject, UNUserNotificationCenterDelegate {
    var onAlertTapped: ((UUID) -> Void)?

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        [.banner, .sound]
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse) async {
        if let raw = response.notification.request.content.userInfo["alertID"] as? String,
           let id = UUID(uuidString: raw) {
            let handler = onAlertTapped
            await MainActor.run { handler?(id) }
        }
    }
}

// MARK: - Subscription Service

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

struct SubscriptionPlan: Identifiable {
    let id: String
    let name: String
    let price: Double
    let period: String
    let features: [String]
    let isPopular: Bool

    /// StoreKit / Play / Stripe SKU id. See docs/services/subscriptions.md.
    var productID: String {
        id == "yearly" ? "wiserate_premium_yearly" : "wiserate_premium_monthly"
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
}

enum SubscriptionError: LocalizedError {
    case productNotFound
    case verificationFailed
    case cancelled
    case pending
    case purchaseFailed

    var errorDescription: String? {
        switch self {
        case .productNotFound: return "Subscription product not available."
        case .verificationFailed: return "Could not verify the purchase."
        case .cancelled: return "Purchase cancelled."
        case .pending: return "Purchase is pending approval."
        case .purchaseFailed: return "Purchase failed."
        }
    }
}

/// StoreKit 2 implementation. See docs/services/subscriptions.md.
class SubscriptionService: SubscriptionServiceProtocol {
    static let shared = SubscriptionService()

    private var products: [Product] = []
    private var updatesTask: Task<Void, Never>?

    /// Start the transaction-updates listener once, at app launch.
    func startObservingTransactions() {
        guard updatesTask == nil else { return }
        updatesTask = Task.detached {
            for await update in Transaction.updates {
                if case .verified(let txn) = update { await txn.finish() }
            }
        }
    }

    func getAvailablePlans() -> [SubscriptionPlan] {
        SubscriptionPlan.plans
    }

    private func loadProducts() async {
        guard products.isEmpty else { return }
        products = (try? await Product.products(for: SubscriptionPlan.plans.map(\.productID))) ?? []
    }

    func getSubscriptionStatus() async -> SubscriptionStatus {
        for await result in Transaction.currentEntitlements {
            guard case .verified(let txn) = result,
                  txn.revocationDate == nil,
                  (txn.expirationDate ?? .distantFuture) > Date(),
                  let plan = SubscriptionPlan.plans.first(where: { $0.productID == txn.productID })
            else { continue }
            return .premium(plan: plan)
        }
        return .free
    }

    func purchasePlan(_ plan: SubscriptionPlan) async throws {
        await loadProducts()
        guard let product = products.first(where: { $0.id == plan.productID }) else {
            throw SubscriptionError.productNotFound
        }
        switch try await product.purchase() {
        case .success(let verification):
            guard case .verified(let txn) = verification else { throw SubscriptionError.verificationFailed }
            await txn.finish()
        case .userCancelled:
            throw SubscriptionError.cancelled
        case .pending:
            throw SubscriptionError.pending
        @unknown default:
            throw SubscriptionError.purchaseFailed
        }
    }

    func restorePurchases() async throws {
        try await AppStore.sync()
    }
}
