import SwiftUI

struct DogDetailView: View {
    let dog: Dog
    @ObservedObject var viewModel: DogListViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var name: String
    @State private var age: Int
    @State private var selectedBreed: Breed?
    @State private var showBreedPicker = false
    @State private var showBreedDetail = false
    @State private var isEditing = false

    init(dog: Dog, viewModel: DogListViewModel) {
        self.dog = dog
        self.viewModel = viewModel
        _name = State(initialValue: dog.name)
        _age = State(initialValue: dog.age)
    }

    var body: some View {
        Form {
            Section("Hundeprofil") {
                if isEditing {
                    TextField("Name", text: $name)
                    Stepper("Alter: \(age) Jahr\(age == 1 ? "" : "e")", value: $age, in: 0...30)
                } else {
                    LabeledContent("Name", value: dog.name)
                    LabeledContent("Alter", value: "\(dog.age) Jahr\(dog.age == 1 ? "" : "e")")
                }
            }

            Section("Rasse") {
                if isEditing {
                    Button {
                        showBreedPicker = true
                    } label: {
                        HStack {
                            Text(selectedBreed?.breedName ?? dog.breedName ?? "Rasse wählen")
                                .foregroundStyle(.primary)
                            Spacer()
                            Image(systemName: "chevron.right").foregroundStyle(.secondary).font(.footnote)
                        }
                    }
                } else {
                    NavigationLink {
                        BreedDetailView(breedId: dog.breedId)
                    } label: {
                        LabeledContent("Rasse", value: dog.breedName ?? "Unbekannt")
                    }
                }
            }

            if let error = viewModel.errorMessage {
                Section { Text(error).foregroundStyle(.red).font(.footnote) }
            }
        }
        .navigationTitle(dog.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                if isEditing {
                    Button("Speichern") {
                        Task {
                            await viewModel.updateDog(
                                id: dog.id,
                                name: name,
                                age: age,
                                breedId: selectedBreed?.id ?? dog.breedId
                            )
                            isEditing = false
                            dismiss()
                        }
                    }
                } else {
                    Button("Bearbeiten") { isEditing = true }
                }
            }
        }
        .sheet(isPresented: $showBreedPicker) {
            BreedPickerView(breeds: viewModel.breeds, selectedBreed: $selectedBreed)
        }
        .task {
            if viewModel.breeds.isEmpty { await viewModel.loadBreeds() }
        }
    }
}