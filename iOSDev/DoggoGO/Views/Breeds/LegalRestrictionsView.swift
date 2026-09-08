import SwiftUI

struct LegalRestrictionsView: View {
    let restrictions: LegalRestrictions

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if restrictions.isSpecialBreed {
                HStack(spacing: 6) {
                    Image(systemName: "exclamationmark.triangle.fill")
                    Text("Spezielle Hunderasse!")
                        .fontWeight(.bold)
                }
                .foregroundStyle(.red)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.red.opacity(0.1), in: RoundedRectangle(cornerRadius: 8))
            }

            Text("Gesetzliche Vorschriften")
                .font(.headline)

            ForEach(restrictions.rules, id: \.self) { rule in
                Label(rule, systemImage: "exclamationmark.circle")
                    .font(.callout)
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 12))
        .padding(.horizontal)
    }
}