//
//  ContentView.swift
//  DoggoGO
//
//  Created by Daniel Hoheneder on 10.12.2024.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        
        TabView {
            Tab("Home", systemImage: "house"){
                HomeView()
            }
            Tab("Map", systemImage: "map"){
                MapView()
            }
            Tab("dogGO", systemImage: "pawprint"){
                DoggoView()
            }
            Tab("Profile", systemImage: "person"){
                ProfileView()
            }
        }
    }
}
#Preview {
    ContentView()
}
