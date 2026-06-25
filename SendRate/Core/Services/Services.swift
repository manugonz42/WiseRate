import Foundation
import SwiftUI

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
