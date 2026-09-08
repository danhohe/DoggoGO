import Foundation
import MapKit

enum LocationCategory: String, Codable, CaseIterable {
    case freilaufwiese
    case sackerlspender
    case muellEimer = "muell_eimer"
    case waschstation

    var displayName: String {
        switch self {
        case .freilaufwiese:  return "Freilaufwiese"
        case .sackerlspender: return "Sackerlspender"
        case .muellEimer:     return "Mülleimer"
        case .waschstation:   return "Waschstation"
        }
    }

    var systemImage: String {
        switch self {
        case .freilaufwiese:  return "figure.walk"
        case .sackerlspender: return "bag"
        case .muellEimer:     return "trash"
        case .waschstation:   return "shower"
        }
    }

    var color: String {
        switch self {
        case .freilaufwiese:  return "green"
        case .sackerlspender: return "yellow"
        case .muellEimer:     return "blue"
        case .waschstation:   return "purple"
        }
    }
}

struct POILocation: Codable, Identifiable {
    let id: UUID
    let name: String
    let latitude: Double
    let longitude: Double
    let category: LocationCategory

    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
}