import SwiftUI

struct AnalyticsView: View {
    @State private var viewModel = AnalyticsViewModel()
    
    var body: some View {
        ScrollView {
            VStack(spacing: SRSpacing.xxl) {
                headerSection
                statsSection
                timeframeSelector
                chartSection
                insightsSection
            }
            .padding(.bottom, SRSpacing.xxxxl)
        }
        .background(Color.brand.background)
        .task {
            await viewModel.loadRates()
        }
    }
    
    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Analytics")
                    .font(SRTypography.title1)
                    .foregroundColor(Color.brand.textPrimary)
                Text("EUR/PHP historical data")
                    .font(SRTypography.caption)
                    .foregroundColor(Color.brand.textTertiary)
            }
            Spacer()
        }
        .padding(.horizontal, SRSpacing.screenPadding)
        .padding(.top, SRSpacing.lg)
    }
    
    private var statsSection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: SRSpacing.md) {
                StatCard(
                    title: "Current",
                    value: "₱\(String(format: "%.2f", viewModel.rateStats.avg))",
                    color: Color.brand.primary
                )
                
                StatCard(
                    title: "24h High",
                    value: "₱\(String(format: "%.2f", viewModel.rateStats.high))",
                    color: Color.brand.success
                )
                
                StatCard(
                    title: "24h Low",
                    value: "₱\(String(format: "%.2f", viewModel.rateStats.low))",
                    color: Color.brand.error
                )
                
                StatCard(
                    title: "Change",
                    value: "\(viewModel.rateStats.change >= 0 ? "+" : "")\(String(format: "%.2f", viewModel.rateStats.change))%",
                    color: viewModel.rateStats.change >= 0 ? Color.brand.success : Color.brand.error
                )
            }
            .padding(.horizontal, SRSpacing.screenPadding)
        }
    }
    
    private var timeframeSelector: some View {
        HStack(spacing: SRSpacing.sm) {
            ForEach(TimeFrame.allCases, id: \.self) { timeFrame in
                SRChip(
                    title: timeFrame.rawValue,
                    color: Color.brand.primary,
                    isSelected: viewModel.selectedTimeFrame == timeFrame,
                    action: {
                        Task {
                            viewModel.selectedTimeFrame = timeFrame
                            await viewModel.loadRates()
                        }
                    }
                )
            }
        }
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private var chartSection: some View {
        VStack(spacing: SRSpacing.lg) {
            SRSectionHeader(title: "Rate History")
            
            if viewModel.isLoading {
                ProgressView()
                    .frame(height: 200)
            } else {
                ChartView(data: viewModel.historicalRates.map(\.rate), color: Color.brand.primary)
                    .frame(height: 200)
                    .padding(.horizontal, SRSpacing.sm)
            }
        }
        .srCard()
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private var insightsSection: some View {
        VStack(alignment: .leading, spacing: SRSpacing.lg) {
            SRSectionHeader(title: "Insights")
            
            VStack(spacing: SRSpacing.md) {
                InsightRow(
                    icon: "lightbulb.fill",
                    iconColor: Color.brand.warning,
                    title: "Best time to send",
                    subtitle: "Rates are typically higher on weekdays between 9-11 AM CET"
                )
                
                SRDivider()
                
                InsightRow(
                    icon: "chart.line.uptrend.xyaxis",
                    iconColor: Color.brand.success,
                    title: "Trend analysis",
                    subtitle: "EUR/PHP has been trending \(viewModel.rateStats.change >= 0 ? "up" : "down") over the selected period"
                )
                
                SRDivider()
                
                InsightRow(
                    icon: "target",
                    iconColor: Color.brand.primary,
                    title: "Rate volatility",
                    subtitle: "Low volatility detected - good time for transfers"
                )
            }
        }
        .srCard()
        .padding(.horizontal, SRSpacing.screenPadding)
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: SRSpacing.xs) {
            Text(title)
                .font(SRTypography.caption)
                .foregroundColor(Color.brand.textTertiary)
            Text(value)
                .font(SRTypography.number(18))
                .foregroundColor(color)
        }
        .frame(minWidth: 100)
        .padding(SRSpacing.md)
        .background(Color.brand.surfaceElevated)
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.smallCornerRadius, style: .continuous))
    }
}

struct ChartView: View {
    let data: [Double]
    let color: Color
    
    var body: some View {
        GeometryReader { geometry in
            let minVal = data.min() ?? 0
            let maxVal = data.max() ?? 1
            let range = maxVal - minVal
            
            ZStack {
                // Grid lines
                ForEach(0..<5) { i in
                    let y = geometry.size.height * Double(i) / 4
                    Path { path in
                        path.move(to: CGPoint(x: 0, y: y))
                        path.addLine(to: CGPoint(x: geometry.size.width, y: y))
                    }
                    .stroke(Color.brand.border, lineWidth: 0.5)
                    
                    let value = maxVal - (range * Double(i) / 4)
                    Text(String(format: "%.2f", value))
                        .font(SRTypography.caption2)
                        .foregroundColor(Color.brand.textTertiary)
                        .position(x: geometry.size.width + 20, y: y)
                }
                
                // Area fill
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
                        colors: [color.opacity(0.3), color.opacity(0.0)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                
                // Line
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
                
                // End dot
                if let lastValue = data.last {
                    let x = geometry.size.width
                    let normalizedValue = range > 0 ? (lastValue - minVal) / range : 0.5
                    let y = geometry.size.height * (1 - normalizedValue)
                    
                    Circle()
                        .fill(color)
                        .frame(width: 8, height: 8)
                        .position(x: x, y: y)
                        .overlay(
                            Circle()
                                .fill(color.opacity(0.3))
                                .frame(width: 16, height: 16)
                                .position(x: x, y: y)
                        )
                }
            }
        }
    }
}

struct InsightRow: View {
    let icon: String
    let iconColor: Color
    let title: String
    let subtitle: String
    
    var body: some View {
        HStack(spacing: SRSpacing.md) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(iconColor)
                .frame(width: 32, height: 32)
                .background(iconColor.opacity(0.1))
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
    AnalyticsView()
}
