import SwiftUI

struct OnboardingView: View {
    @State private var viewModel = OnboardingViewModel()
    @EnvironmentObject var navigation: NavigationState
    
    var body: some View {
        ZStack {
            Color.brand.background.ignoresSafeArea()
            
            VStack(spacing: 0) {
                TabView(selection: $viewModel.currentPage) {
                    welcomePage.tag(0)
                    featuresPage.tag(1)
                    currencyPage.tag(2)
                    notificationsPage.tag(3)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut, value: viewModel.currentPage)
                
                bottomSection
            }
        }
    }
    
    private var welcomePage: some View {
        VStack(spacing: SRSpacing.xxxl) {
            Spacer()
            
            VStack(spacing: SRSpacing.xl) {
                Image(systemName: "paperplane.fill")
                    .font(.system(size: 72))
                    .foregroundStyle(Color.brand.gradientPrimary)
                
                VStack(spacing: SRSpacing.md) {
                    Text("SulitSend")
                        .font(SRTypography.largeTitle)
                        .foregroundStyle(Color.brand.gradientPrimary)
                    
                    Text("Find the cheapest way to send money from Spain to the Philippines")
                        .font(SRTypography.body)
                        .foregroundColor(Color.brand.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, SRSpacing.xxl)
                }
            }
            
            Spacer()
        }
    }
    
    private var featuresPage: some View {
        VStack(spacing: SRSpacing.xxxl) {
            Spacer()
            
            VStack(spacing: SRSpacing.xxl) {
                featureItem(icon: "chart.bar.doc.horizontal", title: "Compare Providers", subtitle: "See real rates from 15+ providers")
                featureItem(icon: "bolt.fill", title: "Best Rates", subtitle: "Always get the most PHP for your EUR")
                featureItem(icon: "bell.badge", title: "Rate Alerts", subtitle: "Get notified when rates are favorable")
            }
            .padding(.horizontal, SRSpacing.xxxl)
            
            Spacer()
        }
    }
    
    private var currencyPage: some View {
        VStack(spacing: SRSpacing.xxxl) {
            Spacer()
            
            VStack(spacing: SRSpacing.xxl) {
                Image(systemName: "eurosign.arrow.trianglehead.circlepath")
                    .font(.system(size: 48))
                    .foregroundColor(Color.brand.primary)
                
                VStack(spacing: SRSpacing.lg) {
                    Text("Select Your Currencies")
                        .font(SRTypography.title2)
                        .foregroundColor(Color.brand.textPrimary)
                    
                    HStack(spacing: SRSpacing.xl) {
                        currencyButton(code: "EUR", name: "Euro", isSelected: viewModel.selectedSendCurrency == "EUR") {
                            viewModel.selectedSendCurrency = "EUR"
                        }
                        
                        Image(systemName: "arrow.right")
                            .font(.system(size: 16))
                            .foregroundColor(Color.brand.textTertiary)
                        
                        currencyButton(code: "PHP", name: "Philippine Peso", isSelected: viewModel.selectedReceiveCurrency == "PHP") {
                            viewModel.selectedReceiveCurrency = "PHP"
                        }
                    }
                }
            }
            
            Spacer()
        }
    }
    
    private var notificationsPage: some View {
        VStack(spacing: SRSpacing.xxxl) {
            Spacer()
            
            VStack(spacing: SRSpacing.xxl) {
                Image(systemName: "bell.badge")
                    .font(.system(size: 48))
                    .foregroundColor(Color.brand.primary)
                
                VStack(spacing: SRSpacing.lg) {
                    Text("Stay Updated")
                        .font(SRTypography.title2)
                        .foregroundColor(Color.brand.textPrimary)
                    
                    Text("Get alerts when EUR/PHP reaches your target rate")
                        .font(SRTypography.subhead)
                        .foregroundColor(Color.brand.textSecondary)
                        .multilineTextAlignment(.center)
                    
                    Toggle("Enable Notifications", isOn: $viewModel.notificationsEnabled)
                        .tint(Color.brand.primary)
                        .padding(SRSpacing.lg)
                        .background(Color.brand.surfaceElevated)
                        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
                }
                .padding(.horizontal, SRSpacing.xxl)
            }
            
            Spacer()
        }
    }
    
    private var bottomSection: some View {
        VStack(spacing: SRSpacing.lg) {
            // Page indicators
            HStack(spacing: SRSpacing.sm) {
                ForEach(0..<4) { index in
                    Circle()
                        .fill(index == viewModel.currentPage ? Color.brand.primary : Color.brand.textTertiary.opacity(0.3))
                        .frame(width: index == viewModel.currentPage ? 8 : 6, height: index == viewModel.currentPage ? 8 : 6)
                }
            }
            
            // Buttons
            VStack(spacing: SRSpacing.md) {
                SRPrimaryButton(
                    title: viewModel.currentPage == 3 ? "Get Started" : "Continue",
                    icon: viewModel.currentPage == 3 ? "checkmark" : "arrow.right",
                    action: {
                        viewModel.nextPage()
                        if viewModel.isCompleted {
                            navigation.completeOnboarding()
                        }
                    }
                )
                
                if viewModel.currentPage < 3 {
                    Button("Skip") {
                        viewModel.skip()
                        navigation.completeOnboarding()
                    }
                    .font(SRTypography.subhead)
                    .foregroundColor(Color.brand.textSecondary)
                }
            }
            .padding(.horizontal, SRSpacing.screenPadding)
            .padding(.bottom, SRSpacing.xxl)
        }
    }
    
    private func featureItem(icon: String, title: String, subtitle: String) -> some View {
        HStack(spacing: SRSpacing.lg) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(Color.brand.primary)
                .frame(width: 48, height: 48)
                .background(Color.brand.primary.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(SRTypography.headline)
                    .foregroundColor(Color.brand.textPrimary)
                Text(subtitle)
                    .font(SRTypography.subhead)
                    .foregroundColor(Color.brand.textSecondary)
            }
        }
    }
    
    private func currencyButton(code: String, name: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: SRSpacing.sm) {
                Text(code)
                    .font(SRTypography.number(24))
                    .foregroundColor(isSelected ? Color.brand.primary : Color.brand.textPrimary)
                Text(name)
                    .font(SRTypography.caption)
                    .foregroundColor(Color.brand.textSecondary)
            }
            .padding(SRSpacing.xl)
            .frame(maxWidth: .infinity)
            .background(isSelected ? Color.brand.primary.opacity(0.1) : Color.brand.surfaceElevated)
            .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous)
                    .stroke(isSelected ? Color.brand.primary.opacity(0.3) : Color.brand.border, lineWidth: 0.5)
            )
        }
    }
}

#Preview {
    OnboardingView()
        .environmentObject(NavigationState())
}
