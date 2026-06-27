package com.wiserate.features.alerts

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import com.wiserate.design.components.PrimaryButton
import com.wiserate.features.common.PlaceholderScreen

@Composable
fun AlertsScreen(
    onUpgrade: () -> Unit,
    contentPadding: PaddingValues = PaddingValues(),
    viewModel: AlertsViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    PlaceholderScreen(
        title = "Alerts",
        contentPadding = contentPadding,
        acceptanceCriteria = listOf(
            "Active (${state.activeAlerts.size}) and Triggered (${state.triggeredAlerts.size}) shown in two sections",
            "Create form: target rate, type (rate above/below/provider cheapest), provider picker when cheapest",
            "Free users capped at 3 active alerts; Premium upsell at limit (atCap: ${state.atFreeCap})",
            "Disabled alerts greyed-out with a toggle",
            "Triggered alerts show fired-at relative timestamp",
            "Validation: target > 0 and within ±50% of current (${"%.2f".format(state.currentRate)})"
        )
    ) {
        PrimaryButton(text = "Create alert", onClick = viewModel::createAlert, enabled = !state.atFreeCap)
        if (state.atFreeCap) PrimaryButton(text = "Go unlimited (Premium)", onClick = onUpgrade)
    }
}
