import SwiftUI

@main
struct SendRateApp: App {
    @State private var navigationState = NavigationState()
    
    var body: some Scene {
        WindowGroup {
            if navigationState.isOnboarding {
                OnboardingView(viewModel: OnboardingViewModel())
                    .environmentObject(navigationState)
                    .onAppear {
                        navigationState.completeOnboarding()
                    }
            } else {
                AppRouter(navigationState: navigationState)
                    .environmentObject(navigationState)
            }
        }
    }
}
