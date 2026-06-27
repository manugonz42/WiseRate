package com.wiserate.features.onboarding

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import com.wiserate.design.components.PrimaryButton
import com.wiserate.features.common.PlaceholderScreen

@Composable
fun OnboardingScreen(
    onComplete: () -> Unit,
    contentPadding: PaddingValues = PaddingValues(),
    viewModel: OnboardingViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    val page = state.currentPage

    PlaceholderScreen(
        title = page.title,
        contentPadding = contentPadding,
        acceptanceCriteria = listOf(
            page.subtitle,
            "4 pages exactly with a dots page indicator (current: ${page.index + 1}/4)",
            "Page 3 (Currency): from/to pickers default EUR / PHP (${state.selectedSendCurrency}→${state.selectedReceiveCurrency})",
            "Page 4 (Notifications): explainer + Allow / Skip",
            "Completing persists currencies + flag atomically; re-entry skips onboarding",
            "No analytics fired before consent on page 4"
        )
    ) {
        if (page == com.wiserate.core.model.OnboardingPage.Notifications) {
            PrimaryButton(text = "Allow notifications", onClick = { viewModel.requestNotificationsAndComplete(onComplete) })
            PrimaryButton(text = "Skip", onClick = onComplete)
        } else {
            PrimaryButton(text = "Next", onClick = viewModel::next)
            if (page.index > 0) PrimaryButton(text = "Back", onClick = viewModel::back)
        }
    }
}
