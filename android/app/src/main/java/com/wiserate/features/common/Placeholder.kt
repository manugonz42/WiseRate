package com.wiserate.features.common

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import com.wiserate.design.components.CardStyle
import com.wiserate.design.components.WiseCard
import com.wiserate.design.theme.Spacing
import com.wiserate.design.theme.WiseColors

/**
 * Scaffold placeholder for a feature screen. Renders the module title and its
 * acceptance criteria (from docs/modules/<name>.md) so each screen visually maps to its
 * spec while real UI is built. This is the parity-goal shape from docs/platforms/android.md.
 */
@Composable
fun PlaceholderScreen(
    title: String,
    acceptanceCriteria: List<String>,
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(),
    actions: @Composable ColumnScope.() -> Unit = {}
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(contentPadding)
            .verticalScroll(rememberScrollState())
            .padding(Spacing.screenPadding),
        verticalArrangement = Arrangement.spacedBy(Spacing.lg)
    ) {
        Text(title, style = androidx.compose.material3.MaterialTheme.typography.headlineLarge, color = WiseColors.textPrimary)
        Text(
            "Android scaffold — placeholder. Acceptance criteria from docs/modules.",
            color = WiseColors.textTertiary,
            style = androidx.compose.material3.MaterialTheme.typography.labelLarge
        )

        WiseCard(style = CardStyle.Outlined) {
            Column(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                acceptanceCriteria.forEach { criterion ->
                    Row(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                        Text("•", color = WiseColors.primary, fontWeight = FontWeight.Bold)
                        Text(criterion, color = WiseColors.textSecondary, style = androidx.compose.material3.MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }

        actions()
    }
}
