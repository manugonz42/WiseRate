import SwiftUI

struct PremiumView: View {
    @State private var viewModel = PremiumViewModel()
    @EnvironmentObject var navigation: NavigationState
    
    var body: some View {
        ScrollView {
            VStack(spacing: SRSpacing.xxl) {
                headerSection
                featuresSection
                plansSection
                ctaSection
                testimonialsSection
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
                    Image(systemName: "xmark")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(Color.brand.textPrimary)
                }
            }
        }
    }
    
    private var headerSection: some View {
        VStack(spacing: SRSpacing.lg) {
            Image(systemName: "crown.fill")
                .font(.system(size: 48))
                .foregroundColor(Color.brand.warning)
            
            VStack(spacing: SRSpacing.sm) {
                Text("WiseRate Premium")
                    .font(SRTypography.title1)
                    .foregroundColor(Color.brand.textPrimary)
                
                Text("Unlock the full power of rate comparison")
                    .font(SRTypography.subhead)
                    .foregroundColor(Color.brand.textSecondary)
            }
        }
        .padding(.top, SRSpacing.xxl)
    }
    
    private var featuresSection: some View {
        VStack(alignment: .leading, spacing: SRSpacing.lg) {
            SRSectionHeader(title: "Premium Features")
            
            VStack(spacing: SRSpacing.md) {
                FeatureRow(icon: "bell.badge", title: "Rate Alerts", subtitle: "Get instant notifications when rates hit your target", color: Color.brand.primary)
                
                FeatureRow(icon: "chart.line.uptrend.xyaxis", title: "Historical Analytics", subtitle: "Access full historical data and trend analysis", color: Color.brand.accent)
                
                FeatureRow(icon: "arrow.left.arrow.right", title: "Unlimited Comparisons", subtitle: "Compare across all providers without limits", color: Color.brand.success)
                
                FeatureRow(icon: "person.2.fill", title: "Personalized Recommendations", subtitle: "AI-powered suggestions based on your transfer history", color: Color.brand.warning)
                
                FeatureRow(icon: "sparkles", title: "No Ads", subtitle: "Clean, distraction-free experience", color: Color.brand.primaryLight)
            }
        }
        .srCard()
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private var plansSection: some View {
        VStack(alignment: .leading, spacing: SRSpacing.lg) {
            SRSectionHeader(title: "Choose Your Plan")
            
            ForEach(viewModel.plans) { plan in
                PlanCard(
                    plan: plan,
                    isSelected: viewModel.selectedPlan?.id == plan.id,
                    onSelect: { viewModel.selectedPlan = plan }
                )
            }
        }
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private var ctaSection: some View {
        VStack(spacing: SRSpacing.md) {
            SRPrimaryButton(
                title: viewModel.selectedPlan != nil ? "Start 7-Day Free Trial" : "Select a Plan",
                icon: "sparkles",
                action: {
                    Task {
                        await viewModel.purchase()
                    }
                },
                isLoading: viewModel.isLoading
            )
            
            Text("Cancel anytime. No commitment required.")
                .font(SRTypography.caption)
                .foregroundColor(Color.brand.textTertiary)
        }
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private var testimonialsSection: some View {
        VStack(alignment: .leading, spacing: SRSpacing.lg) {
            SRSectionHeader(title: "What Users Say")
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: SRSpacing.md) {
                    TestimonialCard(
                        name: "Ana M.",
                        text: "Saved €200 in my first month! The rate alerts are amazing.",
                        rating: 5
                    )
                    
                    TestimonialCard(
                        name: "Jose R.",
                        text: "Finally a app that shows the real cost of transfers. Love it!",
                        rating: 5
                    )
                    
                    TestimonialCard(
                        name: "Maria L.",
                        text: "The historical charts help me time my transfers perfectly.",
                        rating: 5
                    )
                }
                .padding(.horizontal, SRSpacing.screenPadding)
            }
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let color: Color
    
    var body: some View {
        HStack(spacing: SRSpacing.md) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(color)
                .frame(width: 40, height: 40)
                .background(color.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            
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

struct PlanCard: View {
    let plan: SubscriptionPlan
    let isSelected: Bool
    let onSelect: () -> Void
    
    var body: some View {
        Button(action: onSelect) {
            VStack(alignment: .leading, spacing: SRSpacing.md) {
                HStack {
                    VStack(alignment: .leading, spacing: SRSpacing.xs) {
                        HStack(spacing: SRSpacing.sm) {
                            Text(plan.name)
                                .font(SRTypography.headline)
                                .foregroundColor(Color.brand.textPrimary)
                            
                            if plan.isPopular {
                                SRBadge(text: "POPULAR", color: Color.brand.warning)
                            }
                        }
                        
                        HStack(alignment: .firstTextBaseline, spacing: 4) {
                            Text("€\(String(format: "%.2f", plan.price))")
                                .font(SRTypography.number(28))
                                .foregroundColor(Color.brand.textPrimary)
                            Text("/\(plan.period)")
                                .font(SRTypography.caption)
                                .foregroundColor(Color.brand.textTertiary)
                        }
                    }
                    
                    Spacer()
                    
                    Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                        .font(.system(size: 24))
                        .foregroundColor(isSelected ? Color.brand.primary : Color.brand.textTertiary)
                }
                
                VStack(alignment: .leading, spacing: SRSpacing.xs) {
                    ForEach(plan.features, id: \.self) { feature in
                        HStack(spacing: SRSpacing.sm) {
                            Image(systemName: "checkmark")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(Color.brand.success)
                            Text(feature)
                                .font(SRTypography.caption)
                                .foregroundColor(Color.brand.textSecondary)
                        }
                    }
                }
            }
            .padding(SRSpacing.xl)
            .background(isSelected ? Color.brand.primary.opacity(0.08) : Color.brand.surfaceElevated)
            .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous)
                    .stroke(isSelected ? Color.brand.primary.opacity(0.3) : Color.brand.border, lineWidth: 0.5)
            )
        }
    }
}

struct TestimonialCard: View {
    let name: String
    let text: String
    let rating: Int
    
    var body: some View {
        VStack(alignment: .leading, spacing: SRSpacing.md) {
            HStack(spacing: 2) {
                ForEach(0..<5) { i in
                    Image(systemName: i < rating ? "star.fill" : "star")
                        .font(.system(size: 10))
                        .foregroundColor(Color.brand.warning)
                }
            }
            
            Text("\"\(text)\"")
                .font(SRTypography.caption)
                .foregroundColor(Color.brand.textSecondary)
                .lineLimit(3)
            
            Text(name)
                .font(SRTypography.caption)
                .fontWeight(.medium)
                .foregroundColor(Color.brand.textPrimary)
        }
        .frame(width: 200)
        .padding(SRSpacing.lg)
        .background(Color.brand.surface)
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
    }
}

#Preview {
    NavigationStack {
        PremiumView()
            .environmentObject(NavigationState())
    }
}
