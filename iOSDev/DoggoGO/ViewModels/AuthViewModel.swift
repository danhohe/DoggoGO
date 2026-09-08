import Foundation

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated: Bool = false
    @Published var isLoading = false
    @Published var errorMessage: String?

    init() {
        isAuthenticated = AuthService.shared.isLoggedIn
    }

    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let response: ApiResponse<AuthResponse> = try await APIService.shared.post(
                endpoint: "/api/owners/login",
                body: LoginRequest(email: email, password: password)
            )
            if let token = response.data?.token {
                AuthService.shared.saveToken(token)
                isAuthenticated = true
            } else {
                errorMessage = response.error ?? "Anmeldung fehlgeschlagen."
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func register(name: String, email: String, password: String, phone: String?) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let _: ApiResponse<RegisterResponse> = try await APIService.shared.post(
                endpoint: "/api/owners/register",
                body: RegisterRequest(name: name, email: email, password: password, phoneNumber: phone?.isEmpty == true ? nil : phone)
            )
            await login(email: email, password: password)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func logout() {
        AuthService.shared.deleteToken()
        isAuthenticated = false
    }
}