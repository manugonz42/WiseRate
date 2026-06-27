package com.wiserate.features.analytics

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wiserate.core.model.HistoricalRate
import com.wiserate.core.model.TimeFrame
import com.wiserate.core.service.ExchangeRateService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class RateStats(val high: Double, val low: Double, val average: Double, val changePercent: Double)

data class AnalyticsUiState(
    val isLoading: Boolean = true,
    val selectedTimeFrame: TimeFrame = TimeFrame.MONTH_30,
    val historicalRates: List<HistoricalRate> = emptyList()
) {
    val stats: RateStats?
        get() {
            if (historicalRates.isEmpty()) return null
            val rates = historicalRates.map { it.rate }
            val first = rates.first()
            val last = rates.last()
            return RateStats(
                high = rates.max(),
                low = rates.min(),
                average = rates.average(),
                changePercent = if (first != 0.0) (last - first) / first * 100 else 0.0
            )
        }
}

@HiltViewModel
class AnalyticsViewModel @Inject constructor(
    private val exchangeRate: ExchangeRateService
) : ViewModel() {

    private val _state = MutableStateFlow(AnalyticsUiState())
    val state: StateFlow<AnalyticsUiState> = _state.asStateFlow()

    init { load() }

    /** ≥3M (MONTH_90 / YEAR_1) are Premium-gated — see docs/services/subscriptions.md. */
    fun onTimeFrameChange(timeFrame: TimeFrame) { _state.update { it.copy(selectedTimeFrame = timeFrame) }; load() }

    private fun load() {
        viewModelScope.launch {
            val tf = _state.value.selectedTimeFrame
            _state.update { it.copy(isLoading = true) }
            val rates = runCatching { exchangeRate.getHistoricalRates("EUR", "PHP", tf) }.getOrDefault(emptyList())
            _state.update { it.copy(isLoading = false, historicalRates = rates) }
        }
    }
}
