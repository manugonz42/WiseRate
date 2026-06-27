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
        if isFavorite {
            persistence.favorites.remove(provider.id)
        } else {
            persistence.favorites.add(provider.id)
        }
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
    @Published var alerts: [RateAlert] = PersistenceService.shared.alerts.all()
    @Published var isCreatingAlert: Bool = false
    @Published var newAlertRate: String = ""
    @Published var newAlertType: RateAlert.AlertNotifyType = .rateAbove

    private let notificationService = NotificationService.shared
    private let persistence = PersistenceService.shared

    var activeAlerts: [RateAlert] {
        alerts.filter(\.isEnabled)
    }

    var triggeredAlerts: [RateAlert] {
        alerts.filter { $0.triggeredAt != nil }
    }

    func load() {
        alerts = persistence.alerts.all()
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

        persistence.alerts.add(alert)
        alerts = persistence.alerts.all()
        await notificationService.requestPermission()
        newAlertRate = ""
        isCreatingAlert = false
    }

    func toggleAlert(_ alert: RateAlert) {
        persistence.alerts.toggle(alert)
        alerts = persistence.alerts.all()
    }

    func deleteAlert(_ alert: RateAlert) {
        persistence.alerts.delete(alert)
        alerts = persistence.alerts.all()
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
            subscriptionStatus = .premium(plan: plan)
        } catch {
            print("Error: \(error)")
        }
        isLoading = false
    }
}

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var user: UserProfile = PersistenceService.shared.profile.get()
    @Published var isEditing: Bool = false

    private let persistence = PersistenceService.shared

    func load() {
        user = persistence.profile.get()
    }

    func saveProfile() {
        persistence.profile.save(user)
        isEditing = false
    }
}

@MainActor
class SettingsViewModel: ObservableObject {
    @Published var notificationsEnabled: Bool { didSet { persistence.settings.setBool(Keys.notifications, notificationsEnabled) } }
    @Published var darkModeEnabled: Bool { didSet { persistence.settings.setBool(Keys.darkMode, darkModeEnabled) } }
    @Published var defaultAmount: String { didSet { persistence.settings.set(Keys.defaultAmount, defaultAmount) } }
    @Published var language: String { didSet { persistence.settings.set(Keys.language, language) } }
    @Published var isClearingCache: Bool = false

    private let persistence = PersistenceService.shared

    private enum Keys {
        static let notifications = "notificationsEnabled"
        static let darkMode = "darkModeEnabled"
        static let defaultAmount = "defaultAmount"
        static let language = "language"
    }

    init() {
        // Assignments in init do not fire didSet, so this loads without re-persisting.
        let s = PersistenceService.shared.settings
        notificationsEnabled = s.bool(Keys.notifications, default: true)
        darkModeEnabled = s.bool(Keys.darkMode, default: true)
        defaultAmount = s.string(Keys.defaultAmount) ?? "1000"
        language = s.string(Keys.language) ?? "English"
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
        "https://wiserate.app/ref/\(referralCode)"
    }
    
    func copyCode() {
        UIPasteboard.general.string = referralCode
    }
    
    func share() {
        showShareSheet = true
    }
}
