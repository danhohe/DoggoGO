import Foundation

struct Breed: Codable, Identifiable {
    let id: UUID
    let breedName: String
    let description: String
    let legalRestrictionsId: UUID?
    let legalRestrictions: LegalRestrictions?
}