package com.wiserate.design.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

/**
 * Maps WiseColors tokens onto a Material 3 dark color scheme. Dark-only for now
 * (design-system.md). Wraps app content: `WiseRateTheme { ... }`.
 */
private val WiseDarkColorScheme = darkColorScheme(
    primary = WiseColors.primary,
    onPrimary = WiseColors.textPrimary,
    primaryContainer = WiseColors.primaryDark,
    secondary = WiseColors.accent,
    onSecondary = WiseColors.background,
    background = WiseColors.background,
    onBackground = WiseColors.textPrimary,
    surface = WiseColors.surface,
    onSurface = WiseColors.textPrimary,
    surfaceVariant = WiseColors.surfaceElevated,
    onSurfaceVariant = WiseColors.textSecondary,
    error = WiseColors.error,
    onError = WiseColors.textPrimary,
    outline = WiseColors.border
)

@Composable
fun WiseRateTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = WiseDarkColorScheme,
        typography = WiseTypography,
        content = content
    )
}
