package com.wiserate.features.onboarding

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wiserate.core.model.OnboardingPage
import com.wiserate.core.service.NotificationService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OnboardingUiState(
    val currentPage: OnboardingPage = OnboardingPage.Welcome,
    val selectedSendCurrency: String = "EUR",
    val selectedReceiveCurrency: String = "PHP",
    val notificationsRequested: Boolean = false
) {
    val pages = OnboardingPage.entries
}

@HiltViewModel
class OnboardingViewModel @Inject constructor(
    private val notifications: NotificationService
) : ViewModel() {

    private val _state = MutableStateFlow(OnboardingUiState())
    val state: StateFlow<OnboardingUiState> = _state.asStateFlow()

    fun next() {
        val pages = OnboardingPage.entries
        val nextIndex = (_state.value.currentPage.index + 1).coerceAtMost(pages.lastIndex)
        _state.update { it.copy(currentPage = pages[nextIndex]) }
    }

    fun back() {
        val pages = OnboardingPage.entries
        val prevIndex = (_state.value.currentPage.index - 1).coerceAtLeast(0)
        _state.update { it.copy(currentPage = pages[prevIndex]) }
    }

    fun setCurrencies(send: String, receive: String) =
        _state.update { it.copy(selectedSendCurrency = send, selectedReceiveCurrency = receive) }

    /** Page 4: request permission then complete. onComplete persists currencies + flag. */
    fun requestNotificationsAndComplete(onComplete: () -> Unit) {
        viewModelScope.launch {
            notifications.requestPermission()
            _state.update { it.copy(notificationsRequested = true) }
            onComplete()
        }
    }
}
