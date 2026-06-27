import SwiftUI

struct SRCardModifier: ViewModifier {
    var style: CardStyle = .default
    var padding: CGFloat = SRSpacing.cardPadding
    
    enum CardStyle {
        case `default`
        case elevated
        case outlined
        case glass
        case highlight
    }
    
    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous)
                    .stroke(borderColor, lineWidth: 0.5)
            )
    }
    
    @ViewBuilder
    private var cardBackground: some View {
        switch style {
        case .default:
            Color.brand.surface
        case .elevated:
            Color.brand.surfaceElevated
                .shadow(color: .black.opacity(0.3), radius: 12, x: 0, y: 4)
        case .outlined:
            Color.clear
        case .glass:
            Color.white.opacity(0.05)
                .background(.ultraThinMaterial)
        case .highlight:
            Color.brand.surfaceElevated
                .overlay(
                    LinearGradient(
                        colors: [Color.brand.primary.opacity(0.05), .clear],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        }
    }
    
    private var borderColor: Color {
        switch style {
        case .default, .elevated:
            Color.brand.border
        case .outlined:
            Color.brand.border
        case .glass:
            Color.white.opacity(0.1)
        case .highlight:
            Color.brand.primary.opacity(0.2)
        }
    }
}

extension View {
    func srCard(style: SRCardModifier.CardStyle = .default, padding: CGFloat = SRSpacing.cardPadding) -> some View {
        modifier(SRCardModifier(style: style, padding: padding))
    }
}

struct SRPrimaryButton: View {
    let title: String
    var icon: String? = nil
    let action: () -> Void
    var style: ButtonStyle = .primary
    var isFullWidth: Bool = true
    var isLoading: Bool = false
    
    enum ButtonStyle {
        case primary
        case secondary
        case ghost
        case destructive
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: SRSpacing.sm) {
                if isLoading {
                    ProgressView()
                        .tint(buttonContentColor)
                } else {
                    if let icon {
                        Image(systemName: icon)
                            .font(.system(size: 14, weight: .semibold))
                    }
                    Text(title)
                        .font(SRTypography.headline)
                }
            }
            .foregroundColor(buttonContentColor)
            .frame(maxWidth: isFullWidth ? .infinity : nil)
            .frame(height: 50)
            .background(buttonBackground)
            .clipShape(RoundedRectangle(cornerRadius: SRSpacing.buttonCornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: SRSpacing.buttonCornerRadius, style: .continuous)
                    .stroke(buttonBorderColor, lineWidth: 0.5)
            )
        }
        .disabled(isLoading)
    }
    
    private var buttonBackground: some View {
        switch style {
        case .primary:
            Color.brand.primary
        case .secondary:
            Color.brand.surfaceElevated
        case .ghost:
            Color.clear
        case .destructive:
            Color.brand.error
        }
    }
    
    private var buttonContentColor: Color {
        switch style {
        case .primary, .destructive:
            .white
        case .secondary:
            .white
        case .ghost:
            Color.brand.primary
        }
    }
    
    private var buttonBorderColor: Color {
        switch style {
        case .primary, .destructive:
            Color.white.opacity(0.1)
        case .secondary:
            Color.brand.border
        case .ghost:
            Color.clear
        }
    }
}

struct SRChip: View {
    let title: String
    let color: Color
    var isSelected: Bool = false
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(SRTypography.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? color.opacity(0.2) : Color.brand.surfaceElevated)
                .foregroundColor(isSelected ? color : Color.brand.textSecondary)
                .clipShape(Capsule())
                .overlay(
                    Capsule()
                        .stroke(isSelected ? color.opacity(0.3) : Color.clear, lineWidth: 1)
                )
        }
    }
}

struct SRAvatar: View {
    let name: String
    var size: CGFloat = 32
    
    var body: some View {
        ZStack {
            Circle()
                .fill(Color.brand.primary.opacity(0.2))
                .frame(width: size, height: size)
            Text(initials)
                .font(SRTypography.caption)
                .fontWeight(.semibold)
                .foregroundColor(Color.brand.primaryLight)
        }
    }
    
    private var initials: String {
        let words = name.split(separator: " ")
        if words.count >= 2 {
            return String(words[0].prefix(1) + words[1].prefix(1))
        }
        return String(name.prefix(2))
    }
}

struct SRBadge: View {
    let text: String
    let color: Color
    var style: BadgeStyle = .filled
    
    enum BadgeStyle {
        case filled
        case outlined
    }
    
    var body: some View {
        Text(text)
            .font(SRTypography.caption2)
            .fontWeight(.semibold)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(style == .filled ? color.opacity(0.2) : Color.clear)
            .foregroundColor(color)
            .clipShape(Capsule())
            .overlay(
                Capsule()
                    .stroke(style == .outlined ? color.opacity(0.3) : Color.clear, lineWidth: 1)
            )
    }
}

struct SRDivider: View {
    var color: Color = Color.brand.border
    
    var body: some View {
        Rectangle()
            .fill(color)
            .frame(height: 0.5)
    }
}
