import SwiftUI

enum Route: Hashable {
    case home
    case comparison(amount: Double)
    case providerDetail(String)
    case analytics
    case alerts
    case premium
    case profile
    case settings
    case referral
}

class NavigationState: ObservableObject {
    @Published var selectedTab: TabItem = .home
    @Published var path: [Route] = []
    @Published var isOnboarding: Bool = true
    @Published var presentingSheet: SheetType?
    
    enum SheetType: Identifiable {
        case premium
        case settings
        case referral
        case share(String)
        
        var id: String {
            switch self {
            case .premium: return "premium"
            case .settings: return "settings"
            case .referral: return "referral"
            case .share: return "share"
            }
        }
    }
    
    func navigate(to route: Route) {
        path.append(route)
    }
    
    func navigateBack() {
        if !path.isEmpty {
            path.removeLast()
        }
    }
    
    func navigateToRoot() {
        path.removeAll()
    }
    
    func switchTab(_ tab: TabItem) {
        selectedTab = tab
        path.removeAll()
    }

    /// Deep link from a tapped rate-alert notification (`sendrate://alert/<id>`).
    func openAlert(id: UUID) {
        selectedTab = .alerts
        path.removeAll()
        presentingSheet = nil
    }
    
    func presentSheet(_ sheet: SheetType) {
        presentingSheet = sheet
    }
    
    func dismissSheet() {
        presentingSheet = nil
    }
    
    func completeOnboarding() {
        isOnboarding = false
    }
}

struct AppRouter: View {
    @ObservedObject var navigationState: NavigationState
    
    var body: some View {
        NavigationStack(path: $navigationState.path) {
            TabView(selection: $navigationState.selectedTab) {
                HomeView()
                    .tag(TabItem.home)
                    .tabItem {
                        Label(TabItem.home.rawValue, systemImage: navigationState.selectedTab == .home ? TabItem.home.selectedIcon : TabItem.home.icon)
                    }
                
                ComparisonView()
                    .tag(TabItem.compare)
                    .tabItem {
                        Label(TabItem.compare.rawValue, systemImage: navigationState.selectedTab == .compare ? TabItem.compare.selectedIcon : TabItem.compare.icon)
                    }
                
                AnalyticsView()
                    .tag(TabItem.analytics)
                    .tabItem {
                        Label(TabItem.analytics.rawValue, systemImage: navigationState.selectedTab == .analytics ? TabItem.analytics.selectedIcon : TabItem.analytics.icon)
                    }
                
                AlertsView()
                    .tag(TabItem.alerts)
                    .tabItem {
                        Label(TabItem.alerts.rawValue, systemImage: navigationState.selectedTab == .alerts ? TabItem.alerts.selectedIcon : TabItem.alerts.icon)
                    }
                
                ProfileView()
                    .tag(TabItem.profile)
                    .tabItem {
                        Label(TabItem.profile.rawValue, systemImage: navigationState.selectedTab == .profile ? TabItem.profile.selectedIcon : TabItem.profile.icon)
                    }
            }
            .tint(Color.brand.primary)
            .navigationDestination(for: Route.self) { route in
                destinationView(for: route)
            }
        }
        .sheet(item: $navigationState.presentingSheet) { sheet in
            sheetView(for: sheet)
        }
    }
    
    @ViewBuilder
    private func destinationView(for route: Route) -> some View {
        switch route {
        case .home:
            HomeView()
        case .comparison(let amount):
            ComparisonView(initialAmount: amount)
        case .providerDetail(let id):
            ProviderDetailView(providerID: id)
        case .analytics:
            AnalyticsView()
        case .alerts:
            AlertsView()
        case .premium:
            PremiumView()
        case .profile:
            ProfileView()
        case .settings:
            SettingsView()
        case .referral:
            ReferralView()
        }
    }
    
    @ViewBuilder
    private func sheetView(for sheet: NavigationState.SheetType) -> some View {
        switch sheet {
        case .premium:
            PremiumView()
        case .settings:
            SettingsView()
        case .referral:
            ReferralView()
        case .share(let code):
            ShareSheet(items: [code])
        }
    }
}

struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
