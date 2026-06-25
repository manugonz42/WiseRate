import SwiftUI

struct HomeView: View {
    @State private var viewModel = HomeViewModel()
    @EnvironmentObject var navigation: NavigationState
    
    var body: some View {
        ScrollView {
            VStack(spacing: SRSpacing.xxl) {
                headerSection
                heroCard
                quickStats
                topProvidersSection
                rateChartSection
                sponsoredSection
            }
            .padding(.bottom, SRSpacing.xxxxl)
        }
        .background(Color.brand.background)
        .scrollIndicators(.hidden)
        .task {
            await viewModel.loadInitialData()
        }
    }
    
    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("SendRate")
                    .font(SRTypography.largeTitle)
                    .foregroundStyle(Color.brand.gradientPrimary)
                
                Text("EUR → PHP")
                    .font(SRTypography.caption)
                    .foregroundColor(Color.brand.textTertiary)
            }
            
            Spacer()
            
            HStack(spacing: SRSpacing.md) {
                Button {
                    navigation.presentSheet(.settings)
                } label: {
                    Image(systemName: "gearshape")
                        .font(.system(size: 18))
                        .foregroundColor(Color.brand.textSecondary)
                        .frame(width: 40, height: 40)
                        .background(Color.brand.surfaceElevated)
                        .clipShape(Circle())
                        .overlay(
                            Circle().stroke(Color.brand.border, lineWidth: 0.5)
                        )
                }
                
                SRAvatar(name: viewModel.amount, size: 40)
            }
        }
        .padding(.horizontal, SRSpacing.screenPadding)
        .padding(.top, SRSpacing.lg)
    }
    
    private var heroCard: some View {
        VStack(spacing: SRSpacing.xl) {
            VStack(spacing: SRSpacing.md) {
                SRNumberField(
                    title: "You send",
                    value: $viewModel.amount,
                    prefix: "€",
                    placeholder: "0"
                )
                
                Button {
                    viewModel.swapCurrencies()
                } label: {
                    Image(systemName: "arrow.up.arrow.down")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(Color.brand.primary)
                        .frame(width: 36, height: 36)
                        .background(Color.brand.primary.opacity(0.1))
                        .clipShape(Circle())
                }
                
                VStack(alignment: .leading, spacing: SRSpacing.xs) {
                    Text("Recipient gets")
                        .font(SRTypography.caption)
                        .foregroundColor(Color.brand.textTertiary)
                    
                    HStack(alignment: .firstTextBaseline, spacing: SRSpacing.sm) {
                        Text("₱")
                            .font(SRTypography.title2)
                            .foregroundColor(Color.brand.textSecondary)
                        
                        Text(viewModel.bestQuote.map { String(format: "%,.0f", $0.receiveAmount) } ?? "---")
                            .font(SRTypography.number(32))
                            .foregroundColor(Color.brand.success)
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("via")
                                .font(SRTypography.caption2)
                                .foregroundColor(Color.brand.textTertiary)
                            Text(viewModel.bestQuote?.providerName ?? "---")
                                .font(SRTypography.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(Color.brand.primary)
                        }
                    }
                }
                .padding(SRSpacing.lg)
                .background(Color.brand.surfaceElevated)
                .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous)
                        .stroke(Color.brand.border, lineWidth: 0.5)
                )
            }
            
            SRPrimaryButton(
                title: "Compare All Providers",
                icon: "arrow.left.arrow.right",
                action: {
                    Task {
                        await viewModel.compare()
                        navigation.navigate(to: .comparison(amount: viewModel.amountValue))
                    }
                },
                isLoading: viewModel.isLoading
            )
        }
        .padding(SRSpacing.xl)
        .background(Color.brand.gradientCard)
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous)
                .stroke(Color.brand.border, lineWidth: 0.5)
        )
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private var quickStats: some View {
        HStack(spacing: SRSpacing.md) {
            VStack(alignment: .leading, spacing: SRSpacing.xs) {
                Text("1 EUR")
                    .font(SRTypography.caption)
                    .foregroundColor(Color.brand.textTertiary)
                Text("₱\(viewModel.formattedRate)")
                    .font(SRTypography.number(18))
                    .foregroundColor(Color.brand.textPrimary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(SRSpacing.md)
            .background(Color.brand.surfaceElevated)
            .clipShape(RoundedRectangle(cornerRadius: SRSpacing.smallCornerRadius, style: .continuous))
            
            VStack(alignment: .leading, spacing: SRSpacing.xs) {
                Text("24h Change")
                    .font(SRTypography.caption)
                    .foregroundColor(Color.brand.textTertiary)
                Text(viewModel.formattedRateChange)
                    .font(SRTypography.number(18))
                    .foregroundColor(viewModel.rateChange24h >= 0 ? Color.brand.success : Color.brand.error)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(SRSpacing.md)
            .background(Color.brand.surfaceElevated)
            .clipShape(RoundedRectangle(cornerRadius: SRSpacing.smallCornerRadius, style: .continuous))
            
            VStack(alignment: .leading, spacing: SRSpacing.xs) {
                Text("Providers")
                    .font(SRTypography.caption)
                    .foregroundColor(Color.brand.textTertiary)
                Text("15+")
                    .font(SRTypography.number(18))
                    .foregroundColor(Color.brand.textPrimary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(SRSpacing.md)
            .background(Color.brand.surfaceElevated)
            .clipShape(RoundedRectangle(cornerRadius: SRSpacing.smallCornerRadius, style: .continuous))
        }
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private var topProvidersSection: some View {
        VStack(alignment: .leading, spacing: SRSpacing.lg) {
            SRSectionHeader(title: "Top Providers", subtitle: "Best rates right now")
            
            if viewModel.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .frame(height: 120)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: SRSpacing.md) {
                        ForEach(viewModel.topProviders) { quote in
                            ProviderCard(quote: quote)
                                .onTapGesture {
                                    navigation.navigate(to: .providerDetail(quote.providerID))
                                }
                        }
                    }
                    .padding(.horizontal, SRSpacing.screenPadding)
                }
            }
        }
    }
    
    private var rateChartSection: some View {
        VStack(alignment: .leading, spacing: SRSpacing.lg) {
            SRSectionHeader(title: "Rate Trend", subtitle: "EUR/PHP")
            
            VStack(spacing: SRSpacing.md) {
                HStack(spacing: SRSpacing.sm) {
                    ForEach(TimeFrame.allCases, id: \.self) { timeFrame in
                        SRChip(
                            title: timeFrame.rawValue,
                            color: Color.brand.primary,
                            isSelected: viewModel.selectedTimeFrame == timeFrame,
                            action: {
                                Task {
                                    await viewModel.updateTimeFrame(timeFrame)
                                }
                            }
                        )
                    }
                }
                .padding(.horizontal, SRSpacing.lg)
                
                MiniChart(data: viewModel.historicalRates.map(\.rate), color: Color.brand.primary)
                    .frame(height: 100)
                    .padding(.horizontal, SRSpacing.sm)
            }
            .srCard()
            .padding(.horizontal, SRSpacing.screenPadding)
        }
    }
    
    private var sponsoredSection: some View {
        VStack(alignment: .leading, spacing: SRSpacing.lg) {
            SRSectionHeader(title: "Offers", subtitle: "Sponsored promotions")
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: SRSpacing.md) {
                    ForEach(viewModel.sponsoredOffers) { offer in
                        SponsoredCard(offer: offer)
                    }
                }
                .padding(.horizontal, SRSpacing.screenPadding)
            }
        }
    }
}

struct ProviderCard: View {
    let quote: TransferQuote
    
    var body: some View {
        VStack(alignment: .leading, spacing: SRSpacing.md) {
            HStack {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color.brand.primary.opacity(0.15))
                        .frame(width: 40, height: 40)
                    Text(quote.providerIcon)
                        .font(SRTypography.caption)
                        .fontWeight(.bold)
                        .foregroundColor(Color.brand.primary)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(quote.providerName)
                        .font(SRTypography.subhead)
                        .fontWeight(.medium)
                        .foregroundColor(Color.brand.textPrimary)
                    
                    HStack(spacing: 4) {
                        Image(systemName: quote.deliveryEstimate.label == "Instant" ? "bolt.fill" : "clock")
                            .font(.system(size: 8))
                            .foregroundColor(Color.brand.textTertiary)
                        Text(quote.deliveryEstimate.label)
                            .font(SRTypography.caption2)
                            .foregroundColor(Color.brand.textTertiary)
                    }
                }
                
                Spacer()
                
                if quote.isPromotion {
                    SRBadge(text: "PROMO", color: Color.brand.warning)
                }
            }
            
            Divider()
                .background(Color.brand.border)
            
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("You get")
                        .font(SRTypography.caption2)
                        .foregroundColor(Color.brand.textTertiary)
                    Text("₱\(String(format: "%,.0f", quote.receiveAmount))")
                        .font(SRTypography.number(16))
                        .foregroundColor(Color.brand.success)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 2) {
                    Text("Fee")
                        .font(SRTypography.caption2)
                        .foregroundColor(Color.brand.textTertiary)
                    Text("€\(String(format: "%.2f", quote.fee))")
                        .font(SRTypography.number(14, weight: .medium))
                        .foregroundColor(Color.brand.textSecondary)
                }
            }
        }
        .padding(SRSpacing.lg)
        .frame(width: 200)
        .background(Color.brand.surfaceElevated)
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous)
                .stroke(Color.brand.border, lineWidth: 0.5)
        )
    }
}

struct SponsoredCard: View {
    let offer: SponsoredOffer
    
    var body: some View {
        VStack(alignment: .leading, spacing: SRSpacing.md) {
            HStack {
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.brand.primary.opacity(0.1))
                        .frame(width: 32, height: 32)
                    Text(offer.providerIcon)
                        .font(SRTypography.caption2)
                        .fontWeight(.bold)
                        .foregroundColor(Color.brand.primary)
                }
                
                Text("SPONSORED")
                    .font(SRTypography.caption2)
                    .fontWeight(.medium)
                    .foregroundColor(Color.brand.textTertiary)
            }
            
            Text(offer.headline)
                .font(SRTypography.subhead)
                .fontWeight(.semibold)
                .foregroundColor(Color.brand.textPrimary)
                .lineLimit(2)
            
            Text(offer.description)
                .font(SRTypography.caption)
                .foregroundColor(Color.brand.textSecondary)
                .lineLimit(2)
            
            SRPrimaryButton(title: offer.ctaText, icon: "arrow.right", action: {}, style: .secondary, isFullWidth: false)
        }
        .padding(SRSpacing.lg)
        .frame(width: 220)
        .background(Color.brand.surface)
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous)
                .stroke(Color.brand.border, lineWidth: 0.5)
        )
    }
}

struct MiniChart: View {
    let data: [Double]
    let color: Color
    
    var body: some View {
        GeometryReader { geometry in
            let minVal = data.min() ?? 0
            let maxVal = data.max() ?? 1
            let range = maxVal - minVal
            
            Path { path in
                for (index, value) in data.enumerated() {
                    let x = geometry.size.width * Double(index) / Double(max(data.count - 1, 1))
                    let normalizedValue = range > 0 ? (value - minVal) / range : 0.5
                    let y = geometry.size.height * (1 - normalizedValue)
                    
                    if index == 0 {
                        path.move(to: CGPoint(x: x, y: y))
                    } else {
                        path.addLine(to: CGPoint(x: x, y: y))
                    }
                }
            }
            .stroke(color, style: StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round))
            
            Path { path in
                for (index, value) in data.enumerated() {
                    let x = geometry.size.width * Double(index) / Double(max(data.count - 1, 1))
                    let normalizedValue = range > 0 ? (value - minVal) / range : 0.5
                    let y = geometry.size.height * (1 - normalizedValue)
                    
                    if index == 0 {
                        path.move(to: CGPoint(x: x, y: geometry.size.height))
                        path.addLine(to: CGPoint(x: x, y: y))
                    } else {
                        path.addLine(to: CGPoint(x: x, y: y))
                    }
                }
                path.addLine(to: CGPoint(x: geometry.size.width, y: geometry.size.height))
                path.closeSubpath()
            }
            .fill(
                LinearGradient(
                    colors: [color.opacity(0.2), color.opacity(0.0)],
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
        }
    }
}

#Preview {
    HomeView()
        .environmentObject(NavigationState())
}
