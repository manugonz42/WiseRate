import Foundation
import SwiftUI

@MainActor
class HomeViewModel: ObservableObject {
    @Published var amount: String = "1000"
    @Published var fromCurrency: String = "EUR"
    @Published var toCurrency: String = "PHP"
    @Published var selectedDeliveryMethod: DeliveryMethod? = nil
    @Published var quotes: [TransferQuote] = []
    @Published var bestQuote: TransferQuote?
    @Published var isLoading: Bool = false
    @Published var currentRate: Double = 63.50
    @Published var rateChange24h: Double = 0.5
    @Published var rateStale: Bool = false
    @Published var rateTimestamp: Date? = nil
    @Published var historicalRates: [HistoricalRate] = []
    @Published var sponsoredOffers: [SponsoredOffer] = MockData.sponsoredOffers
    @Published var selectedTimeFrame: TimeFrame = .day24
    
    private let rateService = ExchangeRateService.shared
    private let providerService = TransferProviderService.shared
    private let analyticsService = AnalyticsService.shared
    
    var amountValue: Double {
        Double(amount) ?? 0
    }
    
    var formattedRate: String {
        String(format: "%.2f", currentRate)
    }
    
    var formattedRateChange: String {
        let sign = rateChange24h >= 0 ? "+" : ""
        return "\(sign)\(String(format: "%.2f", rateChange24h))%"
    }
    
    var topProviders: [TransferQuote] {
        Array(quotes.sorted { $0.receiveAmount > $1.receiveAmount }.prefix(3))
    }
    
    func loadInitialData() async {
        analyticsService.trackEvent(.appOpen)
        
        async let rateTask = fetchCurrentRate()
        async let ratesTask = fetchHistoricalRates()
        
        await rateTask
        await ratesTask
    }
    
    func fetchCurrentRate() async {
        do {
            let rate = try await rateService.getCurrentRate(from: fromCurrency, to: toCurrency)
            currentRate = rate.rate
            rateChange24h = rate.delta24h
            rateStale = rate.isStale
            rateTimestamp = rate.timestamp
        } catch {
            print("Error fetching rate: \(error)")
        }
    }
    
    func fetchHistoricalRates() async {
        do {
            historicalRates = try await rateService.getHistoricalRates(from: fromCurrency, to: toCurrency, timeFrame: selectedTimeFrame)
        } catch {
            print("Error fetching historical rates: \(error)")
        }
    }
    
    func compare() async {
        guard amountValue > 0 else { return }
        
        isLoading = true
        analyticsService.trackEvent(.comparisonStarted(amount: amountValue))
        
        do {
            quotes = try await providerService.getQuotes(
                amount: amountValue,
                from: fromCurrency,
                to: toCurrency,
                deliveryMethod: selectedDeliveryMethod
            )
            bestQuote = quotes.max(by: { $0.receiveAmount < $1.receiveAmount })
            analyticsService.trackComparison(amount: amountValue, providerCount: quotes.count)
        } catch {
            print("Error comparing: \(error)")
        }
        
        isLoading = false
    }
    
    func updateTimeFrame(_ timeFrame: TimeFrame) async {
        selectedTimeFrame = timeFrame
        await fetchHistoricalRates()
    }
    
    func swapCurrencies() {
        let temp = fromCurrency
        fromCurrency = toCurrency
        toCurrency = temp
    }
}

@MainActor
class ComparisonViewModel: ObservableObject {
    @Published var quotes: [TransferQuote] = []
    @Published var sortOption: SortOption = .highestPHP
    @Published var selectedDeliveryMethod: DeliveryMethod? = nil
    @Published var isLoading: Bool = false
    @Published var searchText: String = ""
    
    private let providerService = TransferProviderService.shared
    
    var filteredQuotes: [TransferQuote] {
        var result = quotes
        
        if !searchText.isEmpty {
            result = result.filter { $0.providerName.localizedCaseInsensitiveContains(searchText) }
        }
        
        switch sortOption {
        case .highestPHP:
            result.sort { $0.receiveAmount > $1.receiveAmount }
        case .lowestFee:
            result.sort { $0.totalCost < $1.totalCost }
        case .fastest:
            result.sort { $0.deliveryEstimate.maxMinutes < $1.deliveryEstimate.maxMinutes }
        case .bestRate:
            result.sort { $0.effectiveRate > $1.effectiveRate }
        case .recommended:
            result.sort { $0.receiveAmount > $1.receiveAmount }
        }
        
        return result
    }
    
    var bestQuote: TransferQuote? {
        quotes.max(by: { $0.receiveAmount < $1.receiveAmount })
    }
    
    func loadQuotes(amount: Double) async {
        isLoading = true
        do {
            quotes = try await providerService.getQuotes(
                amount: amount,
                from: "EUR",
                to: "PHP",
                deliveryMethod: selectedDeliveryMethod
            )
        } catch {
            print("Error: \(error)")
        }
        isLoading = false
    }
}

@MainActor
class ProviderDetailViewModel: ObservableObject {
    @Published var provider: ProviderDetail?
    @Published var isLoading: Bool = false
    @Published var selectedTimeFrame: TimeFrame = .month30
    @Published var isFavorite: Bool = false

    private let providerService = TransferProviderService.shared
    private let analyticsService = AnalyticsService.shared
    private let persistence = PersistenceService.shared

    var displayRates: [HistoricalRate] {
        guard let provider else { return [] }
        return provider.historicalRates
    }

    func loadProvider(id: String) async {
        isLoading = true
        provider = try? await providerService.getProviderDetail(id: id)
        isFavorite = persistence.favorites.isFavorite(id)
        persistence.recents.record(id)
        isLoading = false
    }

    func toggleFavorite() {
        guard let provider else { return }
        persistence.favorites.toggle(provider.id)
        isFavorite = persistence.favorites.isFavorite(provider.id)
    }

    func trackClick(source: String) {
        guard let provider else { return }
        analyticsService.trackProviderClick(providerID: provider.id, source: source)
    }
}

@MainActor
class AnalyticsViewModel: ObservableObject {
    @Published var historicalRates: [HistoricalRate] = []
    @Published var selectedTimeFrame: TimeFrame = .month30
    @Published var isLoading: Bool = false
    
    private let rateService = ExchangeRateService.shared
    
    var rateStats: (high: Double, low: Double, avg: Double, change: Double) {
        guard !historicalRates.isEmpty else { return (0, 0, 0, 0) }
        let rates = historicalRates.map(\.rate)
        let high = rates.max() ?? 0
        let low = rates.min() ?? 0
        let avg = rates.reduce(0, +) / Double(rates.count)
        let change = ((rates.last ?? 0) - (rates.first ?? 0)) / (rates.first ?? 1) * 100
        return (high, low, avg, change)
    }
    
    func loadRates() async {
        isLoading = true
        do {
            historicalRates = try await rateService.getHistoricalRates(from: "EUR", to: "PHP", timeFrame: selectedTimeFrame)
        } catch {
            print("Error: \(error)")
        }
        isLoading = false
    }
}

@MainActor
class AlertsViewModel: ObservableObject {
    @Published var alerts: [RateAlert] = []
    @Published var isCreatingAlert: Bool = false
    @Published var newAlertRate: String = ""
    @Published var newAlertType: RateAlert.AlertNotifyType = .rateAbove

    private let notificationService = NotificationService.shared
    private let store = PersistenceService.shared

    init() {
        alerts = store.alerts.list()
    }

    var activeAlerts: [RateAlert] {
        alerts.filter(\.isEnabled)
    }

    var triggeredAlerts: [RateAlert] {
        alerts.filter { $0.triggeredAt != nil }
    }

    func createAlert() async {
        guard let rate = Double(newAlertRate), rate > 0 else { return }

        let alert = RateAlert(
            targetRate: rate,
            isEnabled: true,
            createdAt: Date(),
            triggeredAt: nil,
            notifyType: newAlertType
        )

        store.alerts.create(alert)
        alerts = store.alerts.list()
        _ = await notificationService.requestPermission()
        notificationService.schedule(alert: alert)
        newAlertRate = ""
        isCreatingAlert = false
    }

    func toggleAlert(_ alert: RateAlert) {
        let enabled = !alert.isEnabled
        store.alerts.setEnabled(id: alert.id, enabled)
        alerts = store.alerts.list()
        if enabled, let updated = alerts.first(where: { $0.id == alert.id }) {
            notificationService.schedule(alert: updated)
        } else {
            notificationService.cancel(alertID: alert.id)
        }
    }

    func deleteAlert(_ alert: RateAlert) {
        store.alerts.delete(id: alert.id)
        notificationService.cancel(alertID: alert.id)
        alerts = store.alerts.list()
    }

    /// Fires any due alerts against the latest rate, then refreshes the list.
    func refresh() async {
        await notificationService.checkAndFireDueAlerts()
        alerts = store.alerts.list()
    }
}

@MainActor
class PremiumViewModel: ObservableObject {
    @Published var subscriptionStatus: SubscriptionStatus = .free
    @Published var plans: [SubscriptionPlan] = SubscriptionPlan.plans
    @Published var isLoading: Bool = false
    @Published var selectedPlan: SubscriptionPlan?
    
    private let subscriptionService = SubscriptionService.shared
    
    var isPremium: Bool {
        if case .premium = subscriptionStatus { return true }
        return false
    }
    
    func loadStatus() async {
        subscriptionStatus = await subscriptionService.getSubscriptionStatus()
    }
    
    func purchase() async {
        guard let plan = selectedPlan else { return }
        isLoading = true
        do {
            try await subscriptionService.purchasePlan(plan)
            subscriptionStatus = await subscriptionService.getSubscriptionStatus()
        } catch {
            print("Error: \(error)")
        }
        isLoading = false
    }

    func restore() async {
        isLoading = true
        do {
            try await subscriptionService.restorePurchases()
            subscriptionStatus = await subscriptionService.getSubscriptionStatus()
        } catch {
            print("Error: \(error)")
        }
        isLoading = false
    }
}

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var user: UserProfile
    @Published var isEditing: Bool = false

    private let store = PersistenceService.shared

    init() {
        user = PersistenceService.shared.profile.load()
    }

    func saveProfile() {
        store.profile.save(user)
        isEditing = false
    }
}

@MainActor
class SettingsViewModel: ObservableObject {
    @Published var notificationsEnabled: Bool = true { didSet { store.settings.set("notificationsEnabled", notificationsEnabled) } }
    @Published var darkModeEnabled: Bool = true { didSet { store.settings.set("darkModeEnabled", darkModeEnabled) } }
    @Published var defaultAmount: String = "1000" { didSet { store.settings.set("defaultAmount", defaultAmount) } }
    @Published var language: String = "English" { didSet { store.settings.set("language", language) } }
    @Published var isClearingCache: Bool = false

    private let store = PersistenceService.shared

    init() {
        let settings = store.settings
        notificationsEnabled = settings.bool("notificationsEnabled") ?? true
        darkModeEnabled = settings.bool("darkModeEnabled") ?? true
        defaultAmount = settings.string("defaultAmount") ?? "1000"
        language = settings.string("language") ?? "English"
    }

    func clearCache() async {
        isClearingCache = true
        try? await Task.sleep(for: .seconds(1))
        isClearingCache = false
    }
}

@MainActor
class OnboardingViewModel: ObservableObject {
    @Published var currentPage: Int = 0
    @Published var selectedSendCurrency: String = "EUR"
    @Published var selectedReceiveCurrency: String = "PHP"
    @Published var notificationsEnabled: Bool = true
    @Published var isCompleted: Bool = false
    
    let pages = OnboardingPage.allCases
    
    func nextPage() {
        if currentPage < pages.count - 1 {
            withAnimation {
                currentPage += 1
            }
        } else {
            complete()
        }
    }
    
    func previousPage() {
        if currentPage > 0 {
            withAnimation {
                currentPage -= 1
            }
        }
    }
    
    func complete() {
        isCompleted = true
    }
    
    func skip() {
        isCompleted = true
    }
}

@MainActor
class ReferralViewModel: ObservableObject {
    @Published var referralCode: String = "MARIA2024"
    @Published var referralCount: Int = 3
    @Published var referralEarnings: Double = 15.00
    @Published var showShareSheet: Bool = false
    
    var referralLink: String {
        "https://sendrate.app/ref/\(referralCode)"
    }
    
    func copyCode() {
        UIPasteboard.general.string = referralCode
    }
    
    func share() {
        showShareSheet = true
    }
}
