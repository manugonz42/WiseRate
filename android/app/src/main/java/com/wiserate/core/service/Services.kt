package com.wiserate.core.service

import android.util.Log
import com.wiserate.core.model.HistoricalRate
import com.wiserate.core.model.ProviderDetail
import com.wiserate.core.model.Rate
import com.wiserate.core.model.RateAlert
import com.wiserate.core.model.SubscriptionPlan
import com.wiserate.core.model.SubscriptionStatus
import com.wiserate.core.model.TimeFrame
import com.wiserate.core.model.TransferProvider
import com.wiserate.core.model.TransferQuote
import com.wiserate.data.mock.MockData
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.util.Date
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.random.Random

/**
 * Service contracts + mock implementations. Mirrors iOS `WiseRate/Core/Services/Services.swift`
 * at its mock-only scaffold state. Real impls (Retrofit/Frankfurter, Room, FCM, Play Billing)
 * follow the iOS sequencing. Bound to interfaces in di/AppModule.kt.
 */

// MARK: - Exchange Rate

interface ExchangeRateService {
    suspend fun getCurrentRate(from: String, to: String): Rate
    suspend fun getHistoricalRates(from: String, to: String, timeFrame: TimeFrame): List<HistoricalRate>
    /** Cosmetic ticker; ECB updates daily. See docs/services/exchange-rate.md. */
    fun getRatesStream(from: String, to: String): Flow<Double>
}

/**
 * Mock rate service: fixed 63.50 EUR→PHP. The real impl will call Frankfurter via
 * [com.wiserate.data.remote.FrankfurterApi]. See docs/services/exchange-rate.md.
 */
@Singleton
class MockExchangeRateService @Inject constructor() : ExchangeRateService {
    override suspend fun getCurrentRate(from: String, to: String): Rate {
        delay(150)
        return Rate(rate = 63.50, timestamp = Date(), delta24h = 0.18, delta7d = -0.42, isStale = false)
    }

    override suspend fun getHistoricalRates(from: String, to: String, timeFrame: TimeFrame): List<HistoricalRate> {
        delay(150)
        return MockData.generateHistoricalRates(timeFrame)
    }

    override fun getRatesStream(from: String, to: String): Flow<Double> = flow {
        while (true) {
            emit(63.50 + Random.nextDouble(-0.02, 0.02))
            delay(60_000)
        }
    }
}

// MARK: - Transfer Provider

interface TransferProviderService {
    suspend fun getQuotes(amount: Double, from: String, to: String, deliveryMethod: com.wiserate.core.model.DeliveryMethod? = null): List<TransferQuote>
    suspend fun getProviderDetail(id: String): ProviderDetail?
    fun searchProviders(query: String): List<TransferProvider>
}

@Singleton
class MockTransferProviderService @Inject constructor(
    private val exchangeRate: ExchangeRateService
) : TransferProviderService {
    override suspend fun getQuotes(amount: Double, from: String, to: String, deliveryMethod: com.wiserate.core.model.DeliveryMethod?): List<TransferQuote> {
        // Quotes mock, anchored to the (currently mock) mid-market rate. See docs/services/exchange-rate.md.
        val baseRate = runCatching { exchangeRate.getCurrentRate(from, to).rate }.getOrDefault(63.50)
        val quotes = MockData.generateQuotes(amount, baseRate)
        return if (deliveryMethod != null) quotes.map { it.copy(deliveryMethod = deliveryMethod) } else quotes
    }

    override suspend fun getProviderDetail(id: String): ProviderDetail? {
        delay(200)
        return MockData.providerDetails[id]
    }

    override fun searchProviders(query: String): List<TransferProvider> =
        if (query.isBlank()) MockData.providers
        else MockData.providers.filter { it.name.contains(query, ignoreCase = true) }
}

// MARK: - Analytics

sealed interface AnalyticsEvent {
    data object AppOpen : AnalyticsEvent
    data class ComparisonStarted(val amount: Double) : AnalyticsEvent
    data class ProviderSelected(val providerID: String) : AnalyticsEvent
    data class TransferInitiated(val providerID: String, val amount: Double) : AnalyticsEvent
    data class AlertCreated(val targetRate: Double) : AnalyticsEvent
    data object PremiumUpgrade : AnalyticsEvent
    data object ReferralShared : AnalyticsEvent
}

interface AnalyticsService {
    fun trackEvent(event: AnalyticsEvent)
    fun trackProviderClick(providerID: String, source: String)
    fun trackComparison(amount: Double, providerCount: Int)
}

/** Console-only, matching iOS. Real taxonomy in docs/services/analytics.md. */
@Singleton
class LogAnalyticsService @Inject constructor() : AnalyticsService {
    override fun trackEvent(event: AnalyticsEvent) { Log.d(TAG, "event: $event") }
    override fun trackProviderClick(providerID: String, source: String) { Log.d(TAG, "providerClick: $providerID from $source") }
    override fun trackComparison(amount: Double, providerCount: Int) { Log.d(TAG, "comparison: €$amount across $providerCount providers") }
    private companion object { const val TAG = "WiseRateAnalytics" }
}

// MARK: - Notifications (FCM + local parity with iOS local notifications)

interface NotificationService {
    suspend fun requestPermission(): Boolean
    suspend fun isAuthorized(): Boolean
    fun cancel(alertID: UUID)
    /**
     * Evaluates enabled, not-yet-triggered alerts against the current rate and fires a
     * local notification for each now due. Returns fired IDs so the caller can persist
     * triggeredAt. See docs/services/notifications.md.
     */
    suspend fun checkAndFireDueAlerts(alerts: List<RateAlert>, currentRate: Double): List<UUID>
}

/** Empty-bodied stub, matching iOS scaffold state. See docs/services/notifications.md. */
@Singleton
class MockNotificationService @Inject constructor() : NotificationService {
    override suspend fun requestPermission(): Boolean = false
    override suspend fun isAuthorized(): Boolean = false
    override fun cancel(alertID: UUID) {}
    override suspend fun checkAndFireDueAlerts(alerts: List<RateAlert>, currentRate: Double): List<UUID> = emptyList()
}

// MARK: - Subscriptions (Google Play Billing parity with iOS StoreKit 2)

interface SubscriptionService {
    suspend fun getSubscriptionStatus(): SubscriptionStatus
    fun getAvailablePlans(): List<SubscriptionPlan>
    suspend fun purchasePlan(plan: SubscriptionPlan)
    suspend fun restorePurchases()
}

/** Always returns Free, matching iOS scaffold. Real impl uses Play Billing. See docs/services/subscriptions.md. */
@Singleton
class MockSubscriptionService @Inject constructor() : SubscriptionService {
    override suspend fun getSubscriptionStatus(): SubscriptionStatus = SubscriptionStatus.Free
    override fun getAvailablePlans(): List<SubscriptionPlan> = SubscriptionPlan.plans
    override suspend fun purchasePlan(plan: SubscriptionPlan) { /* no-op until Play Billing wired */ }
    override suspend fun restorePurchases() { /* no-op */ }
}
