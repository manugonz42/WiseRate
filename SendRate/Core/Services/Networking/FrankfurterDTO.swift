import Foundation

/// DTOs for api.frankfurter.dev (ECB reference rates, no API key).
/// See docs/services/exchange-rate.md.
enum Frankfurter {
    static let baseURL = URL(string: "https://api.frankfurter.dev/v1")!

    /// `GET /v1/latest?base=EUR&symbols=PHP`
    static func latestURL(base: String, symbol: String) -> URL {
        var comps = URLComponents(url: baseURL.appendingPathComponent("latest"),
                                  resolvingAgainstBaseURL: false)!
        comps.queryItems = [
            URLQueryItem(name: "base", value: base),
            URLQueryItem(name: "symbols", value: symbol),
        ]
        return comps.url!
    }

    /// `GET /v1/{start}..{end}?base=EUR&symbols=PHP` (open-ended `{start}..` allowed).
    static func timeseriesURL(base: String, symbol: String, start: Date, end: Date?) -> URL {
        let startStr = isoDay.string(from: start)
        let endStr = end.map { isoDay.string(from: $0) } ?? ""
        let path = "\(startStr)..\(endStr)"
        var comps = URLComponents(url: baseURL.appendingPathComponent(path),
                                  resolvingAgainstBaseURL: false)!
        comps.queryItems = [
            URLQueryItem(name: "base", value: base),
            URLQueryItem(name: "symbols", value: symbol),
        ]
        return comps.url!
    }

    static let isoDay: DateFormatter = {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .iso8601)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = TimeZone(identifier: "UTC")
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()
}

struct FrankfurterLatest: Codable {
    let amount: Double
    let base: String
    let date: String
    let rates: [String: Double]
}

struct FrankfurterTimeseries: Codable {
    let base: String
    let start_date: String
    let end_date: String
    /// date string -> (symbol -> rate)
    let rates: [String: [String: Double]]

    /// Sorted ascending by date, paired with the rate for `symbol`.
    func points(symbol: String) -> [(date: Date, rate: Double)] {
        rates.compactMap { key, value in
            guard let date = Frankfurter.isoDay.date(from: key),
                  let rate = value[symbol] else { return nil }
            return (date, rate)
        }
        .sorted { $0.date < $1.date }
    }
}
