import Foundation
import SwiftData

/// Local store for user-owned data (profile, alerts, favorites, recents, settings) and
/// offline quote snapshots. ViewModels call `PersistenceService.shared.<entity>.<verb>()`
/// and never touch SwiftData directly, so the backing store can swap.
/// See docs/services/persistence.md.
///
/// Note: spot/historical rate caching is owned by `RateCache` (disk JSON). The SwiftData
/// `StoredCachedQuote`/`StoredCachedHistorical` entities are reserved for cross-session
/// offline snapshots and are not yet wired into Home/Comparison.
@MainActor
final class PersistenceService {
    static let shared = PersistenceService()

    let container: ModelContainer
    private var context: ModelContext { container.mainContext }

    init(inMemory: Bool = false) {
        let schema = Schema([
            StoredProfile.self, StoredAlert.self, StoredFavorite.self, StoredRecent.self,
            StoredCachedQuote.self, StoredCachedHistorical.self, StoredSetting.self,
        ])
        let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: inMemory)
        do {
            container = try ModelContainer(for: schema, configurations: [config])
        } catch {
            fatalError("Failed to build PersistenceService ModelContainer: \(error)")
        }
        seedIfNeeded()
    }

    // MARK: Namespaced stores

    var profile: ProfileStore { ProfileStore(context: context, service: self) }
    var alerts: AlertStore { AlertStore(context: context) }
    var favorites: FavoriteStore { FavoriteStore(context: context) }
    var recents: RecentStore { RecentStore(context: context) }
    var settings: SettingStore { SettingStore(context: context) }
    var cache: CacheStore { CacheStore(context: context) }

    /// First-launch seed so the UI keeps its current mock content until real accounts exist.
    private func seedIfNeeded() {
        let existing = (try? context.fetch(FetchDescriptor<StoredProfile>())) ?? []
        guard existing.isEmpty else { return }

        let mock = UserProfile.mock
        context.insert(StoredProfile(from: mock))
        for id in mock.favoriteProviders { context.insert(StoredFavorite(providerID: id)) }
        for (i, id) in mock.recentProviders.enumerated() {
            context.insert(StoredRecent(providerID: id,
                                        lastViewedAt: Date().addingTimeInterval(Double(-i))))
        }
        for alert in MockData.mockAlerts { context.insert(StoredAlert(from: alert)) }
        try? context.save()
    }
}

// MARK: - Stores

@MainActor
struct ProfileStore {
    let context: ModelContext
    let service: PersistenceService

    func load() -> UserProfile {
        guard let p = try? context.fetch(FetchDescriptor<StoredProfile>()).first else {
            return .mock
        }
        return UserProfile(
            id: p.id, name: p.name, email: p.email, avatarURL: p.avatarURL,
            isPremium: p.isPremium,
            preferredSendCurrency: p.preferredSendCurrency,
            preferredReceiveCurrency: p.preferredReceiveCurrency,
            defaultDeliveryMethod: DeliveryMethod(rawValue: p.defaultDeliveryMethodRaw) ?? .bankTransfer,
            alerts: service.alerts.list(),
            recentProviders: service.recents.list(),
            favoriteProviders: service.favorites.list()
        )
    }

    func save(_ profile: UserProfile) {
        if let p = try? context.fetch(FetchDescriptor<StoredProfile>()).first {
            p.apply(profile)
        } else {
            context.insert(StoredProfile(from: profile))
        }
        try? context.save()
    }
}

@MainActor
struct AlertStore {
    let context: ModelContext

    func list() -> [RateAlert] {
        let stored = (try? context.fetch(
            FetchDescriptor<StoredAlert>(sortBy: [SortDescriptor(\.createdAt, order: .reverse)])
        )) ?? []
        return stored.map { $0.toDomain() }
    }

    func create(_ alert: RateAlert) {
        context.insert(StoredAlert(from: alert))
        try? context.save()
    }

    func setEnabled(id: UUID, _ enabled: Bool) {
        guard let s = fetch(id) else { return }
        s.isEnabled = enabled
        try? context.save()
    }

    func delete(id: UUID) {
        guard let s = fetch(id) else { return }
        context.delete(s)
        try? context.save()
    }

    private func fetch(_ id: UUID) -> StoredAlert? {
        try? context.fetch(FetchDescriptor<StoredAlert>(predicate: #Predicate { $0.id == id })).first
    }
}

@MainActor
struct FavoriteStore {
    let context: ModelContext

    func list() -> [String] {
        let s = (try? context.fetch(
            FetchDescriptor<StoredFavorite>(sortBy: [SortDescriptor(\.addedAt)])
        )) ?? []
        return s.map(\.providerID)
    }

    func isFavorite(_ providerID: String) -> Bool { fetch(providerID) != nil }

    func toggle(_ providerID: String) {
        if let s = fetch(providerID) {
            context.delete(s)
        } else {
            context.insert(StoredFavorite(providerID: providerID))
        }
        try? context.save()
    }

    private func fetch(_ id: String) -> StoredFavorite? {
        try? context.fetch(FetchDescriptor<StoredFavorite>(predicate: #Predicate { $0.providerID == id })).first
    }
}

@MainActor
struct RecentStore {
    let context: ModelContext
    private let cap = 10

    func list() -> [String] {
        recents().map(\.providerID)
    }

    /// Records a view, moving the provider to the front and trimming to `cap`.
    func record(_ providerID: String) {
        if let s = fetch(providerID) {
            s.lastViewedAt = .now
        } else {
            context.insert(StoredRecent(providerID: providerID, lastViewedAt: .now))
        }
        let all = recents()
        if all.count > cap {
            for stale in all[cap...] { context.delete(stale) }
        }
        try? context.save()
    }

    private func recents() -> [StoredRecent] {
        (try? context.fetch(
            FetchDescriptor<StoredRecent>(sortBy: [SortDescriptor(\.lastViewedAt, order: .reverse)])
        )) ?? []
    }

    private func fetch(_ id: String) -> StoredRecent? {
        try? context.fetch(FetchDescriptor<StoredRecent>(predicate: #Predicate { $0.providerID == id })).first
    }
}

@MainActor
struct SettingStore {
    let context: ModelContext

    func string(_ key: String) -> String? { fetch(key)?.value }
    func bool(_ key: String) -> Bool? { fetch(key).map { $0.value == "true" } }

    func set(_ key: String, _ value: String) {
        if let s = fetch(key) {
            s.value = value
        } else {
            context.insert(StoredSetting(key: key, value: value))
        }
        try? context.save()
    }

    func set(_ key: String, _ value: Bool) { set(key, value ? "true" : "false") }

    private func fetch(_ key: String) -> StoredSetting? {
        try? context.fetch(FetchDescriptor<StoredSetting>(predicate: #Predicate { $0.key == key })).first
    }
}

@MainActor
struct CacheStore {
    let context: ModelContext

    func saveQuotes(_ quotes: [TransferQuote], pair: String, amount: Double) {
        guard let data = try? JSONEncoder().encode(quotes) else { return }
        let key = "\(pair)|\(amount)"
        if let s = fetchQuote(key) {
            s.payload = data
            s.fetchedAt = .now
        } else {
            context.insert(StoredCachedQuote(key: key, pair: pair, amount: amount,
                                             fetchedAt: .now, payload: data))
        }
        try? context.save()
    }

    func loadQuotes(pair: String, amount: Double) -> (quotes: [TransferQuote], fetchedAt: Date)? {
        guard let s = fetchQuote("\(pair)|\(amount)"),
              let quotes = try? JSONDecoder().decode([TransferQuote].self, from: s.payload)
        else { return nil }
        return (quotes, s.fetchedAt)
    }

    private func fetchQuote(_ key: String) -> StoredCachedQuote? {
        try? context.fetch(FetchDescriptor<StoredCachedQuote>(predicate: #Predicate { $0.key == key })).first
    }
}
