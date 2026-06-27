import Foundation
import SwiftData

// SwiftData @Model entities for user-owned local data.
// See docs/services/persistence.md. SwiftData needs classes; the domain types in
// Models.swift stay structs, so each entity maps to/from its domain struct and
// feature code keeps consuming the structs.
//
// NOTE: CachedQuote / CachedHistorical are intentionally NOT here — they are served
// by the rate-layer RateCache (disk+memory). SwiftData only owns user data.

@Model
final class SDUserProfile {
    @Attribute(.unique) var id: UUID
    var name: String
    var email: String
    var avatarURL: String?
    var isPremium: Bool
    var preferredSendCurrency: String
    var preferredReceiveCurrency: String
    var defaultDeliveryMethodRaw: String

    init(id: UUID, name: String, email: String, avatarURL: String?, isPremium: Bool,
         preferredSendCurrency: String, preferredReceiveCurrency: String, defaultDeliveryMethodRaw: String) {
        self.id = id
        self.name = name
        self.email = email
        self.avatarURL = avatarURL
        self.isPremium = isPremium
        self.preferredSendCurrency = preferredSendCurrency
        self.preferredReceiveCurrency = preferredReceiveCurrency
        self.defaultDeliveryMethodRaw = defaultDeliveryMethodRaw
    }

    convenience init(scalarsFrom p: UserProfile) {
        self.init(id: p.id, name: p.name, email: p.email, avatarURL: p.avatarURL, isPremium: p.isPremium,
                  preferredSendCurrency: p.preferredSendCurrency, preferredReceiveCurrency: p.preferredReceiveCurrency,
                  defaultDeliveryMethodRaw: p.defaultDeliveryMethod.rawValue)
    }

    func applyScalars(from p: UserProfile) {
        name = p.name
        email = p.email
        avatarURL = p.avatarURL
        isPremium = p.isPremium
        preferredSendCurrency = p.preferredSendCurrency
        preferredReceiveCurrency = p.preferredReceiveCurrency
        defaultDeliveryMethodRaw = p.defaultDeliveryMethod.rawValue
    }

    /// Assemble the full domain profile with collections pulled from the other stores.
    func domain(alerts: [RateAlert], recents: [String], favorites: [String]) -> UserProfile {
        UserProfile(
            id: id, name: name, email: email, avatarURL: avatarURL, isPremium: isPremium,
            preferredSendCurrency: preferredSendCurrency, preferredReceiveCurrency: preferredReceiveCurrency,
            defaultDeliveryMethod: DeliveryMethod(rawValue: defaultDeliveryMethodRaw) ?? .bankTransfer,
            alerts: alerts, recentProviders: recents, favoriteProviders: favorites
        )
    }
}

@Model
final class SDRateAlert {
    @Attribute(.unique) var id: UUID
    var targetRate: Double
    var isEnabled: Bool
    var createdAt: Date
    var triggeredAt: Date?
    var notifyTypeRaw: String

    init(id: UUID, targetRate: Double, isEnabled: Bool, createdAt: Date, triggeredAt: Date?, notifyTypeRaw: String) {
        self.id = id
        self.targetRate = targetRate
        self.isEnabled = isEnabled
        self.createdAt = createdAt
        self.triggeredAt = triggeredAt
        self.notifyTypeRaw = notifyTypeRaw
    }

    convenience init(from a: RateAlert) {
        self.init(id: a.id, targetRate: a.targetRate, isEnabled: a.isEnabled,
                  createdAt: a.createdAt, triggeredAt: a.triggeredAt, notifyTypeRaw: a.notifyType.rawValue)
    }

    var domain: RateAlert {
        RateAlert(id: id, targetRate: targetRate, isEnabled: isEnabled, createdAt: createdAt,
                  triggeredAt: triggeredAt,
                  notifyType: RateAlert.AlertNotifyType(rawValue: notifyTypeRaw) ?? .rateAbove)
    }
}

@Model
final class SDFavoriteProvider {
    @Attribute(.unique) var providerID: String
    var addedAt: Date

    init(providerID: String, addedAt: Date) {
        self.providerID = providerID
        self.addedAt = addedAt
    }
}

@Model
final class SDRecentProvider {
    @Attribute(.unique) var providerID: String
    var lastViewedAt: Date

    init(providerID: String, lastViewedAt: Date) {
        self.providerID = providerID
        self.lastViewedAt = lastViewedAt
    }
}

@Model
final class SDSetting {
    @Attribute(.unique) var key: String
    var value: String

    init(key: String, value: String) {
        self.key = key
        self.value = value
    }
}

/// Shared schema for the app's single ModelContainer.
enum PersistenceSchema {
    static let models: [any PersistentModel.Type] = [
        SDUserProfile.self, SDRateAlert.self, SDFavoriteProvider.self, SDRecentProvider.self, SDSetting.self
    ]
}
