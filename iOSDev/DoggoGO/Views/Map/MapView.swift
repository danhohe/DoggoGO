import SwiftUI
import MapKit

struct MapView: View {
    @StateObject private var viewModel = MapViewModel()
    @StateObject private var locationManager = LocationManager()

    @State private var position: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 48.2692, longitude: 14.2956),
            span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
        )
    )
    @State private var hasCenteredOnUser = false
    @State private var searchText = ""
    @State private var showSearch = false
    @State private var searchResults: [MKMapItem] = []

    var body: some View {
        ZStack(alignment: .bottom) {

            // MARK: Map
            Map(position: $position) {
                UserAnnotation()
                ForEach(viewModel.filteredLocations) { poi in
                    Marker(poi.name, systemImage: poi.category.systemImage, coordinate: poi.coordinate)
                        .tint(markerColor(for: poi.category))
                }
                ForEach(searchResults, id: \.self) { item in
                    if let coord = item.placemark.location?.coordinate {
                        Marker(item.name ?? "Ort", systemImage: "mappin", coordinate: coord)
                            .tint(.red)
                    }
                }
            }
            .ignoresSafeArea(edges: .top)
            .onReceive(locationManager.$userLocation) { loc in
                guard let loc, !hasCenteredOnUser else { return }
                hasCenteredOnUser = true
                position = .region(MKCoordinateRegion(
                    center: loc.coordinate,
                    span: MKCoordinateSpan(latitudeDelta: 0.02, longitudeDelta: 0.02)
                ))
                Task {
                    await viewModel.loadWeather(
                        latitude: loc.coordinate.latitude,
                        longitude: loc.coordinate.longitude
                    )
                }
            }

            // MARK: Weather – top left, always visible
            if let weather = viewModel.weather {
                WeatherWidget(weather: weather)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    //.padding(.top, 56)
                    .padding(.leading, 16)
                    .allowsHitTesting(false)
            }

            // MARK: Bottom area
            VStack(spacing: 0) {

                // Search bar slides up from behind the bottom row
                if showSearch {
                    SearchBar(
                        text: $searchText,
                        onSearch: { query in Task { await performSearch(query: query) } },
                        onClear: { searchResults = []; searchText = "" }
                    )
                    .padding(.horizontal, 16)
                    .padding(.bottom, 10)
                    .transition(
                        .asymmetric(
                            insertion: .move(edge: .bottom).combined(with: .opacity),
                            removal: .move(edge: .bottom).combined(with: .opacity)
                        )
                    )
                }

                // Filter pills + action buttons on the same row
                HStack(alignment: .bottom, spacing: 0) {

                    // Filter pills
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(LocationCategory.allCases, id: \.self) { category in
                                let isActive = viewModel.activeFilters.contains(category)
                                Button { viewModel.toggleFilter(category) } label: {
                                    Label(category.displayName, systemImage: category.systemImage)
                                        .font(.caption.weight(.semibold))
                                        .padding(.horizontal, 13)
                                        .padding(.vertical, 8)
                                        .background(
                                            isActive ? Color.accentColor : Color(.systemBackground),
                                            in: Capsule()
                                        )
                                        .foregroundStyle(isActive ? .white : .primary)
                                        .shadow(color: .black.opacity(0.12), radius: 4, y: 2)
                                }
                            }
                        }
                        .padding(.leading, 16)
                        .padding(.trailing, 8)
                        .padding(.vertical, 8)
                    }

                    // Locate + Search buttons — bottom-right, in line with filter pills
                    VStack(spacing: 10) {
                        MapActionButton(icon: "location.fill") {
                            guard let loc = locationManager.userLocation else { return }
                            withAnimation {
                                position = .region(MKCoordinateRegion(
                                    center: loc.coordinate,
                                    span: MKCoordinateSpan(latitudeDelta: 0.02, longitudeDelta: 0.02)
                                ))
                            }
                        }

                        MapActionButton(
                            icon: showSearch ? "xmark" : "magnifyingglass",
                            highlighted: showSearch
                        ) {
                            withAnimation(.spring(response: 0.38, dampingFraction: 0.82)) {
                                showSearch.toggle()
                            }
                            if !showSearch { searchResults = []; searchText = "" }
                        }
                    }
                    .padding(.trailing, 16)
                    .padding(.bottom, 8)
                }
            }
            .padding(.bottom, 8)
        }
        .task { await viewModel.loadLocations() }
    }

    private func performSearch(query: String) async {
        guard !query.isEmpty else { searchResults = []; return }
        let request = MKLocalSearch.Request()
        request.naturalLanguageQuery = query
        if let center = locationManager.userLocation?.coordinate {
            request.region = MKCoordinateRegion(
                center: center,
                span: MKCoordinateSpan(latitudeDelta: 2.0, longitudeDelta: 2.0)
            )
        }
        let search = MKLocalSearch(request: request)
        if let response = try? await search.start() {
            searchResults = response.mapItems
            if let first = response.mapItems.first?.placemark.location?.coordinate {
                withAnimation {
                    position = .region(MKCoordinateRegion(
                        center: first,
                        span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
                    ))
                }
            }
        }
    }

    private func markerColor(for category: LocationCategory) -> Color {
        switch category {
        case .freilaufwiese:  return .green
        case .sackerlspender: return .yellow
        case .muellEimer:     return .blue
        case .waschstation:   return .purple
        }
    }
}

// MARK: - Map Action Button
struct MapActionButton: View {
    let icon: String
    var highlighted: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(highlighted ? .white : .primary)
                .frame(width: 44, height: 44)
                .background(
                    highlighted ? Color.accentColor : Color(.systemBackground).opacity(0.95),
                    in: Circle()
                )
                .shadow(color: .black.opacity(0.15), radius: 5, y: 2)
        }
    }
}

// MARK: - Search Bar
struct SearchBar: View {
    @Binding var text: String
    let onSearch: (String) -> Void
    let onClear: () -> Void
    @FocusState private var isFocused: Bool

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(.secondary)
                .font(.system(size: 14, weight: .medium))

            TextField("Stadt oder Ort suchen…", text: $text)
                .submitLabel(.search)
                .onSubmit { onSearch(text) }
                .focused($isFocused)

            if !text.isEmpty {
                Button {
                    onClear()
                    isFocused = true
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color(.systemBackground), in: RoundedRectangle(cornerRadius: 14))
        .shadow(color: .black.opacity(0.12), radius: 8, y: 3)
        .onAppear { isFocused = true }
    }
}

// MARK: - Weather Widget
struct WeatherWidget: View {
    let weather: CurrentWeather

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: weather.systemImage)
                .foregroundStyle(.orange)
            Text("\(Int(weather.temperature))°C")
                .fontWeight(.semibold)
            Text(weather.description)
                .foregroundStyle(.secondary)
        }
        .font(.subheadline)
        .padding(.horizontal, 14)
        .padding(.vertical, 9)
        .background(Color(.systemBackground).opacity(0.95), in: Capsule())
        .shadow(color: .black.opacity(0.12), radius: 5, y: 2)
    }
}
