import Foundation

/// Error classes for the exchange-rate service. See docs/services/exchange-rate.md.
enum ExchangeRateError: Error {
    case network
    case rateLimit
    case unsupportedPair
    case serverError
}

/// Thin async wrapper over URLSession that decodes JSON and maps transport
/// failures to `ExchangeRateError`.
struct HTTPClient {
    static let shared = HTTPClient()

    private let session: URLSession
    private let decoder: JSONDecoder

    init(session: URLSession = .shared) {
        self.session = session
        self.decoder = JSONDecoder()
    }

    func get<T: Decodable>(_ url: URL) async throws -> T {
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(from: url)
        } catch {
            throw ExchangeRateError.network
        }

        if let http = response as? HTTPURLResponse {
            switch http.statusCode {
            case 200...299: break
            case 429: throw ExchangeRateError.rateLimit
            case 404, 422: throw ExchangeRateError.unsupportedPair
            default: throw ExchangeRateError.serverError
            }
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw ExchangeRateError.serverError
        }
    }
}
