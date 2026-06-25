import SwiftUI

extension Color {
    static let brand = BrandColors.self
    
    struct BrandColors {
        static let background = Color(hex: "0A0A0A")
        static let surface = Color(hex: "141414")
        static let surfaceElevated = Color(hex: "1C1C1E")
        static let surfaceHover = Color(hex: "232325")
        static let border = Color.white.opacity(0.08)
        static let borderSubtle = Color.white.opacity(0.04)
        
        static let primary = Color(hex: "6C5CE7")
        static let primaryLight = Color(hex: "A29BFE")
        static let primaryDark = Color(hex: "4A3DB5")
        
        static let accent = Color(hex: "00D2D3")
        static let accentLight = Color(hex: "48E0E0")
        
        static let success = Color(hex: "00C48C")
        static let successLight = Color(hex: "34D399")
        
        static let warning = Color(hex: "FFB800")
        static let warningLight = Color(hex: "FCD34D")
        
        static let error = Color(hex: "FF4757")
        static let errorLight = Color(hex: "FF6B81")
        
        static let bestOverall = Color(hex: "6C5CE7")
        static let bestRate = Color(hex: "00C48C")
        static let lowestFee = Color(hex: "00D2D3")
        static let fastest = Color(hex: "FFB800")
        
        static let textPrimary = Color.white
        static let textSecondary = Color.white.opacity(0.6)
        static let textTertiary = Color.white.opacity(0.35)
        
        static let gradientPrimary = LinearGradient(
            colors: [Color(hex: "6C5CE7"), Color(hex: "A29BFE")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        
        static let gradientCard = LinearGradient(
            colors: [Color(hex: "1C1C1E"), Color(hex: "141414")],
            startPoint: .top,
            endPoint: .bottom
        )
        
        static let gradientHero = LinearGradient(
            colors: [
                Color(hex: "6C5CE7").opacity(0.15),
                Color(hex: "00D2D3").opacity(0.08),
                Color(hex: "0A0A0A")
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
