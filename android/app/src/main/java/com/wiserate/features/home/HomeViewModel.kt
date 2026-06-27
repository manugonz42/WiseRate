package com.wiserate.features.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wiserate.core.model.SponsoredOffer
import com.wiserate.core.model.TransferQuote
import com.wiserate.core.service.AnalyticsEvent
import com.wiserate.core.service.AnalyticsService
import com.wiserate.core.service.ExchangeRateService
import com.wiserate.core.service.TransferProviderService
import com.wiserate.data.mock.MockData
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Default send amount for the home rate card. Open question in docs/modules/home.md. */
private const val DEFAULT_AMOUNT = 500.0

data class HomeUiState(
    val isLoading: Boolean = true,
    val currentRate: Double = 0.0,
    val rateChange24h: Double = 0.0,
    val isStale: Boolean = false,
    val topQuotes: List<TransferQuote> = emptyList(),
    val sponsoredOffer: SponsoredOffer? = null
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val exchangeRate: ExchangeRateService,
    private val providers: TransferProviderService,
    private val analytics: AnalyticsService
) : ViewModel() {

    private val _state = MutableStateFlow(HomeUiState())
    val state: StateFlow<HomeUiState> = _state.asStateFlow()

    init {
        analytics.trackEvent(AnalyticsEvent.AppOpen)
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            val rate = runCatching { exchangeRate.getCurrentRate("EUR", "PHP") }.getOrNull()
            val quotes = runCatching { providers.getQuotes(DEFAULT_AMOUNT, "EUR", "PHP") }.getOrDefault(emptyList())
            _state.update {
                it.copy(
                    isLoading = false,
                    currentRate = rate?.rate ?: 0.0,
                    rateChange24h = rate?.delta24h ?: 0.0,
                    isStale = rate?.isStale ?: false,
                    topQuotes = quotes.sortedByDescending { q -> q.receiveAmount }.take(3),
                    sponsoredOffer = MockData.sponsoredOffers.firstOrNull()
                )
            }
        }
    }

    fun onSponsoredTapped() = analytics.trackProviderClick(providerID = "sponsored", source = "home")
}
