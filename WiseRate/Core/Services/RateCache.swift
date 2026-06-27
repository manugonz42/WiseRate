import Foundation

/// Two-tier (memory + disk) cache for exchange-rate payloads.
/// Returns the cached value together with its age so the service can apply the
/// per-data TTLs from docs/services/exchange-rate.md and implement
/// stale-while-revalidate on network failure.
actor RateCache {
    static let shared = RateCache()

    private struct Stored<T: Codable>: Codable {
        let storedAt: Date
        let value: T
    }

    private var memory: [String: Data] = [:]
    private let dir: URL
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    init() {
        let caches = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
        dir = caches.appendingPathComponent("WiseRateCache", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
    }

    /// Cached value and how old it is, or nil if nothing is cached.
    func load<T: Codable>(_ type: T.Type, key: String) -> (value: T, age: TimeInterval)? {
        let data = memory[key] ?? (try? Data(contentsOf: fileURL(key)))
        guard let data, let stored = try? decoder.decode(Stored<T>.self, from: data) else {
            return nil
        }
        if memory[key] == nil { memory[key] = data }
        return (stored.value, Date().timeIntervalSince(stored.storedAt))
    }

    func store<T: Codable>(_ value: T, key: String) {
        guard let data = try? encoder.encode(Stored(storedAt: Date(), value: value)) else { return }
        memory[key] = data
        try? data.write(to: fileURL(key))
    }

    private func fileURL(_ key: String) -> URL {
        dir.appendingPathComponent(key.replacingOccurrences(of: "/", with: "_") + ".json")
    }
}
