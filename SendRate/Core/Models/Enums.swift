import Foundation

enum SortOption: String, CaseIterable {
    case highestPHP = "Highest PHP"
    case lowestFee = "Lowest Fee"
    case fastest = "Fastest"
    case bestRate = "Best Rate"
    case recommended = "Recommended"
    
    var icon: String {
        switch self {
        case .highestPHP: return "arrow.up.right"
        case .lowestFee: return "dollarsign.circle"
        case .fastest: return "bolt.fill"
        case .bestRate: return "chart.line.uptrend.xyaxis"
        case .recommended: return "star.fill"
        }
    }
}

enum TimeFrame: String, CaseIterable {
    case day24 = "24H"
    case week7 = "7D"
    case month30 = "30D"
    case month90 = "90D"
    case year1 = "1Y"
}

enum TabItem: String, CaseIterable {
    case home = "Home"
    case compare = "Compare"
    case analytics = "Analytics"
    case alerts = "Alerts"
    case profile = "Profile"
    
    var icon: String {
        switch self {
        case .home: return "house"
        case .compare: return "arrow.left.arrow.right"
        case .analytics: return "chart.line.uptrend.xyaxis"
        case .alerts: return "bell"
        case .profile: return "person"
        }
    }
    
    var selectedIcon: String {
        switch self {
        case .home: return "house.fill"
        case .compare: return "arrow.left.arrow.right"
        case .analytics: return "chart.line.uptrend.xyaxis"
        case .alerts: return "bell.fill"
        case .profile: return "person.fill"
        }
    }
}

enum OnboardingPage: Int, CaseIterable {
    case welcome = 0
    case features = 1
    case currency = 2
    case notifications = 3
    
    var title: String {
        switch self {
        case .welcome: return "Welcome to SendRate"
        case .features: return "Compare & Save"
        case .currency: return "Your Currencies"
        case .notifications: return "Stay Updated"
        }
    }
    
    var subtitle: String {
        switch self {
        case .welcome: return "Find the cheapest way to send money from Spain to the Philippines"
        case .features: return "Compare exchange rates, fees, and delivery times across 15+ providers"
        case .currency: return "Set your default sending and receiving currencies"
        case .notifications: return "Get alerts when rates hit your target"
        }
    }
    
    var icon: String {
        switch self {
        case .welcome: return "paperplane.fill"
        case .features: return "chart.bar.doc.horizontal"
        case .currency: return "eurosign.arrow.trianglehead.circlepath"
        case .notifications: return "bell.badge"
        }
    }
}

enum AlertFrequency: String, CaseIterable {
    case immediate = "Immediate"
    case hourly = "Hourly Digest"
    case daily = "Daily Digest"
}
