import SwiftUI

struct DogListView: View {
    @StateObject private var viewModel = DogListViewModel()
    @State private var showAddDog = false

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.dogs.isEmpty {
                    ProgressView("Laden…")
                } else if viewModel.dogs.isEmpty {
                    ContentUnavailableView(
                        "Keine Hunde",
                        systemImage: "pawprint.slash",
                        description: Text("Füge deinen ersten Hund hinzu.")
                    )
                } else {
                    List {
                        ForEach(viewModel.dogs) { dog in
                            NavigationLink {
                                DogDetailView(dog: dog, viewModel: viewModel)
                            } label: {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(dog.name).font(.headline)
                                    Text("\(dog.breedName ?? "Unbekannte Rasse") · \(dog.age) Jahr\(dog.age == 1 ? "" : "e")")
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                }
                                .padding(.vertical, 4)
                            }
                        }
                        .onDelete { offsets in
                            for index in offsets {
                                Task { await viewModel.deleteDog(id: viewModel.dogs[index].id) }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Meine Hunde")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showAddDog = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showAddDog) {
                AddDogView(viewModel: viewModel)
            }
            .task { await viewModel.loadDogs() }
            .refreshable { await viewModel.loadDogs() }
        }
    }
}