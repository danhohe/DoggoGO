import Foundation

struct Owner: Codable, Identifiable {
    let id: UUID
    let name: String
    let email: String
    let phoneNumber: String?
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RegisterRequest: Codable {
    let name: String
    let email: String
    let password: String
    let phoneNumber: String?
}

struct AuthResponse: Decodable {
    let token: String
}

struct RegisterResponse: Decodable {
    let id: UUID
    let name: String
    let email: String
}