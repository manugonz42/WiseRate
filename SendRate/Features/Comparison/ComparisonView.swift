import SwiftUI

struct ComparisonView: View {
    @State private var viewModel = ComparisonViewModel()
    @EnvironmentObject var navigation: NavigationState
    
    var initialAmount: Double? = nil
    
    var body: some View {
        VStack(spacing: 0) {
            headerSection
            filterSection
            resultsSection
        }
        .background(Color.brand.background)
        .task {
            let amount = initialAmount ?? 1000
            await viewModel.loadQuotes(amount: amount)
        }
    }
    
    private var headerSection: some View {
        VStack(spacing: SRSpacing.md) {
            HStack {
                Text("Compare")
                    .font(SRTypography.title1)
                    .foregroundColor(Color.brand.textPrimary)
                Spacer()
                Text("€\(String(format: "%.0f", initialAmount ?? 1000)) → ₱")
                    .font(SRTypography.subhead)
                    .foregroundColor(Color.brand.textSecondary)
            }
            
            SRSearchField(text: $viewModel.searchText, placeholder: "Search providers...")
        }
        .padding(SRSpacing.screenPadding)
    }
    
    private var filterSection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: SRSpacing.sm) {
                ForEach(SortOption.allCases, id: \.self) { option in
                    SRChip(
                        title: option.rawValue,
                        color: Color.brand.primary,
                        isSelected: viewModel.sortOption == option,
                        action: { viewModel.sortOption = option }
                    )
                }
            }
            .padding(.horizontal, SRSpacing.screenPadding)
        }
        .padding(.vertical, SRSpacing.sm)
    }
    
    private var resultsSection: some View {
        Group {
            if viewModel.isLoading {
                VStack {
                    Spacer()
                    ProgressView()
                        .scaleEffect(1.2)
                    Text("Comparing providers...")
                        .font(SRTypography.subhead)
                        .foregroundColor(Color.brand.textTertiary)
                        .padding(.top, SRSpacing.md)
                    Spacer()
                }
            } else if viewModel.filteredQuotes.isEmpty {
                VStack(spacing: SRSpacing.lg) {
                    Spacer()
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 48))
                        .foregroundColor(Color.brand.textTertiary)
                    Text("No results found")
                        .font(SRTypography.headline)
                        .foregroundColor(Color.brand.textSecondary)
                    Text("Try adjusting your search or filters")
                        .font(SRTypography.subhead)
                        .foregroundColor(Color.brand.textTertiary)
                    Spacer()
                }
            } else {
                ScrollView {
                    VStack(spacing: SRSpacing.md) {
                        if let best = viewModel.bestQuote {
                            bestDealBanner(quote: best)
                        }
                        
                        ForEach(viewModel.filteredQuotes) { quote in
                            ComparisonRow(quote: quote, isBest: quote.id == viewModel.bestQuote?.id)
                                .onTapGesture {
                                    navigation.navigate(to: .providerDetail(quote.providerID))
                                }
                        }
                    }
                    .padding(.horizontal, SRSpacing.screenPadding)
                    .padding(.bottom, SRSpacing.xxxxl)
                }
            }
        }
    }
    
    private func bestDealBanner(quote: TransferQuote) -> some View {
        HStack(spacing: SRSpacing.md) {
            Image(systemName: "star.fill")
                .font(.system(size: 20))
                .foregroundColor(Color.brand.warning)
            
            VStack(alignment: .leading, spacing: 2) {
                Text("Best Deal")
                    .font(SRTypography.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(Color.brand.warning)
                Text("\(quote.providerName) — ₱\(String(format: "%,.0f", quote.receiveAmount))")
                    .font(SRTypography.subhead)
                    .fontWeight(.medium)
                    .foregroundColor(Color.brand.textPrimary)
            }
            
            Spacer()
            
            Text("Save €\(String(format: "%.2f", savingsAmount))")
                .font(SRTypography.caption)
                .fontWeight(.semibold)
                .foregroundColor(Color.brand.success)
        }
        .padding(SRSpacing.lg)
        .background(Color.brand.warning.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous)
                .stroke(Color.brand.warning.opacity(0.2), lineWidth: 0.5)
        )
    }
    
    private var savingsAmount: Double {
        guard let best = viewModel.bestQuote else { return 0 }
        let worstReceive = viewModel.filteredQuotes.min(by: { $0.receiveAmount < $1.receiveAmount })?.receiveAmount ?? 0
        return (best.receiveAmount - worstReceive) / best.exchangeRate
    }
}

struct ComparisonRow: View {
    let quote: TransferQuote
    let isBest: Bool
    
    var body: some View {
        HStack(spacing: SRSpacing.md) {
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.brand.primary.opacity(isBest ? 0.2 : 0.1))
                    .frame(width: 48, height: 48)
                Text(quote.providerIcon)
                    .font(SRTypography.caption)
                    .fontWeight(.bold)
                    .foregroundColor(isBest ? Color.brand.primary : Color.brand.textSecondary)
            }
            
            VStack(alignment: .leading, spacing: SRSpacing.xs) {
                HStack(spacing: SRSpacing.sm) {
                    Text(quote.providerName)
                        .font(SRTypography.subhead)
                        .fontWeight(.medium)
                        .foregroundColor(Color.brand.textPrimary)
                    
                    if quote.isPromotion {
                        SRBadge(text: "PROMO", color: Color.brand.warning)
                    }
                    
                    if isBest {
                        SRBadge(text: "BEST", color: Color.brand.success)
                    }
                }
                
                HStack(spacing: SRSpacing.md) {
                    Label(quote.deliveryEstimate.label, systemImage: "clock")
                    Label("€\(String(format: "%.2f", quote.fee))", systemImage: "dollarsign.circle")
                }
                .font(SRTypography.caption)
                .foregroundColor(Color.brand.textTertiary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 2) {
                Text("₱\(String(format: "%,.0f", quote.receiveAmount))")
                    .font(SRTypography.number(16))
                    .foregroundColor(isBest ? Color.brand.success : Color.brand.textPrimary)
                
                Text("\(String(format: "%.4f", quote.effectiveRate)) EUR/PHP")
                    .font(SRTypography.caption2)
                    .foregroundColor(Color.brand.textTertiary)
            }
            
            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(Color.brand.textTertiary)
        }
        .padding(SRSpacing.lg)
        .background(isBest ? Color.brand.surfaceElevated : Color.brand.surface)
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous)
                .stroke(isBest ? Color.brand.success.opacity(0.3) : Color.brand.border, lineWidth: 0.5)
        )
    }
}

#Preview {
    ComparisonView()
        .environmentObject(NavigationState())
}
