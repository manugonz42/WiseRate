import Foundation
import SwiftUI

// MARK: - Exchange Rate Service

protocol ExchangeRateServiceProtocol {
    func getCurrentRate(from: String, to: String) async throws -> Double
    func getHistoricalRates(from: String, to: String, timeFrame: TimeFrame) async throws -> [HistoricalRate]
    func getRatesStream(from: String, to: String) -> AsyncStream<Double>
}

class ExchangeRateService: ExchangeRateServiceProtocol {
    static let shared = ExchangeRateService()
    
    private var cachedRate: Double?
    private var lastFetch: Date?
    private let cacheInterval: TimeInterval = 300
    
    func getCurrentRate(from: String, to: String) async throws -> Double {
        if let cached = cachedRate, let lastFetch, Date().timeIntervalSince(lastFetch) < cacheInterval {
            return cached
        }
        
        // Simulate API call
        try await Task.sleep(for: .milliseconds(500))
        
        let rate = 63.50 + Double.random(in: -0.5...0.5)
        cachedRate = rate
        lastFetch = Date()
        return rate
    }
    
    func getHistoricalRates(from: String, to: String, timeFrame: TimeFrame) async throws -> [HistoricalRate] {
        try await Task.sleep(for: .milliseconds(300))
        return MockData.generateHistoricalRates(timeFrame: timeFrame)
    }
    
    func getRatesStream(from: String, to: String) -> AsyncStream<Double> {
        AsyncStream { continuation in
            let task = Task {
                var rate = 63.50
                while !Task.isCancelled {
                    rate += Double.random(in: -0.05...0.05)
                    continuation.yield(rate)
                    try? await Task.sleep(for: .seconds(5))
                }
            }
            continuation.onTermination = { _ in
                task.cancel()
            }
        }
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
        try await Task.sleep(for: .milliseconds(800))
        
        var quotes = MockData.generateQuotes(for: amount)
        
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
    func scheduleAlert(id: UUID, title: String, body: String, date: Date)
    func cancelAlert(id: UUID)
    func scheduleRateCheck()
}

class NotificationService: NotificationServiceProtocol {
    static let shared = NotificationService()
    
    func requestPermission() async -> Bool {
        return true
    }
    
    func scheduleAlert(id: UUID, title: String, body: String, date: Date) {
        print("Scheduled alert: \(title) at \(date)")
    }
    
    func cancelAlert(id: UUID) {
        print("Cancelled alert: \(id)")
    }
    
    func scheduleRateCheck() {
        print("Scheduled rate check")
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

class SubscriptionService: SubscriptionServiceProtocol {
    static let shared = SubscriptionService()
    
    func getSubscriptionStatus() async -> SubscriptionStatus {
        return .free
    }
    
    func getAvailablePlans() -> [SubscriptionPlan] {
        SubscriptionPlan.plans
    }
    
    func purchasePlan(_ plan: SubscriptionPlan) async throws {
        try await Task.sleep(for: .seconds(1))
    }
    
    func restorePurchases() async throws {
        try await Task.sleep(for: .seconds(1))
    }
}
