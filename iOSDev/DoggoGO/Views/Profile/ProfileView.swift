import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack(spacing: 16) {
                        Image(systemName: "person.crop.circle.fill")
                            .font(.system(size: 56))
                            .foregroundStyle(.brown)
                        VStack(alignment: .leading) {
                            Text("Angemeldet")
                                .font(.headline)
                            Text("DoggoGO Nutzer")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 8)
                }

                Section("App-Info") {
                    LabeledContent("Version", value: "1.0.0")
                    LabeledContent("Backend", value: "localhost:5043")
                }

                Section {
                    Button(role: .destructive) {
                        authViewModel.logout()
                    } label: {
                        Label("Abmelden", systemImage: "rectangle.portrait.and.arrow.right")
                    }
                }
            }
            .navigationTitle("Profil")
        }
    }
}