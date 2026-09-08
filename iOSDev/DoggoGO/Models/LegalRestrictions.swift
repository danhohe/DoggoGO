import Foundation

struct LegalRestrictions: Codable, Identifiable {
    let id: UUID
    let category: String
    let rules: [String]

    var isSpecialBreed: Bool {
        category == "spezielle_hunderasse"
    }
}