package com.wiserate.features.premium

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import com.wiserate.design.components.PrimaryButton
import com.wiserate.features.common.PlaceholderScreen

@Composable
fun PremiumScreen(
    onDismiss: () -> Unit,
    contentPadding: PaddingValues = PaddingValues(),
    viewModel: PremiumViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    PlaceholderScreen(
        title = "Premium",
        contentPadding = contentPadding,
        acceptanceCriteria = listOf(
            "Hero with primary→primary-light gradient + tagline",
            "Feature list with checkmarks (unlimited alerts, full history, ad-free, faster refresh)",
            "Two plan cards (monthly/yearly); yearly default-selected with 'Save 33%' (selected: ${state.selectedPlan?.name})",
            "Localized prices via store SDK — never hardcoded",
            "Subscribe disabled + spinner while in-flight (purchasing: ${state.isPurchasing})",
            "Friendly error mapping (user-cancel ≠ error); Restore link; Terms + Privacy links"
        )
    ) {
        state.plans.forEach { plan ->
            PrimaryButton(text = "${plan.name} — €${plan.price}/${plan.period}", onClick = { viewModel.selectPlan(plan) })
        }
        PrimaryButton(text = "Subscribe", onClick = viewModel::subscribe, isLoading = state.isPurchasing)
        PrimaryButton(text = "Restore purchases", onClick = viewModel::restore)
        PrimaryButton(text = "Close", onClick = onDismiss)
    }
}
