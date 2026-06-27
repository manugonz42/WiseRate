import SwiftUI
import SwiftData

@main
struct WiseRateApp: App {
    @StateObject private var navigationState = NavigationState()
    private let modelContainer: ModelContainer

    init() {
        let schema = Schema(PersistenceSchema.models)
        do {
            modelContainer = try ModelContainer(for: schema)
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
        PersistenceService.shared.configure(context: modelContainer.mainContext)
    }

    var body: some Scene {
        WindowGroup {
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
        .modelContainer(modelContainer)
    }
}
