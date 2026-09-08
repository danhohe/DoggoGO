import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            MapView()
                .tabItem {
                    Label("Karte", systemImage: "map.fill")
                }

            DogListView()
                .tabItem {
                    Label("Meine Hunde", systemImage: "pawprint.fill")
                }

            ProfileView()
                .tabItem {
                    Label("Profil", systemImage: "person.circle.fill")
                }
        }
        .tint(.brown)
    }
}