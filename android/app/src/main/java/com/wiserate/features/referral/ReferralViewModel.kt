package com.wiserate.features.referral

import androidx.lifecycle.ViewModel
import com.wiserate.core.service.AnalyticsEvent
import com.wiserate.core.service.AnalyticsService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

data class ReferralUiState(
    val referralCode: String = "MARIA2024",
    val referralCount: Int = 3,
    val referralEarnings: Double = 15.0,
    val earningsCurrency: String = "EUR"
)

@HiltViewModel
class ReferralViewModel @Inject constructor(
    private val analytics: AnalyticsService
) : ViewModel() {

    private val _state = MutableStateFlow(ReferralUiState())
    val state: StateFlow<ReferralUiState> = _state.asStateFlow()

    /** Deep link shared: wiserate://?ref=<code>. Real ReferralService is backend, not yet specced. */
    fun shareLink(): String {
        analytics.trackEvent(AnalyticsEvent.ReferralShared)
        return "wiserate://?ref=${_state.value.referralCode}"
    }
}
