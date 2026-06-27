package com.wiserate.design.theme

import androidx.compose.ui.unit.dp

/** Spacing scale. Parity with design-system.md and iOS `SRSpacing`. */
object Spacing {
    val xs = 4.dp
    val sm = 8.dp
    val md = 12.dp
    val lg = 16.dp
    val xl = 20.dp
    val xxl = 24.dp
    val xxxl = 32.dp
    val xxxxl = 40.dp

    // Defaults
    val screenPadding = 20.dp
    val cardPadding = 16.dp
    val cardGap = 12.dp
}

/** Corner radius scale. design-system.md: xs 8 · sm 12 · default 16 (pill = height/2). */
object Radius {
    val xs = 8.dp
    val sm = 12.dp
    val default = 16.dp
}
