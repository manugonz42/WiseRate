package com.wiserate.features.premium

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wiserate.core.model.SubscriptionPlan
import com.wiserate.core.model.SubscriptionStatus
import com.wiserate.core.service.AnalyticsEvent
import com.wiserate.core.service.AnalyticsService
import com.wiserate.core.service.SubscriptionService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PremiumUiState(
    val plans: List<SubscriptionPlan> = SubscriptionPlan.plans,
    val selectedPlan: SubscriptionPlan? = SubscriptionPlan.plans.firstOrNull { it.isPopular },
    val status: SubscriptionStatus = SubscriptionStatus.Free,
    val isPurchasing: Boolean = false,
    val error: String? = null,
    val purchaseSucceeded: Boolean = false
)

@HiltViewModel
class PremiumViewModel @Inject constructor(
    private val subscriptions: SubscriptionService,
    private val analytics: AnalyticsService
) : ViewModel() {

    private val _state = MutableStateFlow(PremiumUiState())
    val state: StateFlow<PremiumUiState> = _state.asStateFlow()

    init {
        viewModelScope.launch { _state.update { it.copy(status = subscriptions.getSubscriptionStatus()) } }
    }

    fun selectPlan(plan: SubscriptionPlan) = _state.update { it.copy(selectedPlan = plan) }

    fun subscribe() {
        val plan = _state.value.selectedPlan ?: return
        viewModelScope.launch {
            _state.update { it.copy(isPurchasing = true, error = null) }
            val result = runCatching { subscriptions.purchasePlan(plan) }
            result.onSuccess {
                analytics.trackEvent(AnalyticsEvent.PremiumUpgrade)
                _state.update { it.copy(isPurchasing = false, purchaseSucceeded = true) }
            }.onFailure { e ->
                _state.update { it.copy(isPurchasing = false, error = e.message ?: "Purchase failed") }
            }
        }
    }

    fun restore() { viewModelScope.launch { runCatching { subscriptions.restorePurchases() } } }
}
