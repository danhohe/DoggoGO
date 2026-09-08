import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case unauthorized
    case serverError(Int)
    case decodingError(Error)
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:          return "Ungültige URL."
        case .unauthorized:        return "Nicht autorisiert. Bitte erneut anmelden."
        case .serverError(let c):  return "Serverfehler (HTTP \(c))."
        case .decodingError(let e):return "Datenfehler: \(e.localizedDescription)"
        case .networkError(let e): return "Netzwerkfehler: \(e.localizedDescription)"
        }
    }
}

class APIService {
    static let shared = APIService()
    private let baseURL = "http://localhost:5043"
    private init() {}

    private func makeRequest(endpoint: String, method: String, body: Data? = nil) throws -> URLRequest {
        guard let url = URL(string: baseURL + endpoint) else { throw APIError.invalidURL }
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = AuthService.shared.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        request.httpBody = body
        return request
    }

    private func execute<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw APIError.networkError(error)
        }

        guard let http = response as? HTTPURLResponse else { throw APIError.serverError(0) }

        if http.statusCode == 401 { throw APIError.unauthorized }
        guard (200..<300).contains(http.statusCode) else { throw APIError.serverError(http.statusCode) }

        let decoder = JSONDecoder()
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }

    func get<T: Decodable>(endpoint: String) async throws -> T {
        let request = try makeRequest(endpoint: endpoint, method: "GET")
        return try await execute(request)
    }

    func post<B: Encodable, T: Decodable>(endpoint: String, body: B) async throws -> T {
        let bodyData = try JSONEncoder().encode(body)
        let request = try makeRequest(endpoint: endpoint, method: "POST", body: bodyData)
        return try await execute(request)
    }

    func put<B: Encodable, T: Decodable>(endpoint: String, body: B) async throws -> T {
        let bodyData = try JSONEncoder().encode(body)
        let request = try makeRequest(endpoint: endpoint, method: "PUT", body: bodyData)
        return try await execute(request)
    }

    func delete<T: Decodable>(endpoint: String) async throws -> T {
        let request = try makeRequest(endpoint: endpoint, method: "DELETE")
        return try await execute(request)
    }
}