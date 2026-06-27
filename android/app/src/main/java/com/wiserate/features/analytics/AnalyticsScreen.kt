package com.wiserate.features.analytics

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import com.wiserate.design.components.PrimaryButton
import com.wiserate.features.common.PlaceholderScreen

@Composable
fun AnalyticsScreen(
    onUpgrade: () -> Unit,
    onSetAlert: () -> Unit,
    contentPadding: PaddingValues = PaddingValues(),
    viewModel: AnalyticsViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    val stats = state.stats

    PlaceholderScreen(
        title = "Analytics",
        contentPadding = contentPadding,
        acceptanceCriteria = listOf(
            "Timeframe chips: 24H, 7D, 30D, 3M, 6M, 1Y (≥3M Premium-gated)",
            "Stats card: high, low, average, % change over range",
            stats?.let { "Current (${state.selectedTimeFrame.label}): high %.2f / low %.2f / avg %.2f".format(it.high, it.low, it.average) }
                ?: "Stats card empty until data loads",
            "Full-width line chart with axis labels + tap-to-scrub tooltip (Vico)",
            "Empty + loading-shimmer states matching chart shape"
        )
    ) {
        PrimaryButton(text = "Set alert at this rate", onClick = onSetAlert)
        PrimaryButton(text = "Unlock ≥3M (Premium)", onClick = onUpgrade)
    }
}
