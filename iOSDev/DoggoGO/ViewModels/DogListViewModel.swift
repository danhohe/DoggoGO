import Foundation

@MainActor
class DogListViewModel: ObservableObject {
    @Published var dogs: [Dog] = []
    @Published var breeds: [Breed] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    func loadDogs() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let response: ApiResponse<[Dog]> = try await APIService.shared.get(endpoint: "/api/dogs")
            dogs = response.data ?? []
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func loadBreeds() async {
        do {
            let response: ApiResponse<[Breed]> = try await APIService.shared.get(endpoint: "/api/breeds")
            breeds = response.data ?? []
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func createDog(name: String, age: Int, breedId: UUID) async -> Bool {
        isLoading = true
        defer { isLoading = false }
        do {
            let _: ApiResponse<Dog> = try await APIService.shared.post(
                endpoint: "/api/dogs",
                body: CreateDogRequest(name: name, age: age, breedId: breedId)
            )
            await loadDogs()
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    func updateDog(id: UUID, name: String, age: Int, breedId: UUID) async {
        isLoading = true
        defer { isLoading = false }
        do {
            let _: ApiResponse<Dog> = try await APIService.shared.put(
                endpoint: "/api/dogs/\(id)",
                body: UpdateDogRequest(name: name, age: age, breedId: breedId)
            )
            await loadDogs()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func deleteDog(id: UUID) async {
        do {
            let _: ApiResponse<String> = try await APIService.shared.delete(endpoint: "/api/dogs/\(id)")
            dogs.removeAll { $0.id == id }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}