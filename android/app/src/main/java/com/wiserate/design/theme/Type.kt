package com.wiserate.design.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * Type scale mirroring design-system.md (Inter family on Android — registered here as the
 * default; bundle the font files under res/font to switch FontFamily.Default → Inter).
 */
private val Default = FontFamily.Default

val WiseTypography = Typography(
    // largeTitle 34 / 800
    displaySmall = TextStyle(fontFamily = Default, fontWeight = FontWeight.ExtraBold, fontSize = 34.sp),
    // title 28 / 800
    headlineLarge = TextStyle(fontFamily = Default, fontWeight = FontWeight.ExtraBold, fontSize = 28.sp),
    // title2 22 / 700
    headlineMedium = TextStyle(fontFamily = Default, fontWeight = FontWeight.Bold, fontSize = 22.sp),
    // title3 20 / 700
    headlineSmall = TextStyle(fontFamily = Default, fontWeight = FontWeight.Bold, fontSize = 20.sp),
    // headline 17 / 600
    titleLarge = TextStyle(fontFamily = Default, fontWeight = FontWeight.SemiBold, fontSize = 17.sp),
    // body 17 / 400
    bodyLarge = TextStyle(fontFamily = Default, fontWeight = FontWeight.Normal, fontSize = 17.sp),
    // callout 16 / 400
    bodyMedium = TextStyle(fontFamily = Default, fontWeight = FontWeight.Normal, fontSize = 16.sp),
    // subhead 15 / 400
    bodySmall = TextStyle(fontFamily = Default, fontWeight = FontWeight.Normal, fontSize = 15.sp),
    // footnote 13 / 400
    labelLarge = TextStyle(fontFamily = Default, fontWeight = FontWeight.Normal, fontSize = 13.sp),
    // caption 12 / 400
    labelMedium = TextStyle(fontFamily = Default, fontWeight = FontWeight.Normal, fontSize = 12.sp),
    // caption2 11 / 400
    labelSmall = TextStyle(fontFamily = Default, fontWeight = FontWeight.Normal, fontSize = 11.sp)
)
