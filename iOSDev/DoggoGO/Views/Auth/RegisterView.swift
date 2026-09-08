import SwiftUI

struct RegisterView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var phone = ""

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "person.badge.plus")
                .font(.system(size: 56))
                .foregroundStyle(.brown)

            Text("Registrieren")
                .font(.title.bold())

            VStack(spacing: 16) {
                TextField("Name", text: $name)
                    .textFieldStyle(.roundedBorder)

                TextField("E-Mail", text: $email)
                    .keyboardType(.emailAddress)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)
                    .textFieldStyle(.roundedBorder)

                SecureField("Passwort", text: $password)
                    .textFieldStyle(.roundedBorder)

                TextField("Telefonnummer (optional)", text: $phone)
                    .keyboardType(.phonePad)
                    .textFieldStyle(.roundedBorder)
            }
            .padding(.horizontal)

            if let error = authViewModel.errorMessage {
                Text(error)
                    .foregroundStyle(.red)
                    .font(.footnote)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }

            Button {
                Task {
                    await authViewModel.register(
                        name: name, email: email,
                        password: password, phone: phone
                    )
                }
            } label: {
                if authViewModel.isLoading {
                    ProgressView().frame(maxWidth: .infinity)
                } else {
                    Text("Konto erstellen").frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.borderedProminent)
            .tint(.brown)
            .padding(.horizontal)
            .disabled(name.isEmpty || email.isEmpty || password.isEmpty || authViewModel.isLoading)

            Spacer()
        }
        .navigationTitle("Registrieren")
        .navigationBarTitleDisplayMode(.inline)
    }
}