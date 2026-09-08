import SwiftUI

struct AddDogView: View {
    @ObservedObject var viewModel: DogListViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var age = 1
    @State private var selectedBreed: Breed?
    @State private var showBreedPicker = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Hundeprofil") {
                    TextField("Name", text: $name)
                    Stepper("Alter: \(age) Jahr\(age == 1 ? "" : "e")", value: $age, in: 0...30)
                }

                Section("Rasse") {
                    Button {
                        showBreedPicker = true
                    } label: {
                        HStack {
                            Text(selectedBreed?.breedName ?? "Rasse wählen")
                                .foregroundStyle(selectedBreed == nil ? .secondary : .primary)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundStyle(.secondary)
                                .font(.footnote)
                        }
                    }
                }

                if let error = viewModel.errorMessage {
                    Section {
                        Text(error).foregroundStyle(.red).font(.footnote)
                    }
                }
            }
            .navigationTitle("Hund hinzufügen")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Abbrechen") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Speichern") {
                        guard let breed = selectedBreed else { return }
                        Task {
                            let success = await viewModel.createDog(name: name, age: age, breedId: breed.id)
                            if success { dismiss() }
                        }
                    }
                    .disabled(name.isEmpty || selectedBreed == nil || viewModel.isLoading)
                }
            }
            .sheet(isPresented: $showBreedPicker) {
                BreedPickerView(breeds: viewModel.breeds, selectedBreed: $selectedBreed)
            }
            .task { await viewModel.loadBreeds() }
        }
    }
}