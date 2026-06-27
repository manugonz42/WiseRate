package com.wiserate.features.profile

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import com.wiserate.design.components.PrimaryButton
import com.wiserate.features.common.PlaceholderScreen

@Composable
fun ProfileScreen(
    onSettings: () -> Unit,
    onReferral: () -> Unit,
    onUpgrade: () -> Unit,
    onProviderTap: (String) -> Unit,
    contentPadding: PaddingValues = PaddingValues(),
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    PlaceholderScreen(
        title = "Profile",
        contentPadding = contentPadding,
        acceptanceCriteria = listOf(
            "Header: avatar/initials, name (${state.user.name}), email, Premium badge when entitled (${state.isPremium})",
            "Editable: name, send/receive currency, default delivery method",
            "Favorites: horizontal scroll of saved providers (${state.user.favoriteProviders.size})",
            "Recents: chronological, capped at 10 (${state.user.recentProviders.size})",
            "Save disabled until a field changes; Cancel reverts edits"
        )
    ) {
        PrimaryButton(text = if (state.isEditMode) "Save" else "Edit profile", onClick = { if (state.isEditMode) viewModel.save() else viewModel.toggleEditMode() })
        PrimaryButton(text = "Settings", onClick = onSettings)
        PrimaryButton(text = "Invite friends", onClick = onReferral)
        if (!state.isPremium) PrimaryButton(text = "Upgrade", onClick = onUpgrade)
        state.user.favoriteProviders.firstOrNull()?.let { fav ->
            PrimaryButton(text = "Open favorite: $fav", onClick = { onProviderTap(fav) })
        }
    }
}
