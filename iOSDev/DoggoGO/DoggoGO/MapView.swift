//
//  MapView.swift
//  DoggoGO
//
//  Created by Daniel Hoheneder on 11.12.2024.
//

import SwiftUI
import MapKit

struct MapView: View {
    var body: some View {
        Map()
            .padding(.bottom)
            .padding(.top)
    }
}

#Preview {
    MapView()
}
