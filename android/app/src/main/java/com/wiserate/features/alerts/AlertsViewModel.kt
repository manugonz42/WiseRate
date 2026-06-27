package com.wiserate.features.alerts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wiserate.core.model.AlertNotifyType
import com.wiserate.core.model.RateAlert
import com.wiserate.core.service.AnalyticsEvent
import com.wiserate.core.service.AnalyticsService
import com.wiserate.core.service.ExchangeRateService
import com.wiserate.core.service.NotificationService
import com.wiserate.data.mock.MockData
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.Date
import java.util.UUID
import javax.inject.Inject

/** Free tier cap; unlimited under Premium — see docs/services/subscriptions.md. */
private const val FREE_ALERT_CAP = 3

data class AlertsUiState(
    val alerts: List<RateAlert> = emptyList(),
    val currentRate: Double = 0.0,
    val newAlertRate: Double = 63.5,
    val newAlertType: AlertNotifyType = AlertNotifyType.RateAbove,
    val isPremium: Boolean = false
) {
    val activeAlerts get() = alerts.filter { it.triggeredAt == null }
    val triggeredAlerts get() = alerts.filter { it.triggeredAt != null }
    val atFreeCap get() = !isPremium && activeAlerts.count { it.isEnabled } >= FREE_ALERT_CAP
}

@HiltViewModel
class AlertsViewModel @Inject constructor(
    private val exchangeRate: ExchangeRateService,
    private val notifications: NotificationService,
    private val analytics: AnalyticsService
) : ViewModel() {

    private val _state = MutableStateFlow(AlertsUiState(alerts = MockData.mockAlerts))
    val state: StateFlow<AlertsUiState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            val rate = runCatching { exchangeRate.getCurrentRate("EUR", "PHP").rate }.getOrDefault(63.5)
            _state.update { it.copy(currentRate = rate) }
        }
    }

    fun onNewAlertRateChange(rate: Double) = _state.update { it.copy(newAlertRate = rate) }
    fun onNewAlertTypeChange(type: AlertNotifyType) = _state.update { it.copy(newAlertType = type) }

    fun createAlert() {
        val s = _state.value
        if (s.atFreeCap) return
        val alert = RateAlert(targetRate = s.newAlertRate, isEnabled = true, createdAt = Date(), notifyType = s.newAlertType)
        analytics.trackEvent(AnalyticsEvent.AlertCreated(s.newAlertRate))
        _state.update { it.copy(alerts = it.alerts + alert) }
    }

    fun toggleAlert(id: UUID) = _state.update { st ->
        st.copy(alerts = st.alerts.map { if (it.id == id) it.copy(isEnabled = !it.isEnabled) else it })
    }

    fun deleteAlert(id: UUID) {
        notifications.cancel(id)
        _state.update { st -> st.copy(alerts = st.alerts.filterNot { it.id == id }) }
    }
}
