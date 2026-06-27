package com.wiserate.features.settings

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import com.wiserate.design.components.PrimaryButton
import com.wiserate.features.common.PlaceholderScreen

@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    contentPadding: PaddingValues = PaddingValues(),
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    PlaceholderScreen(
        title = "Settings",
        contentPadding = contentPadding,
        acceptanceCriteria = listOf(
            "All toggles reflect persisted state on open",
            "Language selector: en / es / tl (current: ${state.language.label})",
            "Dark-mode toggle is a no-op (dark-only) but persisted for future",
            "'Clear cache' confirms, then success toast with reclaimed size",
            "'Manage subscription' opens Play billing center",
            "Default amount (${state.defaultAmount}) feeds Home + Comparison initial state"
        )
    ) {
        PrimaryButton(text = "Clear cache", onClick = viewModel::clearCache)
        PrimaryButton(text = "Back", onClick = onBack)
    }
}
