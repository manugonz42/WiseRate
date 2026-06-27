package com.wiserate.features.home

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.collectAsState
import androidx.hilt.navigation.compose.hiltViewModel
import com.wiserate.design.components.PrimaryButton
import com.wiserate.features.common.PlaceholderScreen

@Composable
fun HomeScreen(
    onProviderTap: (String) -> Unit,
    onCompareAll: () -> Unit,
    onUpgrade: () -> Unit,
    contentPadding: PaddingValues = PaddingValues(),
    viewModel: HomeViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    PlaceholderScreen(
        title = "Home",
        contentPadding = contentPadding,
        acceptanceCriteria = listOf(
            "Live mid-market rate (${"%.2f".format(state.currentRate)} EUR→PHP) with 24h delta arrow",
            "Top 3 providers by receiveAmount desc with effective rate (loaded: ${state.topQuotes.size})",
            "Hero rate card shows last-updated relative timestamp",
            "Sponsored slot renders 0–1 offer, never ad spam",
            "Loading shows skeletons; empty state for unsupported pair"
        )
    ) {
        PrimaryButton(text = "Compare all", onClick = onCompareAll)
        state.topQuotes.firstOrNull()?.let { top ->
            PrimaryButton(text = "Open ${top.providerName}", onClick = { onProviderTap(top.providerID) })
        }
        PrimaryButton(text = "Upgrade to Premium", onClick = onUpgrade)
    }
}
