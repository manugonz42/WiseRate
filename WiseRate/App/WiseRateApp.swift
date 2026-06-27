import SwiftUI
import SwiftData
import UserNotifications

@main
struct WiseRateApp: App {
    @StateObject private var navigationState = NavigationState()
    @Environment(\.scenePhase) private var scenePhase
    private let modelContainer: ModelContainer
    private let notificationDelegate = NotificationDelegate()

    init() {
        let schema = Schema(PersistenceSchema.models)
        do {
            modelContainer = try ModelContainer(for: schema)
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
        PersistenceService.shared.configure(context: modelContainer.mainContext)
        UNUserNotificationCenter.current().delegate = notificationDelegate
        SubscriptionService.shared.startObservingTransactions()
    }

    var body: some Scene {
        WindowGroup {
            Group {
                if navigationState.isOnboarding {
                    OnboardingView()
                        .environmentObject(navigationState)
                        .onAppear { navigationState.completeOnboarding() }
                } else {
                    AppRouter(navigationState: navigationState)
                        .environmentObject(navigationState)
                }
            }
            .onAppear {
                // Tapping a rate-alert notification deep-links to the Alerts tab.
                notificationDelegate.onAlertTapped = { _ in
                    navigationState.switchTab(.alerts)
                }
            }
            .onChange(of: scenePhase) { _, phase in
                if phase == .active {
                    Task { await checkDueAlerts() }
                }
            }
        }
        .modelContainer(modelContainer)
    }

    /// Foreground check: fire any rate alerts that are now due, then persist `triggeredAt`.
    @MainActor
    private func checkDueAlerts() async {
        let alerts = PersistenceService.shared.alerts.all()
        guard alerts.contains(where: { $0.isEnabled && $0.triggeredAt == nil }) else { return }
        guard let rate = try? await ExchangeRateService.shared.getCurrentRate(from: "EUR", to: "PHP") else { return }
        let fired = await NotificationService.shared.checkAndFireDueAlerts(alerts, currentRate: rate.rate)
        for id in fired {
            PersistenceService.shared.alerts.markTriggered(id, at: Date())
        }
    }
}
