import Foundation
import MapKit

@MainActor
class MapViewModel: ObservableObject {
    @Published var locations: [POILocation] = []
    @Published var activeFilters: Set<LocationCategory> = Set(LocationCategory.allCases)
    @Published var weather: CurrentWeather?

    var filteredLocations: [POILocation] {
        locations.filter { activeFilters.contains($0.category) }
    }

    func loadLocations() async {
        do {
            let response: ApiResponse<[POILocation]> = try await APIService.shared.get(endpoint: "/api/locations")
            locations = response.data ?? []
        } catch {
            // Non-critical — map still works without POIs
        }
    }

    func loadWeather(latitude: Double, longitude: Double) async {
        let urlString = "https://api.open-meteo.com/v1/forecast?latitude=\(latitude)&longitude=\(longitude)&current_weather=true"
        guard let url = URL(string: urlString) else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            weather = try JSONDecoder().decode(WeatherResponse.self, from: data).currentWeather
        } catch {
            // Weather is non-critical — fail silently
        }
    }

    func toggleFilter(_ category: LocationCategory) {
        if activeFilters.contains(category) {
            activeFilters.remove(category)
        } else {
            activeFilters.insert(category)
        }
    }
}