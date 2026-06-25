import SwiftUI

struct ProfileView: View {
    @State private var viewModel = ProfileViewModel()
    @EnvironmentObject var navigation: NavigationState
    
    var body: some View {
        ScrollView {
            VStack(spacing: SRSpacing.xxl) {
                headerSection
                userCard
                menuSection
                premiumBanner
                versionInfo
            }
            .padding(.bottom, SRSpacing.xxxxl)
        }
        .background(Color.brand.background)
    }
    
    private var headerSection: some View {
        HStack {
            Text("Profile")
                .font(SRTypography.title1)
                .foregroundColor(Color.brand.textPrimary)
            Spacer()
        }
        .padding(.horizontal, SRSpacing.screenPadding)
        .padding(.top, SRSpacing.lg)
    }
    
    private var userCard: some View {
        VStack(spacing: SRSpacing.lg) {
            SRAvatar(name: viewModel.user.name, size: 64)
            
            VStack(spacing: SRSpacing.xs) {
                Text(viewModel.user.name)
                    .font(SRTypography.title2)
                    .foregroundColor(Color.brand.textPrimary)
                
                Text(viewModel.user.email)
                    .font(SRTypography.subhead)
                    .foregroundColor(Color.brand.textSecondary)
            }
            
            HStack(spacing: SRSpacing.md) {
                StatBadge(title: "Comparisons", value: "142")
                StatBadge(title: "Saved", value: "€340")
                StatBadge(title: "Referrals", value: "\(viewModel.user.favoriteProviders.count)")
            }
        }
        .padding(SRSpacing.xl)
        .background(Color.brand.surfaceElevated)
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous)
                .stroke(Color.brand.border, lineWidth: 0.5)
        )
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private var menuSection: some View {
        VStack(spacing: SRSpacing.sm) {
            MenuRow(icon: "gearshape", title: "Settings", iconColor: Color.brand.textSecondary) {
                navigation.navigate(to: .settings)
            }
            
            MenuRow(icon: "gift", title: "Referral Center", iconColor: Color.brand.primary) {
                navigation.navigate(to: .referral)
            }
            
            MenuRow(icon: "creditcard", title: "Premium", iconColor: Color.brand.warning) {
                navigation.navigate(to: .premium)
            }
            
            MenuRow(icon: "questionmark.circle", title: "Help & Support", iconColor: Color.brand.accent) {}
            
            MenuRow(icon: "doc.text", title: "Terms of Service", iconColor: Color.brand.textTertiary) {}
            
            MenuRow(icon: "lock.shield", title: "Privacy Policy", iconColor: Color.brand.textTertiary) {}
        }
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private var premiumBanner: some View {
        VStack(alignment: .leading, spacing: SRSpacing.lg) {
            HStack(spacing: SRSpacing.sm) {
                Image(systemName: "star.fill")
                    .font(.system(size: 16))
                    .foregroundColor(Color.brand.warning)
                Text("Go Premium")
                    .font(SRTypography.headline)
                    .foregroundColor(Color.brand.textPrimary)
            }
            
            Text("Unlock rate alerts, historical analytics, and unlimited comparisons")
                .font(SRTypography.subhead)
                .foregroundColor(Color.brand.textSecondary)
            
            SRPrimaryButton(title: "Start Free Trial", icon: "sparkles", action: {
                navigation.navigate(to: .premium)
            })
        }
        .padding(SRSpacing.xl)
        .background(
            LinearGradient(
                colors: [Color.brand.primary.opacity(0.15), Color.brand.surfaceElevated],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous)
                .stroke(Color.brand.primary.opacity(0.2), lineWidth: 0.5)
        )
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private var versionInfo: some View {
        VStack(spacing: SRSpacing.xs) {
            Text("SendRate v1.0.0")
                .font(SRTypography.caption)
                .foregroundColor(Color.brand.textTertiary)
            Text("Made with ❤️ for Filipinos in Spain")
                .font(SRTypography.caption2)
                .foregroundColor(Color.brand.textTertiary)
        }
        .padding(.top, SRSpacing.lg)
    }
}

struct StatBadge: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(SRTypography.number(18))
                .foregroundColor(Color.brand.textPrimary)
            Text(title)
                .font(SRTypography.caption2)
                .foregroundColor(Color.brand.textTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, SRSpacing.sm)
        .background(Color.brand.surface)
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.smallCornerRadius, style: .continuous))
    }
}

struct MenuRow: View {
    let icon: String
    let title: String
    let iconColor: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: SRSpacing.md) {
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(iconColor)
                    .frame(width: 24)
                
                Text(title)
                    .font(SRTypography.subhead)
                    .foregroundColor(Color.brand.textPrimary)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(Color.brand.textTertiary)
            }
            .padding(SRSpacing.lg)
            .background(Color.brand.surfaceElevated)
            .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(NavigationState())
}
