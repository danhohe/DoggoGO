import Foundation

struct Dog: Codable, Identifiable {
    let id: UUID
    let name: String
    let age: Int
    let breedId: UUID
    let ownerId: UUID?
    let breedName: String?
}

struct CreateDogRequest: Codable {
    let name: String
    let age: Int
    let breedId: UUID
}

struct UpdateDogRequest: Codable {
    let name: String?
    let age: Int?
    let breedId: UUID?
}