package com.wiserate.features.providerdetails

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import com.wiserate.design.components.PrimaryButton
import com.wiserate.features.common.PlaceholderScreen

@Composable
fun ProviderDetailScreen(
    providerID: String,
    onBack: () -> Unit,
    onUpgrade: () -> Unit,
    contentPadding: PaddingValues = PaddingValues(),
    viewModel: ProviderDetailViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    LaunchedEffect(providerID) { viewModel.load(providerID) }
    val provider = state.provider

    PlaceholderScreen(
        title = provider?.name ?: "Provider ($providerID)",
        contentPadding = contentPadding,
        acceptanceCriteria = listOf(
            "Header: icon, name, brand-color bg, trust score X.X/5, user rating, review count",
            provider?.let { "Loaded: trust ${it.trustScore}, rating ${it.userRating}, ${it.reviewCount} reviews" }
                ?: "Loading provider detail…",
            "Transfer limits row (min/max + currency)",
            "Fee structure section: one row per FeeStructure with delivery-method icon",
            "Delivery-method chips; pros/cons stacked",
            "Historical chart with timeframe chips (24H–1Y); >30D Premium-gated",
            "CTA 'Send with <Provider>' sticky-bottom → affiliateURL ?? websiteURL"
        )
    ) {
        provider?.let {
            PrimaryButton(text = "Send with ${it.name}", onClick = viewModel::onAffiliateOutbound)
        }
        PrimaryButton(text = if (state.isFavorite) "★ Favorited" else "☆ Add favorite", onClick = viewModel::toggleFavorite)
        PrimaryButton(text = "Unlock full history (Premium)", onClick = onUpgrade)
        PrimaryButton(text = "Back", onClick = onBack)
    }
}
