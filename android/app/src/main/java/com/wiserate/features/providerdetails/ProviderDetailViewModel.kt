package com.wiserate.features.providerdetails

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wiserate.core.model.ProviderDetail
import com.wiserate.core.model.TimeFrame
import com.wiserate.core.service.AnalyticsService
import com.wiserate.core.service.TransferProviderService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProviderDetailUiState(
    val isLoading: Boolean = true,
    val provider: ProviderDetail? = null,
    val selectedTimeFrame: TimeFrame = TimeFrame.MONTH_30,
    val isFavorite: Boolean = false
)

@HiltViewModel
class ProviderDetailViewModel @Inject constructor(
    private val providers: TransferProviderService,
    private val analytics: AnalyticsService
) : ViewModel() {

    private val _state = MutableStateFlow(ProviderDetailUiState())
    val state: StateFlow<ProviderDetailUiState> = _state.asStateFlow()

    fun load(providerID: String) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            val detail = runCatching { providers.getProviderDetail(providerID) }.getOrNull()
            _state.update { it.copy(isLoading = false, provider = detail) }
        }
    }

    /** >30D historical is Premium-gated — see docs/services/subscriptions.md. */
    fun onTimeFrameChange(timeFrame: TimeFrame) = _state.update { it.copy(selectedTimeFrame = timeFrame) }
    fun toggleFavorite() = _state.update { it.copy(isFavorite = !it.isFavorite) }
    fun onAffiliateOutbound() = _state.value.provider?.let { analytics.trackProviderClick(it.id, "provider_detail") }
}
