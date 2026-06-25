import SwiftUI

struct ReferralView: View {
    @State private var viewModel = ReferralViewModel()
    @EnvironmentObject var navigation: NavigationState
    
    var body: some View {
        ScrollView {
            VStack(spacing: SRSpacing.xxl) {
                headerSection
                statsSection
                codeSection
                howItWorksSection
                shareSection
            }
            .padding(.bottom, SRSpacing.xxxxl)
        }
        .background(Color.brand.background)
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button {
                    navigation.navigateBack()
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(Color.brand.textPrimary)
                }
            }
        }
    }
    
    private var headerSection: some View {
        VStack(spacing: SRSpacing.lg) {
            Image(systemName: "gift.fill")
                .font(.system(size: 48))
                .foregroundColor(Color.brand.primary)
            
            VStack(spacing: SRSpacing.sm) {
                Text("Refer & Earn")
                    .font(SRTypography.title1)
                    .foregroundColor(Color.brand.textPrimary)
                
                Text("Invite friends and earn rewards")
                    .font(SRTypography.subhead)
                    .foregroundColor(Color.brand.textSecondary)
            }
        }
        .padding(.top, SRSpacing.xxl)
    }
    
    private var statsSection: some View {
        HStack(spacing: SRSpacing.md) {
            ReferralStat(
                title: "Referrals",
                value: "\(viewModel.referralCount)",
                icon: "person.2.fill"
            )
            
            ReferralStat(
                title: "Earned",
                value: "€\(String(format: "%.2f", viewModel.referralEarnings))",
                icon: "eurosign.circle.fill"
            )
        }
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private var codeSection: some View {
        VStack(spacing: SRSpacing.lg) {
            SRSectionHeader(title: "Your Referral Code")
            
            VStack(spacing: SRSpacing.md) {
                Text(viewModel.referralCode)
                    .font(SRTypography.number(32))
                    .foregroundColor(Color.brand.primary)
                    .padding(SRSpacing.xl)
                    .frame(maxWidth: .infinity)
                    .background(Color.brand.primary.opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous)
                            .stroke(Color.brand.primary.opacity(0.2), lineWidth: 0.5)
                    )
                
                Button {
                    viewModel.copyCode()
                } label: {
                    HStack(spacing: SRSpacing.sm) {
                        Image(systemName: "doc.on.doc")
                        Text("Copy Code")
                    }
                    .font(SRTypography.subhead)
                    .foregroundColor(Color.brand.primary)
                    .padding(.horizontal, SRSpacing.lg)
                    .padding(.vertical, SRSpacing.sm)
                    .background(Color.brand.primary.opacity(0.1))
                    .clipShape(Capsule())
                }
            }
        }
        .srCard()
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private var howItWorksSection: some View {
        VStack(alignment: .leading, spacing: SRSpacing.lg) {
            SRSectionHeader(title: "How It Works")
            
            VStack(spacing: SRSpacing.md) {
                HowItWorksRow(
                    step: "1",
                    title: "Share your code",
                    subtitle: "Send your referral code to friends"
                )
                
                HowItWorksRow(
                    step: "2",
                    title: "They sign up",
                    subtitle: "Your friend creates a free account"
                )
                
                HowItWorksRow(
                    step: "3",
                    title: "Both earn rewards",
                    subtitle: "You both get €5 credit when they make their first transfer"
                )
            }
        }
        .srCard()
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private var shareSection: some View {
        VStack(spacing: SRSpacing.md) {
            SRPrimaryButton(
                title: "Share Referral Link",
                icon: "square.and.arrow.up",
                action: {
                    viewModel.share()
                }
            )
            
            Text("Share via WhatsApp, Facebook, or any messaging app")
                .font(SRTypography.caption)
                .foregroundColor(Color.brand.textTertiary)
        }
        .padding(.horizontal, SRSpacing.screenPadding)
    }
}

struct ReferralStat: View {
    let title: String
    let value: String
    let icon: String
    
    var body: some View {
        VStack(spacing: SRSpacing.sm) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(Color.brand.primary)
            
            Text(value)
                .font(SRTypography.number(24))
                .foregroundColor(Color.brand.textPrimary)
            
            Text(title)
                .font(SRTypography.caption)
                .foregroundColor(Color.brand.textTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(SRSpacing.xl)
        .background(Color.brand.surfaceElevated)
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
    }
}

struct HowItWorksRow: View {
    let step: String
    let title: String
    let subtitle: String
    
    var body: some View {
        HStack(spacing: SRSpacing.md) {
            Text(step)
                .font(SRTypography.number(16))
                .fontWeight(.bold)
                .foregroundColor(Color.brand.primary)
                .frame(width: 32, height: 32)
                .background(Color.brand.primary.opacity(0.1))
                .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(SRTypography.subhead)
                    .fontWeight(.medium)
                    .foregroundColor(Color.brand.textPrimary)
                Text(subtitle)
                    .font(SRTypography.caption)
                    .foregroundColor(Color.brand.textSecondary)
            }
        }
    }
}

#Preview {
    NavigationStack {
        ReferralView()
            .environmentObject(NavigationState())
    }
}
