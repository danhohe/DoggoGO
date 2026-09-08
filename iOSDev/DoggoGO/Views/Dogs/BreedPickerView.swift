import SwiftUI

struct BreedPickerView: View {
    let breeds: [Breed]
    @Binding var selectedBreed: Breed?
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""

    private var filtered: [Breed] {
        searchText.isEmpty ? breeds : breeds.filter {
            $0.breedName.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            List(filtered) { breed in
                Button {
                    selectedBreed = breed
                    dismiss()
                } label: {
                    HStack {
                        Text(breed.breedName)
                            .foregroundStyle(.primary)
                        Spacer()
                        if selectedBreed?.id == breed.id {
                            Image(systemName: "checkmark")
                                .foregroundStyle(.brown)
                        }
                    }
                }
            }
            .searchable(text: $searchText, prompt: "Rasse suchen")
            .navigationTitle("Rasse wählen")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Abbrechen") { dismiss() }
                }
            }
        }
    }
}