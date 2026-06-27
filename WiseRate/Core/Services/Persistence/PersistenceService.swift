import Foundation
import SwiftData

// Local persistence facade. ViewModels call PersistenceService.shared.<entity>.<verb>()
// and never touch SwiftData directly, so the backing store can swap (SwiftData ↔ in-memory
// for previews/tests) without touching feature code. See docs/services/persistence.md.

let recentProvidersCap = 10

// MARK: - Store protocols

@MainActor protocol AlertStore {
    func all() -> [RateAlert]
    func add(_ alert: RateAlert)
    func toggle(_ alert: RateAlert)
    func delete(_ alert: RateAlert)
}

@MainActor protocol ProfileStore {
    func get() -> UserProfile
    func save(_ profile: UserProfile)
}

@MainActor protocol FavoriteStore {
    func all() -> [String]
    func isFavorite(_ providerID: String) -> Bool
    func add(_ providerID: String)
    func remove(_ providerID: String)
}

@MainActor protocol RecentStore {
    func all() -> [String]
    func record(_ providerID: String)
}

@MainActor protocol SettingStore {
    func string(_ key: String) -> String?
    func set(_ key: String, _ value: String)
    func bool(_ key: String, default fallback: Bool) -> Bool
    func setBool(_ key: String, _ value: Bool)
}

extension SettingStore {
    func bool(_ key: String, default fallback: Bool) -> Bool {
        guard let v = string(key) else { return fallback }
        return v == "true"
    }
    func setBool(_ key: String, _ value: Bool) { set(key, value ? "true" : "false") }
}

// MARK: - Facade

@MainActor
final class PersistenceService {
    static let shared = PersistenceService()

    private(set) var alerts: AlertStore
    private(set) var profile: ProfileStore
    private(set) var favorites: FavoriteStore
    private(set) var recents: RecentStore
    private(set) var settings: SettingStore

    /// Default backend is in-memory so SwiftUI previews work without a container.
    private init() {
        let mem = InMemoryBacking()
        alerts = InMemoryAlertStore(mem)
        favorites = InMemoryFavoriteStore(mem)
        recents = InMemoryRecentStore(mem)
        settings = InMemorySettingStore(mem)
        profile = InMemoryProfileStore(mem)
    }

    /// Called once at launch (WiseRateApp) with the app's ModelContext.
    func configure(context: ModelContext) {
        let alertsSD = AlertStoreSD(context)
        let favoritesSD = FavoriteStoreSD(context)
        let recentsSD = RecentStoreSD(context)
        seed(context: context)
        alerts = alertsSD
        favorites = favoritesSD
        recents = recentsSD
        settings = SettingStoreSD(context)
        profile = ProfileStoreSD(context, alerts: alertsSD, favorites: favoritesSD, recents: recentsSD)
    }

    /// Seed a single profile from the mock on first launch (real onboarding pending).
    private func seed(context: ModelContext) {
        let existing = (try? context.fetch(FetchDescriptor<SDUserProfile>())) ?? []
        guard existing.isEmpty else { return }
        context.insert(SDUserProfile(scalarsFrom: .mock))
        for id in UserProfile.mock.favoriteProviders {
            context.insert(SDFavoriteProvider(providerID: id, addedAt: Date()))
        }
        for (i, id) in UserProfile.mock.recentProviders.enumerated() {
            context.insert(SDRecentProvider(providerID: id, lastViewedAt: Date().addingTimeInterval(Double(-i))))
        }
        try? context.save()
    }
}

// MARK: - SwiftData backend

@MainActor
private func fetch<T: PersistentModel>(_ context: ModelContext, _ descriptor: FetchDescriptor<T>) -> [T] {
    (try? context.fetch(descriptor)) ?? []
}

@MainActor
final class AlertStoreSD: AlertStore {
    private let context: ModelContext
    init(_ context: ModelContext) { self.context = context }

    func all() -> [RateAlert] {
        fetch(context, FetchDescriptor<SDRateAlert>(sortBy: [.init(\.createdAt, order: .reverse)])).map(\.domain)
    }
    func add(_ alert: RateAlert) { context.insert(SDRateAlert(from: alert)); try? context.save() }
    func toggle(_ alert: RateAlert) {
        guard let row = row(alert.id) else { return }
        row.isEnabled.toggle(); try? context.save()
    }
    func delete(_ alert: RateAlert) {
        guard let row = row(alert.id) else { return }
        context.delete(row); try? context.save()
    }
    private func row(_ id: UUID) -> SDRateAlert? {
        fetch(context, FetchDescriptor<SDRateAlert>(predicate: #Predicate { $0.id == id })).first
    }
}

@MainActor
final class FavoriteStoreSD: FavoriteStore {
    private let context: ModelContext
    init(_ context: ModelContext) { self.context = context }

    func all() -> [String] {
        fetch(context, FetchDescriptor<SDFavoriteProvider>(sortBy: [.init(\.addedAt, order: .reverse)])).map(\.providerID)
    }
    func isFavorite(_ providerID: String) -> Bool {
        !fetch(context, FetchDescriptor<SDFavoriteProvider>(predicate: #Predicate { $0.providerID == providerID })).isEmpty
    }
    func add(_ providerID: String) {
        guard !isFavorite(providerID) else { return }
        context.insert(SDFavoriteProvider(providerID: providerID, addedAt: Date())); try? context.save()
    }
    func remove(_ providerID: String) {
        fetch(context, FetchDescriptor<SDFavoriteProvider>(predicate: #Predicate { $0.providerID == providerID }))
            .forEach { context.delete($0) }
        try? context.save()
    }
}

@MainActor
final class RecentStoreSD: RecentStore {
    private let context: ModelContext
    init(_ context: ModelContext) { self.context = context }

    func all() -> [String] {
        fetch(context, FetchDescriptor<SDRecentProvider>(sortBy: [.init(\.lastViewedAt, order: .reverse)])).map(\.providerID)
    }
    func record(_ providerID: String) {
        if let row = fetch(context, FetchDescriptor<SDRecentProvider>(predicate: #Predicate { $0.providerID == providerID })).first {
            row.lastViewedAt = Date()
        } else {
            context.insert(SDRecentProvider(providerID: providerID, lastViewedAt: Date()))
        }
        let ordered = fetch(context, FetchDescriptor<SDRecentProvider>(sortBy: [.init(\.lastViewedAt, order: .reverse)]))
        ordered.dropFirst(recentProvidersCap).forEach { context.delete($0) }
        try? context.save()
    }
}

@MainActor
final class SettingStoreSD: SettingStore {
    private let context: ModelContext
    init(_ context: ModelContext) { self.context = context }

    func string(_ key: String) -> String? {
        fetch(context, FetchDescriptor<SDSetting>(predicate: #Predicate { $0.key == key })).first?.value
    }
    func set(_ key: String, _ value: String) {
        if let row = fetch(context, FetchDescriptor<SDSetting>(predicate: #Predicate { $0.key == key })).first {
            row.value = value
        } else {
            context.insert(SDSetting(key: key, value: value))
        }
        try? context.save()
    }
}

@MainActor
final class ProfileStoreSD: ProfileStore {
    private let context: ModelContext
    private let alerts: AlertStore
    private let favorites: FavoriteStore
    private let recents: RecentStore
    init(_ context: ModelContext, alerts: AlertStore, favorites: FavoriteStore, recents: RecentStore) {
        self.context = context; self.alerts = alerts; self.favorites = favorites; self.recents = recents
    }

    func get() -> UserProfile {
        guard let row = fetch(context, FetchDescriptor<SDUserProfile>()).first else { return .mock }
        return row.domain(alerts: alerts.all(), recents: recents.all(), favorites: favorites.all())
    }
    func save(_ profile: UserProfile) {
        if let row = fetch(context, FetchDescriptor<SDUserProfile>()).first {
            row.applyScalars(from: profile)
        } else {
            context.insert(SDUserProfile(scalarsFrom: profile))
        }
        try? context.save()
    }
}

// MARK: - In-memory backend (previews / tests)

@MainActor
final class InMemoryBacking {
    var alerts: [RateAlert] = MockData.mockAlerts
    var profile: UserProfile = .mock
    var favorites: [String] = UserProfile.mock.favoriteProviders
    var recents: [String] = UserProfile.mock.recentProviders
    var settings: [String: String] = [:]
}

@MainActor final class InMemoryAlertStore: AlertStore {
    private let b: InMemoryBacking; init(_ b: InMemoryBacking) { self.b = b }
    func all() -> [RateAlert] { b.alerts }
    func add(_ alert: RateAlert) { b.alerts.insert(alert, at: 0) }
    func toggle(_ alert: RateAlert) {
        guard let i = b.alerts.firstIndex(where: { $0.id == alert.id }) else { return }
        b.alerts[i].isEnabled.toggle()
    }
    func delete(_ alert: RateAlert) { b.alerts.removeAll { $0.id == alert.id } }
}

@MainActor final class InMemoryFavoriteStore: FavoriteStore {
    private let b: InMemoryBacking; init(_ b: InMemoryBacking) { self.b = b }
    func all() -> [String] { b.favorites }
    func isFavorite(_ providerID: String) -> Bool { b.favorites.contains(providerID) }
    func add(_ providerID: String) { if !b.favorites.contains(providerID) { b.favorites.insert(providerID, at: 0) } }
    func remove(_ providerID: String) { b.favorites.removeAll { $0 == providerID } }
}

@MainActor final class InMemoryRecentStore: RecentStore {
    private let b: InMemoryBacking; init(_ b: InMemoryBacking) { self.b = b }
    func all() -> [String] { b.recents }
    func record(_ providerID: String) {
        b.recents.removeAll { $0 == providerID }
        b.recents.insert(providerID, at: 0)
        if b.recents.count > recentProvidersCap { b.recents = Array(b.recents.prefix(recentProvidersCap)) }
    }
}

@MainActor final class InMemorySettingStore: SettingStore {
    private let b: InMemoryBacking; init(_ b: InMemoryBacking) { self.b = b }
    func string(_ key: String) -> String? { b.settings[key] }
    func set(_ key: String, _ value: String) { b.settings[key] = value }
}

@MainActor final class InMemoryProfileStore: ProfileStore {
    private let b: InMemoryBacking; init(_ b: InMemoryBacking) { self.b = b }
    func get() -> UserProfile {
        var p = b.profile
        p.alerts = b.alerts; p.favoriteProviders = b.favorites; p.recentProviders = b.recents
        return p
    }
    func save(_ profile: UserProfile) { b.profile = profile }
}
