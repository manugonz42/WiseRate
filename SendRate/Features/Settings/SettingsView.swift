import SwiftUI

struct SettingsView: View {
    @State private var viewModel = SettingsViewModel()
    @EnvironmentObject var navigation: NavigationState
    
    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack(spacing: SRSpacing.md) {
                        Image(systemName: "bell")
                            .foregroundColor(Color.brand.primary)
                        Text("Notifications")
                        Spacer()
                        Toggle("", isOn: $viewModel.notificationsEnabled)
                            .tint(Color.brand.primary)
                    }
                    
                    HStack(spacing: SRSpacing.md) {
                        Image(systemName: "moon")
                            .foregroundColor(Color.brand.primary)
                        Text("Dark Mode")
                        Spacer()
                        Toggle("", isOn: $viewModel.darkModeEnabled)
                            .tint(Color.brand.primary)
                    }
                }
                
                Section("Default Amount") {
                    HStack(spacing: SRSpacing.md) {
                        Image(systemName: "eurosign")
                            .foregroundColor(Color.brand.primary)
                        TextField("Default amount", text: $viewModel.defaultAmount)
                            .keyboardType(.numberPad)
                    }
                }
                
                Section("Language") {
                    HStack(spacing: SRSpacing.md) {
                        Image(systemName: "globe")
                            .foregroundColor(Color.brand.primary)
                        Picker("Language", selection: $viewModel.language) {
                            Text("English").tag("English")
                            Text("Español").tag("Español")
                            Text("Tagalog").tag("Tagalog")
                        }
                    }
                }
                
                Section("Data") {
                    Button {
                        Task {
                            await viewModel.clearCache()
                        }
                    } label: {
                        HStack(spacing: SRSpacing.md) {
                            Image(systemName: "trash")
                                .foregroundColor(Color.brand.error)
                            Text("Clear Cache")
                                .foregroundColor(Color.brand.error)
                            Spacer()
                            if viewModel.isClearingCache {
                                ProgressView()
                            }
                        }
                    }
                }
                
                Section {
                    Button("Sign Out") {
                        // Sign out
                    }
                    .foregroundColor(Color.brand.error)
                }
            }
            .background(Color.brand.background)
            .scrollContentBackground(.hidden)
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(NavigationState())
}
