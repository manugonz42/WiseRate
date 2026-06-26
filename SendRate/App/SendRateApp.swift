import SwiftUI

@main
struct SendRateApp: App {
    @StateObject private var navigationState = NavigationState()
    
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
        }
    }
}
