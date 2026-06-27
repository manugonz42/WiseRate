package com.wiserate.features.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wiserate.core.model.SubscriptionStatus
import com.wiserate.core.model.UserProfile
import com.wiserate.core.service.SubscriptionService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfileUiState(
    val user: UserProfile = UserProfile.mock,
    val isEditMode: Boolean = false,
    val isPremium: Boolean = false,
    val hasUnsavedChanges: Boolean = false
)

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val subscriptions: SubscriptionService
) : ViewModel() {

    private val _state = MutableStateFlow(ProfileUiState())
    val state: StateFlow<ProfileUiState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            val premium = subscriptions.getSubscriptionStatus() != SubscriptionStatus.Free
            _state.update { it.copy(isPremium = premium) }
        }
    }

    fun toggleEditMode() = _state.update { it.copy(isEditMode = !it.isEditMode) }
    fun onFieldChanged() = _state.update { it.copy(hasUnsavedChanges = true) }
    fun save() = _state.update { it.copy(isEditMode = false, hasUnsavedChanges = false) }
    fun cancel() = _state.update { it.copy(isEditMode = false, hasUnsavedChanges = false) }
}
