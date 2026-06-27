package com.wiserate.design.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wiserate.design.theme.Radius
import com.wiserate.design.theme.Spacing
import com.wiserate.design.theme.WiseColors
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward

/**
 * Token-driven component library. Parity goal is the design tokens, not API shape
 * (per docs/architecture/design-system.md). Mirrors iOS `Design/Components/Common/Components.swift`.
 */

enum class CardStyle { Default, Elevated, Outlined, Glass, Highlight }

@Composable
fun WiseCard(
    modifier: Modifier = Modifier,
    style: CardStyle = CardStyle.Default,
    content: @Composable () -> Unit
) {
    val shape = RoundedCornerShape(Radius.default)
    val (bg, border) = when (style) {
        CardStyle.Default -> WiseColors.surface to null
        CardStyle.Elevated -> WiseColors.surfaceElevated to null
        CardStyle.Outlined -> Color.Transparent to BorderStroke(1.dp, WiseColors.border)
        CardStyle.Glass -> WiseColors.surface.copy(alpha = 0.6f) to BorderStroke(1.dp, WiseColors.borderSubtle)
        CardStyle.Highlight -> WiseColors.surfaceElevated to BorderStroke(1.dp, WiseColors.primary)
    }
    Surface(
        modifier = modifier,
        shape = shape,
        color = bg,
        border = border
    ) {
        Box(modifier = Modifier.padding(Spacing.cardPadding)) { content() }
    }
}

@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isLoading: Boolean = false,
    enabled: Boolean = true
) {
    Button(
        onClick = onClick,
        modifier = modifier.fillMaxWidth(),
        enabled = enabled && !isLoading,
        shape = RoundedCornerShape(Radius.sm),
        colors = ButtonDefaults.buttonColors(
            containerColor = WiseColors.primary,
            contentColor = WiseColors.textPrimary
        ),
        contentPadding = PaddingValues(vertical = Spacing.lg)
    ) {
        if (isLoading) {
            CircularProgressIndicator(modifier = Modifier.size(20.dp), color = WiseColors.textPrimary, strokeWidth = 2.dp)
        } else {
            Text(text, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
fun Avatar(
    initials: String,
    modifier: Modifier = Modifier,
    size: androidx.compose.ui.unit.Dp = 44.dp,
    background: Color = WiseColors.primary
) {
    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .background(background),
        contentAlignment = Alignment.Center
    ) {
        Text(initials.take(2).uppercase(), color = WiseColors.textPrimary, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun Chip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(percent = 50),
        color = if (selected) WiseColors.primary else WiseColors.surfaceElevated,
        border = if (selected) null else BorderStroke(1.dp, WiseColors.border),
        onClick = onClick
    ) {
        Text(
            label,
            modifier = Modifier.padding(horizontal = Spacing.lg, vertical = Spacing.sm),
            color = if (selected) WiseColors.textPrimary else WiseColors.textSecondary,
            fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal
        )
    }
}

/** Number + delta arrow. Positive = success, negative = error (design-system.md). */
@Composable
fun RateBadge(
    value: String,
    delta: Double,
    modifier: Modifier = Modifier
) {
    val positive = delta >= 0
    val tint = if (positive) WiseColors.success else WiseColors.error
    Row(modifier = modifier, verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Spacing.xs)) {
        Text(value, color = WiseColors.textPrimary, fontWeight = FontWeight.Bold)
        Icon(
            imageVector = if (positive) Icons.Filled.ArrowUpward else Icons.Filled.ArrowDownward,
            contentDescription = null,
            tint = tint,
            modifier = Modifier.size(14.dp)
        )
        Text(String.format("%.2f%%", kotlin.math.abs(delta)), color = tint, fontWeight = FontWeight.SemiBold)
    }
}
