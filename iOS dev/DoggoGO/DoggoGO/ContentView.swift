//
//  ContentView.swift
//  DoggoGO
//
//  Created by Daniel Hoheneder on 10.12.2024.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Image("DoggoGOiOS")
                .resizable()
                .scaledToFit()
            Text("DoggoGO")
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
