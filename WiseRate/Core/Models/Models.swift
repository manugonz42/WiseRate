import Foundation
import SwiftUI

struct TransferProvider: Identifiable, Hashable {
    let id: String
    let name: String
    let iconName: String
    let brandColor: Color
    let trustScore: Double
    let userRating: Double
    let websiteURL: String
    let affiliateURL: String?
    let isSponsored: Bool = false
    
    enum Color: String, Hashable {
        case blue, green, purple, orange, red, teal, indigo, pink, yellow, cyan
        
        var swiftUIColor: SwiftUI.Color {
            switch self {
            case .blue: return .blue
            case .green: return .green
            case .purple: return .purple
            case .orange: return .orange
            case .red: return .red
            case .teal: return .teal
            case .indigo: return .indigo
            case .pink: return .pink
            case .yellow: return .yellow
            case .cyan: return .cyan
            }
        }
    }
}

struct TransferQuote: Identifiable {
    let id = UUID()
    let providerID: String
    let providerName: String
    let providerIcon: String
    let sendAmount: Double
    let sendCurrency: String
    let receiveCurrency: String
    let exchangeRate: Double
    let fee: Double
    let feeCurrency: String
    let receiveAmount: Double
    let deliveryEstimate: DeliveryEstimate
    let deliveryMethod: DeliveryMethod
    let markup: Double
    let rateValidUntil: Date?
    let isPromotion: Bool
    let promotionText: String?
    
    var totalCost: Double {
        fee + (sendAmount * markup)
    }
    
    var effectiveRate: Double {
        receiveAmount / sendAmount
    }
    
    var markupPercentage: Double {
        markup * 100
    }
}

struct DeliveryEstimate: Hashable {
    let minMinutes: Int
    let maxMinutes: Int
    let label: String
    
    static let instant = DeliveryEstimate(minMinutes: 0, maxMinutes: 5, label: "Instant")
    static let minutes = DeliveryEstimate(minMinutes: 5, maxMinutes: 60, label: "Minutes")
    static let hours = DeliveryEstimate(minMinutes: 60, maxMinutes: 1440, label: "1-24 hours")
    static let sameDay = DeliveryEstimate(minMinutes: 1440, maxMinutes: 2880, label: "Same day")
    static let nextDay = DeliveryEstimate(minMinutes: 2880, maxMinutes: 4320, label: "1-2 days")
    static let twoToThreeDays = DeliveryEstimate(minMinutes: 4320, maxMinutes: 10080, label: "2-3 days")
    static let threeToFiveDays = DeliveryEstimate(minMinutes: 10080, maxMinutes: 15120, label: "3-5 days")
}

enum DeliveryMethod: String, CaseIterable, Hashable {
    case bankTransfer = "Bank Transfer"
    case cashPickup = "Cash Pickup"
    case mobileWallet = "Mobile Wallet"
    case homeDelivery = "Home Delivery"
    case debitCard = "Debit Card"
    
    var icon: String {
        switch self {
        case .bankTransfer: return "building.columns"
        case .cashPickup: return "banknote"
        case .mobileWallet: return "iphone"
        case .homeDelivery: return "house"
        case .debitCard: return "creditcard"
        }
    }
}

struct HistoricalRate: Identifiable, Codable {
    let id = UUID()
    let date: Date
    let rate: Double
    let provider: String?

    private enum CodingKeys: String, CodingKey { case date, rate, provider }
}

/// Current mid-market snapshot for a currency pair. See docs/architecture/data-model.md.
struct Rate: Codable {
    let rate: Double
    let timestamp: Date
    let delta24h: Double
    let delta7d: Double
    let isStale: Bool
}

struct RateAlert: Identifiable {
    var id: UUID = UUID()
    var targetRate: Double
    var isEnabled: Bool
    let createdAt: Date
    var triggeredAt: Date?
    var notifyType: AlertNotifyType
    
    enum AlertNotifyType: String, CaseIterable {
        case rateAbove = "Rate Above"
        case rateBelow = "Rate Below"
        case providerCheapest = "Provider is Cheapest"
    }
}

struct UserProfile: Identifiable {
    let id: UUID
    var name: String
    var email: String
    var avatarURL: String?
    var isPremium: Bool
    var preferredSendCurrency: String
    var preferredReceiveCurrency: String
    var defaultDeliveryMethod: DeliveryMethod
    var alerts: [RateAlert]
    var recentProviders: [String]
    var favoriteProviders: [String]
    
    static let mock = UserProfile(
        id: UUID(),
        name: "Maria Santos",
        email: "maria@example.com",
        avatarURL: nil,
        isPremium: false,
        preferredSendCurrency: "EUR",
        preferredReceiveCurrency: "PHP",
        defaultDeliveryMethod: .mobileWallet,
        alerts: [],
        recentProviders: ["wise", "remitly", "xoom"],
        favoriteProviders: ["wise", "remitly"]
    )
}

struct ComparisonResult: Identifiable {
    let id = UUID()
    let amount: Double
    let fromCurrency: String
    let toCurrency: String
    let quotes: [TransferQuote]
    let timestamp: Date
    
    var bestQuote: TransferQuote? {
        quotes.max(by: { $0.receiveAmount < $1.receiveAmount })
    }
    
    var cheapestQuote: TransferQuote? {
        quotes.min(by: { $0.totalCost < $1.totalCost })
    }
    
    var fastestQuote: TransferQuote? {
        quotes.min(by: { $0.deliveryEstimate.maxMinutes < $1.deliveryEstimate.maxMinutes })
    }
}

struct SponsoredOffer: Identifiable {
    let id = UUID()
    let providerName: String
    let providerIcon: String
    let headline: String
    let description: String
    let ctaText: String
    let affiliateURL: String
    let validUntil: Date
    let discountPercentage: Double?
}

struct ProviderDetail: Identifiable {
    let id: String
    let name: String
    let iconName: String
    let brandColor: TransferProvider.Color
    let description: String
    let trustScore: Double
    let userRating: Double
    let reviewCount: Int
    let transferLimits: TransferLimits
    let fees: [FeeStructure]
    let deliveryMethods: [DeliveryMethod]
    let pros: [String]
    let cons: [String]
    let historicalRates: [HistoricalRate]
    let websiteURL: String
    let affiliateURL: String?
    
    struct TransferLimits {
        let minAmount: Double
        let maxAmount: Double
        let currency: String
    }
    
    struct FeeStructure: Identifiable {
        let id = UUID()
        let method: DeliveryMethod
        let fixedFee: Double
        let percentageFee: Double
        let description: String
    }
}
