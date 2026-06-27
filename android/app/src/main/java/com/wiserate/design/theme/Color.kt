package com.wiserate.design.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

/**
 * Canonical dark-theme tokens. Exact hex parity with iOS `Design/Theme/Colors.swift`
 * and the web `:root` vars. **If you change a token here, update both other platforms
 * AND docs/architecture/design-system.md.**
 */
object WiseColors {
    val background = Color(0xFF0A0A0A)
    val surface = Color(0xFF141414)
    val surfaceElevated = Color(0xFF1C1C1E)
    val surfaceHover = Color(0xFF232325)
    val border = Color.White.copy(alpha = 0.08f)
    val borderSubtle = Color.White.copy(alpha = 0.04f)

    val primary = Color(0xFF6C5CE7)
    val primaryLight = Color(0xFFA29BFE)
    val primaryDark = Color(0xFF4A3DB5)

    val accent = Color(0xFF00D2D3)
    val accentLight = Color(0xFF48E0E0)

    val success = Color(0xFF00C48C)
    val successLight = Color(0xFF34D399)

    val warning = Color(0xFFFFB800)
    val warningLight = Color(0xFFFCD34D)

    val error = Color(0xFFFF4757)
    val errorLight = Color(0xFFFF6B81)

    // Comparison best-deal accents
    val bestOverall = Color(0xFF6C5CE7)
    val bestRate = Color(0xFF00C48C)
    val lowestFee = Color(0xFF00D2D3)
    val fastest = Color(0xFFFFB800)

    val textPrimary = Color.White
    val textSecondary = Color.White.copy(alpha = 0.6f)
    val textTertiary = Color.White.copy(alpha = 0.35f)

    val gradientPrimary = Brush.linearGradient(listOf(primary, primaryLight))
    val gradientCard = Brush.verticalGradient(listOf(surfaceElevated, surface))
    val gradientHero = Brush.linearGradient(
        listOf(primary.copy(alpha = 0.15f), accent.copy(alpha = 0.08f), background)
    )
}
