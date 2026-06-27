package com.wiserate.features.referral

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import com.wiserate.design.components.PrimaryButton
import com.wiserate.features.common.PlaceholderScreen

@Composable
fun ReferralScreen(
    onBack: () -> Unit,
    contentPadding: PaddingValues = PaddingValues(),
    viewModel: ReferralViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    PlaceholderScreen(
        title = "Invite friends",
        contentPadding = contentPadding,
        acceptanceCriteria = listOf(
            "Code is uppercase, 6–10 chars (mock: ${state.referralCode})",
            "Stats card: invited count (${state.referralCount}), earnings (${state.referralEarnings} ${state.earningsCurrency})",
            "Share message localized: en / es / tl",
            "Copy-code → clipboard + toast",
            "Share → system share with wiserate://?ref=<code>"
        )
    ) {
        PrimaryButton(text = "Share code", onClick = { viewModel.shareLink() })
        PrimaryButton(text = "Back", onClick = onBack)
    }
}
