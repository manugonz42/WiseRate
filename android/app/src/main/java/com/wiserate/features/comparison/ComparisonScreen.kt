package com.wiserate.features.comparison

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import com.wiserate.design.components.PrimaryButton
import com.wiserate.features.common.PlaceholderScreen

@Composable
fun ComparisonScreen(
    onProviderTap: (String) -> Unit,
    contentPadding: PaddingValues = PaddingValues(),
    viewModel: ComparisonViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    PlaceholderScreen(
        title = "Compare",
        contentPadding = contentPadding,
        acceptanceCriteria = listOf(
            "Exactly 5 sort options: best rate, lowest fee, fastest, most trusted, cheapest total",
            "Best-deal banner pinned on top with savings vs avg",
            "Multi-select delivery-method filter chips; 'All' toggles rest off",
            "Live provider-name search (debounce 150ms)",
            "Row: icon, name, fee, delivery estimate, receive amount, markup %",
            "'Promotional' badge on isPromotion quotes; empty-filter reset state",
            "Quotes loaded: ${state.quotes.size}, showing: ${state.filteredQuotes.size}"
        )
    ) {
        state.filteredQuotes.firstOrNull()?.let { best ->
            PrimaryButton(text = "Open best: ${best.providerName}", onClick = { onProviderTap(best.providerID) })
        }
    }
}
