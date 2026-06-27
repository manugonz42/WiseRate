package com.wiserate.features.settings

import androidx.lifecycle.ViewModel
import com.wiserate.core.service.AnalyticsService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject

/** Supported locales — see docs/architecture/localization.md. */
enum class AppLanguage(val code: String, val label: String) {
    English("en", "English"),
    Spanish("es", "Español"),
    Tagalog("tl", "Tagalog")
}

data class SettingsUiState(
    val notificationsEnabled: Boolean = false,
    val darkModeEnabled: Boolean = true, // dark-only; persisted for future
    val defaultAmount: Double = 500.0,
    val language: AppLanguage = AppLanguage.English
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val analytics: AnalyticsService
) : ViewModel() {

    private val _state = MutableStateFlow(SettingsUiState())
    val state: StateFlow<SettingsUiState> = _state.asStateFlow()

    fun toggleNotifications(enabled: Boolean) = _state.update { it.copy(notificationsEnabled = enabled) }
    fun setLanguage(language: AppLanguage) = _state.update { it.copy(language = language) }
    fun setDefaultAmount(amount: Double) = _state.update { it.copy(defaultAmount = amount) }
    fun clearCache() { /* TODO: drop CachedQuote/CachedHistorical once rate cache lands */ }
}
