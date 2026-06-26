import SwiftUI
import UserNotifications

@main
struct SendRateApp: App {
    @StateObject private var navigationState = NavigationState()
    @Environment(\.scenePhase) private var scenePhase

    init() {
        UNUserNotificationCenter.current().delegate = NotificationService.shared
        _ = SubscriptionService.shared   // starts the Transaction.updates listener
    }

    var body: some Scene {
        WindowGroup {
            Group {
                if navigationState.isOnboarding {
                    OnboardingView()
                        .environmentObject(navigationState)
                        .onAppear {
                            navigationState.completeOnboarding()
                        }
                } else {
                    AppRouter(navigationState: navigationState)
                        .environmentObject(navigationState)
                }
            }
            .modelContainer(PersistenceService.shared.container)
            .task {
                NotificationService.shared.onAlertTapped = { id in
                    navigationState.openAlert(id: id)
                }
            }
        }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active {
                Task { await NotificationService.shared.checkAndFireDueAlerts() }
            }
        }
    }
}
