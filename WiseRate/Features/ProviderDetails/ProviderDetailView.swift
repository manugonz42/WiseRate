import SwiftUI

struct ProviderDetailView: View {
    @State private var viewModel = ProviderDetailViewModel()
    @EnvironmentObject var navigation: NavigationState
    
    let providerID: String
    
    var body: some View {
        ScrollView {
            VStack(spacing: SRSpacing.xxl) {
                if viewModel.isLoading {
                    loadingView
                } else if let provider = viewModel.provider {
                    providerHeader(provider)
                    trustSection(provider)
                    feesSection(provider)
                    deliveryMethodsSection(provider)
                    prosConsSection(provider)
                    transferLimitsSection(provider)
                    ctaSection(provider)
                } else {
                    notFoundView
                }
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
        .task {
            await viewModel.loadProvider(id: providerID)
        }
    }
    
    private var loadingView: some View {
        VStack {
            Spacer()
            ProgressView()
            Spacer()
        }
        .frame(maxWidth: .infinity, minHeight: 400)
    }
    
    private var notFoundView: some View {
        VStack(spacing: SRSpacing.lg) {
            Spacer()
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(Color.brand.textTertiary)
            Text("Provider not found")
                .font(SRTypography.headline)
                .foregroundColor(Color.brand.textSecondary)
            Spacer()
        }
        .frame(maxWidth: .infinity, minHeight: 400)
    }
    
    private func providerHeader(_ provider: ProviderDetail) -> some View {
        VStack(spacing: SRSpacing.lg) {
            ZStack {
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color.brand.primary.opacity(0.15))
                    .frame(width: 80, height: 80)
                Text(provider.iconName)
                    .font(SRTypography.number(28))
                    .fontWeight(.bold)
                    .foregroundColor(Color.brand.primary)
            }
            
            VStack(spacing: SRSpacing.sm) {
                Text(provider.name)
                    .font(SRTypography.title1)
                    .foregroundColor(Color.brand.textPrimary)
                
                HStack(spacing: SRSpacing.md) {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.system(size: 12))
                            .foregroundColor(Color.brand.warning)
                        Text(String(format: "%.1f", provider.userRating))
                            .font(SRTypography.subhead)
                            .foregroundColor(Color.brand.textPrimary)
                    }
                    
                    HStack(spacing: 4) {
                        Image(systemName: "checkmark.shield.fill")
                            .font(.system(size: 12))
                            .foregroundColor(Color.brand.success)
                        Text("\(Int(provider.trustScore * 20))% Trust")
                            .font(SRTypography.subhead)
                            .foregroundColor(Color.brand.textPrimary)
                    }
                    
                    HStack(spacing: 4) {
                        Image(systemName: "person.2.fill")
                            .font(.system(size: 12))
                            .foregroundColor(Color.brand.textTertiary)
                        Text("\(provider.reviewCount / 1000)k reviews")
                            .font(SRTypography.subhead)
                            .foregroundColor(Color.brand.textSecondary)
                    }
                }
            }
            
            Text(provider.description)
                .font(SRTypography.subhead)
                .foregroundColor(Color.brand.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, SRSpacing.lg)
        }
        .padding(SRSpacing.xl)
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private func trustSection(_ provider: ProviderDetail) -> some View {
        VStack(alignment: .leading, spacing: SRSpacing.lg) {
            SRSectionHeader(title: "Trust Score")
            
            VStack(spacing: SRSpacing.md) {
                HStack {
                    Text("Score")
                        .font(SRTypography.subhead)
                        .foregroundColor(Color.brand.textSecondary)
                    Spacer()
                    Text("\(Int(provider.trustScore * 20))%")
                        .font(SRTypography.number(18))
                        .foregroundColor(Color.brand.success)
                }
                
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.brand.surface)
                            .frame(height: 8)
                        
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.brand.gradientPrimary)
                            .frame(width: geometry.size.width * (provider.trustScore / 5), height: 8)
                    }
                }
                .frame(height: 8)
                
                HStack {
                    Text("0")
                        .font(SRTypography.caption2)
                        .foregroundColor(Color.brand.textTertiary)
                    Spacer()
                    Text("5.0")
                        .font(SRTypography.caption2)
                        .foregroundColor(Color.brand.textTertiary)
                }
            }
        }
        .srCard()
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private func feesSection(_ provider: ProviderDetail) -> some View {
        VStack(alignment: .leading, spacing: SRSpacing.lg) {
            SRSectionHeader(title: "Fee Structure")
            
            VStack(spacing: SRSpacing.sm) {
                ForEach(provider.fees) { fee in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(fee.method.rawValue)
                                .font(SRTypography.subhead)
                                .foregroundColor(Color.brand.textPrimary)
                            Text(fee.description)
                                .font(SRTypography.caption2)
                                .foregroundColor(Color.brand.textTertiary)
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 2) {
                            if fee.fixedFee > 0 {
                                Text("€\(String(format: "%.2f", fee.fixedFee))")
                                    .font(SRTypography.subhead)
                                    .fontWeight(.medium)
                                    .foregroundColor(Color.brand.textPrimary)
                            }
                            if fee.percentageFee > 0 {
                                Text("\(String(format: "%.2f", fee.percentageFee))%")
                                    .font(SRTypography.caption)
                                    .foregroundColor(Color.brand.textSecondary)
                            }
                        }
                    }
                    .padding(.vertical, SRSpacing.sm)
                    
                    if fee.id != provider.fees.last?.id {
                        SRDivider()
                    }
                }
            }
        }
        .srCard()
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private func deliveryMethodsSection(_ provider: ProviderDetail) -> some View {
        VStack(alignment: .leading, spacing: SRSpacing.lg) {
            SRSectionHeader(title: "Delivery Methods")
            
            HStack(spacing: SRSpacing.sm) {
                ForEach(provider.deliveryMethods, id: \.self) { method in
                    HStack(spacing: SRSpacing.xs) {
                        Image(systemName: method.icon)
                            .font(.system(size: 12))
                            .foregroundColor(Color.brand.primary)
                        Text(method.rawValue)
                            .font(SRTypography.caption)
                            .foregroundColor(Color.brand.textPrimary)
                    }
                    .padding(.horizontal, SRSpacing.md)
                    .padding(.vertical, SRSpacing.sm)
                    .background(Color.brand.primary.opacity(0.1))
                    .clipShape(Capsule())
                }
            }
        }
        .srCard()
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private func prosConsSection(_ provider: ProviderDetail) -> some View {
        HStack(alignment: .top, spacing: SRSpacing.md) {
            VStack(alignment: .leading, spacing: SRSpacing.md) {
                HStack(spacing: SRSpacing.sm) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(Color.brand.success)
                    Text("Pros")
                        .font(SRTypography.headline)
                        .foregroundColor(Color.brand.textPrimary)
                }
                
                ForEach(provider.pros, id: \.self) { pro in
                    HStack(alignment: .top, spacing: SRSpacing.sm) {
                        Image(systemName: "checkmark")
                            .font(.system(size: 10))
                            .foregroundColor(Color.brand.success)
                            .padding(.top, 3)
                        Text(pro)
                            .font(SRTypography.caption)
                            .foregroundColor(Color.brand.textSecondary)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(alignment: .leading, spacing: SRSpacing.md) {
                HStack(spacing: SRSpacing.sm) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(Color.brand.error)
                    Text("Cons")
                        .font(SRTypography.headline)
                        .foregroundColor(Color.brand.textPrimary)
                }
                
                ForEach(provider.cons, id: \.self) { con in
                    HStack(alignment: .top, spacing: SRSpacing.sm) {
                        Image(systemName: "xmark")
                            .font(.system(size: 10))
                            .foregroundColor(Color.brand.error)
                            .padding(.top, 3)
                        Text(con)
                            .font(SRTypography.caption)
                            .foregroundColor(Color.brand.textSecondary)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .srCard()
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private func transferLimitsSection(_ provider: ProviderDetail) -> some View {
        VStack(alignment: .leading, spacing: SRSpacing.lg) {
            SRSectionHeader(title: "Transfer Limits")
            
            HStack(spacing: SRSpacing.xl) {
                VStack(alignment: .leading, spacing: SRSpacing.xs) {
                    Text("Minimum")
                        .font(SRTypography.caption)
                        .foregroundColor(Color.brand.textTertiary)
                    Text("€\(String(format: "%.0f", provider.transferLimits.minAmount))")
                        .font(SRTypography.number(18))
                        .foregroundColor(Color.brand.textPrimary)
                }
                
                VStack(alignment: .leading, spacing: SRSpacing.xs) {
                    Text("Maximum")
                        .font(SRTypography.caption)
                        .foregroundColor(Color.brand.textTertiary)
                    Text("€\(formatLimits(provider.transferLimits.maxAmount))")
                        .font(SRTypography.number(18))
                        .foregroundColor(Color.brand.textPrimary)
                }
                
                Spacer()
            }
        }
        .srCard()
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private func formatLimits(_ value: Double) -> String {
        if value >= 1000000 {
            return String(format: "%.0fM", value / 1000000)
        } else if value >= 1000 {
            return String(format: "%.0fK", value / 1000)
        }
        return String(format: "%.0f", value)
    }
    
    private func ctaSection(_ provider: ProviderDetail) -> some View {
        VStack(spacing: SRSpacing.md) {
            SRPrimaryButton(
                title: "Transfer Now",
                icon: "arrow.right",
                action: {
                    viewModel.trackClick(source: "detail_cta")
                }
            )
            
            if let affiliateURL = provider.affiliateURL {
                Button {
                    viewModel.trackClick(source: "affiliate_link")
                } label: {
                    Text("Visit \(provider.name) website")
                        .font(SRTypography.subhead)
                        .foregroundColor(Color.brand.primary)
                        .underline()
                }
            }
        }
        .padding(.horizontal, SRSpacing.screenPadding)
    }
}

#Preview {
    NavigationStack {
        ProviderDetailView(providerID: "wise")
            .environmentObject(NavigationState())
    }
}
