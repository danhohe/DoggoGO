import SwiftUI

struct BreedDetailView: View {
    let breedId: UUID
    @State private var breed: Breed?
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            if isLoading {
                ProgressView("Laden…").padding(.top, 40)
            } else if let error = errorMessage {
                ContentUnavailableView("Fehler", systemImage: "exclamationmark.triangle", description: Text(error))
            } else if let breed {
                VStack(alignment: .leading, spacing: 16) {
                    Text(breed.breedName)
                        .font(.title.bold())
                        .padding(.horizontal)

                    Text(breed.description)
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .padding(.horizontal)

                    if let restrictions = breed.legalRestrictions {
                        LegalRestrictionsView(restrictions: restrictions)
                    }
                }
                .padding(.vertical)
            }
        }
        .navigationTitle("Rassendetails")
        .navigationBarTitleDisplayMode(.inline)
        .task { await loadBreed() }
    }

    private func loadBreed() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let response: ApiResponse<Breed> = try await APIService.shared.get(endpoint: "/api/breeds/\(breedId)")
            breed = response.data
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}