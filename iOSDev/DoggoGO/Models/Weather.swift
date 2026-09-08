import Foundation

struct WeatherResponse: Decodable {
    let currentWeather: CurrentWeather

    enum CodingKeys: String, CodingKey {
        case currentWeather = "current_weather"
    }
}

struct CurrentWeather: Decodable {
    let temperature: Double
    let windspeed: Double
    let weathercode: Int

    var description: String {
        switch weathercode {
        case 0:        return "Klar"
        case 1...3:    return "Bewölkt"
        case 45...48:  return "Nebel"
        case 51...67:  return "Regen"
        case 71...77:  return "Schnee"
        case 80...82:  return "Schauer"
        case 95...99:  return "Gewitter"
        default:       return "Unbekannt"
        }
    }

    var systemImage: String {
        switch weathercode {
        case 0:        return "sun.max.fill"
        case 1...3:    return "cloud.sun.fill"
        case 45...48:  return "cloud.fog.fill"
        case 51...67:  return "cloud.rain.fill"
        case 71...77:  return "cloud.snow.fill"
        case 80...82:  return "cloud.heavyrain.fill"
        case 95...99:  return "cloud.bolt.fill"
        default:       return "cloud.fill"
        }
    }
}