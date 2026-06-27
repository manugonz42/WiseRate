package com.wiserate.features.comparison

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wiserate.core.model.DeliveryMethod
import com.wiserate.core.model.SortOption
import com.wiserate.core.model.TransferQuote
import com.wiserate.core.service.AnalyticsService
import com.wiserate.core.service.TransferProviderService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ComparisonUiState(
    val isLoading: Boolean = true,
    val sendAmount: Double = 500.0,
    val fromCurrency: String = "EUR",
    val toCurrency: String = "PHP",
    val sortOption: SortOption = SortOption.Recommended,
    val searchText: String = "",
    val deliveryFilter: Set<DeliveryMethod> = emptySet(),
    val quotes: List<TransferQuote> = emptyList()
) {
    val filteredQuotes: List<TransferQuote>
        get() = quotes
            .filter { searchText.isBlank() || it.providerName.contains(searchText, ignoreCase = true) }
            .let { list ->
                when (sortOption) {
                    SortOption.HighestPHP, SortOption.BestRate -> list.sortedByDescending { it.receiveAmount }
                    SortOption.LowestFee -> list.sortedBy { it.totalCost }
                    SortOption.Fastest -> list.sortedBy { it.deliveryEstimate.maxMinutes }
                    SortOption.Recommended -> list.sortedByDescending { it.receiveAmount }
                }
            }
}

@HiltViewModel
class ComparisonViewModel @Inject constructor(
    private val providers: TransferProviderService,
    private val analytics: AnalyticsService
) : ViewModel() {

    private val _state = MutableStateFlow(ComparisonUiState())
    val state: StateFlow<ComparisonUiState> = _state.asStateFlow()

    init { loadQuotes() }

    fun onAmountChange(amount: Double) { _state.update { it.copy(sendAmount = amount) }; loadQuotes() }
    fun onSortChange(option: SortOption) { _state.update { it.copy(sortOption = option) } }
    fun onSearch(text: String) { _state.update { it.copy(searchText = text) } }

    private fun loadQuotes() {
        viewModelScope.launch {
            val s = _state.value
            _state.update { it.copy(isLoading = true) }
            analytics.trackComparison(s.sendAmount, 0)
            val quotes = runCatching { providers.getQuotes(s.sendAmount, s.fromCurrency, s.toCurrency) }.getOrDefault(emptyList())
            _state.update { it.copy(isLoading = false, quotes = quotes) }
        }
    }
}
