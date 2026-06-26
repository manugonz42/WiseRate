import Foundation
import SwiftData

// SwiftData storage entities. Internal to the persistence layer — feature code uses
// the plain structs in Models.swift via PersistenceService, never these directly.
// Schema mirrors docs/services/persistence.md.

@Model
final class StoredProfile {
    @Attribute(.unique) var id: UUID
    var name: String
    var email: String
    var avatarURL: String?
    var isPremium: Bool
    var preferredSendCurrency: String
    var preferredReceiveCurrency: String
    var defaultDeliveryMethodRaw: String

    init(id: UUID, name: String, email: String, avatarURL: String?, isPremium: Bool,
         preferredSendCurrency: String, preferredReceiveCurrency: String,
         defaultDeliveryMethodRaw: String) {
        self.id = id
        self.name = name
        self.email = email
        self.avatarURL = avatarURL
        self.isPremium = isPremium
        self.preferredSendCurrency = preferredSendCurrency
        self.preferredReceiveCurrency = preferredReceiveCurrency
        self.defaultDeliveryMethodRaw = defaultDeliveryMethodRaw
    }

    convenience init(from p: UserProfile) {
        self.init(id: p.id, name: p.name, email: p.email, avatarURL: p.avatarURL,
                  isPremium: p.isPremium, preferredSendCurrency: p.preferredSendCurrency,
                  preferredReceiveCurrency: p.preferredReceiveCurrency,
                  defaultDeliveryMethodRaw: p.defaultDeliveryMethod.rawValue)
    }

    /// Copies editable fields from a domain profile (favorites/recents/alerts live in their
    /// own entities, so they're not touched here).
    func apply(_ p: UserProfile) {
        name = p.name
        email = p.email
        avatarURL = p.avatarURL
        isPremium = p.isPremium
        preferredSendCurrency = p.preferredSendCurrency
        preferredReceiveCurrency = p.preferredReceiveCurrency
        defaultDeliveryMethodRaw = p.defaultDeliveryMethod.rawValue
    }
}

@Model
final class StoredAlert {
    @Attribute(.unique) var id: UUID
    var targetRate: Double
    var isEnabled: Bool
    var createdAt: Date
    var triggeredAt: Date?
    var notifyTypeRaw: String

    init(id: UUID, targetRate: Double, isEnabled: Bool, createdAt: Date,
         triggeredAt: Date?, notifyTypeRaw: String) {
        self.id = id
        self.targetRate = targetRate
        self.isEnabled = isEnabled
        self.createdAt = createdAt
        self.triggeredAt = triggeredAt
        self.notifyTypeRaw = notifyTypeRaw
    }

    convenience init(from a: RateAlert) {
        self.init(id: a.id, targetRate: a.targetRate, isEnabled: a.isEnabled,
                  createdAt: a.createdAt, triggeredAt: a.triggeredAt,
                  notifyTypeRaw: a.notifyType.rawValue)
    }

    func toDomain() -> RateAlert {
        RateAlert(id: id, targetRate: targetRate, isEnabled: isEnabled, createdAt: createdAt,
                  triggeredAt: triggeredAt,
                  notifyType: RateAlert.AlertNotifyType(rawValue: notifyTypeRaw) ?? .rateAbove)
    }
}

@Model
final class StoredFavorite {
    @Attribute(.unique) var providerID: String
    var addedAt: Date

    init(providerID: String, addedAt: Date = .now) {
        self.providerID = providerID
        self.addedAt = addedAt
    }
}

@Model
final class StoredRecent {
    @Attribute(.unique) var providerID: String
    var lastViewedAt: Date

    init(providerID: String, lastViewedAt: Date = .now) {
        self.providerID = providerID
        self.lastViewedAt = lastViewedAt
    }
}

@Model
final class StoredCachedQuote {
    /// "\(pair)|\(amount)"
    @Attribute(.unique) var key: String
    var pair: String
    var amount: Double
    var fetchedAt: Date
    var payload: Data

    init(key: String, pair: String, amount: Double, fetchedAt: Date, payload: Data) {
        self.key = key
        self.pair = pair
        self.amount = amount
        self.fetchedAt = fetchedAt
        self.payload = payload
    }
}

@Model
final class StoredCachedHistorical {
    /// "\(pair)|\(range)"
    @Attribute(.unique) var key: String
    var pair: String
    var range: String
    var fetchedAt: Date
    var payload: Data

    init(key: String, pair: String, range: String, fetchedAt: Date, payload: Data) {
        self.key = key
        self.pair = pair
        self.range = range
        self.fetchedAt = fetchedAt
        self.payload = payload
    }
}

@Model
final class StoredSetting {
    @Attribute(.unique) var key: String
    var value: String

    init(key: String, value: String) {
        self.key = key
        self.value = value
    }
}
