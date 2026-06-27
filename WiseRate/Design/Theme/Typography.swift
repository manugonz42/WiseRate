import SwiftUI

struct SRTypography {
    static let largeTitle = Font.system(.largeTitle, design: .rounded).weight(.bold)
    static let title1 = Font.system(.title, design: .rounded).weight(.bold)
    static let title2 = Font.system(.title2, design: .rounded).weight(.semibold)
    static let title3 = Font.system(.title3, design: .rounded).weight(.semibold)
    static let headline = Font.system(.headline, design: .rounded).weight(.semibold)
    static let body = Font.system(.body, design: .rounded)
    static let callout = Font.system(.callout, design: .rounded)
    static let subhead = Font.system(.subheadline, design: .rounded)
    static let footnote = Font.system(.footnote, design: .rounded)
    static let caption = Font.system(.caption, design: .rounded)
    static let caption2 = Font.system(.caption2, design: .rounded)
    
    static func number(_ size: CGFloat, weight: Font.Weight = .bold) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }
    
    static func custom(_ style: Font.TextStyle, design: Font.Design = .rounded) -> Font {
        .system(style, design: design)
    }
}

struct SRSpacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 20
    static let xxl: CGFloat = 24
    static let xxxl: CGFloat = 32
    static let xxxxl: CGFloat = 40
    
    static let cardPadding: CGFloat = 16
    static let screenPadding: CGFloat = 20
    static let cardCornerRadius: CGFloat = 16
    static let buttonCornerRadius: CGFloat = 12
    static let smallCornerRadius: CGFloat = 8
}

struct SRShadow {
    static let card = ShadowStyle(color: .black.opacity(0.3), radius: 12, x: 0, y: 4)
    static let elevated = ShadowStyle(color: .black.opacity(0.4), radius: 20, x: 0, y: 8)
    static let subtle = ShadowStyle(color: .black.opacity(0.15), radius: 8, x: 0, y: 2)
    
    struct ShadowStyle {
        let color: Color
        let radius: CGFloat
        let x: CGFloat
        let y: CGFloat
    }
}

struct SRAnimations {
    static let quick = Animation.easeInOut(duration: 0.15)
    static let standard = Animation.easeInOut(duration: 0.25)
    static let smooth = Animation.spring(response: 0.35, dampingFraction: 0.85)
    static let bouncy = Animation.spring(response: 0.4, dampingFraction: 0.7)
    static let gentle = Animation.easeInOut(duration: 0.4)
}
