package com.wiserate.core.model

import java.util.Date
import java.util.UUID

/**
 * Canonical domain models. Mirrors iOS `WiseRate/Core/Models/Models.swift`
 * and docs/architecture/data-model.md. All currency values in major units; ISO 4217 codes.
 */

enum class BrandColor {
    Blue, Green, Purple, Orange, Red, Teal, Indigo, Pink, Yellow, Cyan
}

data class TransferProvider(
    val id: String,
    val name: String,
    val iconName: String,
    val brandColor: BrandColor,
    val trustScore: Double,   // 0..5
    val userRating: Double,   // 0..5
    val websiteURL: String,
    val affiliateURL: String? = null,
    val isSponsored: Boolean = false
)

data class DeliveryEstimate(
    val minMinutes: Int,
    val maxMinutes: Int,
    val label: String
) {
    companion object {
        val Instant = DeliveryEstimate(0, 5, "Instant")
        val Minutes = DeliveryEstimate(5, 60, "Minutes")
        val Hours = DeliveryEstimate(60, 1440, "1-24 hours")
        val SameDay = DeliveryEstimate(1440, 2880, "Same day")
        val NextDay = DeliveryEstimate(2880, 4320, "1-2 days")
        val TwoToThreeDays = DeliveryEstimate(4320, 10080, "2-3 days")
        val ThreeToFiveDays = DeliveryEstimate(10080, 15120, "3-5 days")
    }
}

enum class DeliveryMethod(val label: String, val icon: String) {
    BankTransfer("Bank Transfer", "account_balance"),
    CashPickup("Cash Pickup", "payments"),
    MobileWallet("Mobile Wallet", "smartphone"),
    HomeDelivery("Home Delivery", "home"),
    DebitCard("Debit Card", "credit_card")
}

data class TransferQuote(
    val id: UUID = UUID.randomUUID(),
    val providerID: String,
    val providerName: String,
    val providerIcon: String,
    val sendAmount: Double,
    val sendCurrency: String,
    val receiveCurrency: String,
    val exchangeRate: Double,
    val fee: Double,
    val feeCurrency: String,
    val receiveAmount: Double,
    val deliveryEstimate: DeliveryEstimate,
    val deliveryMethod: DeliveryMethod,
    val markup: Double,
    val rateValidUntil: Date?,
    val isPromotion: Boolean,
    val promotionText: String?
) {
    val totalCost: Double get() = fee + (sendAmount * markup)
    val effectiveRate: Double get() = receiveAmount / sendAmount
    val markupPercentage: Double get() = markup * 100
}

data class HistoricalRate(
    val id: UUID = UUID.randomUUID(),
    val date: Date,
    val rate: Double,
    val provider: String? = null
)

/** Current mid-market snapshot for a currency pair. See docs/architecture/data-model.md. */
data class Rate(
    val rate: Double,
    val timestamp: Date,
    val delta24h: Double,
    val delta7d: Double,
    val isStale: Boolean
)

enum class AlertNotifyType(val label: String) {
    RateAbove("Rate Above"),
    RateBelow("Rate Below"),
    ProviderCheapest("Provider is Cheapest")
}

data class RateAlert(
    val id: UUID = UUID.randomUUID(),
    val targetRate: Double,
    val isEnabled: Boolean,
    val createdAt: Date,
    val triggeredAt: Date? = null,
    val notifyType: AlertNotifyType
)

data class UserProfile(
    val id: UUID,
    val name: String,
    val email: String,
    val avatarURL: String?,
    val isPremium: Boolean,
    val preferredSendCurrency: String,
    val preferredReceiveCurrency: String,
    val defaultDeliveryMethod: DeliveryMethod,
    val alerts: List<RateAlert>,
    val recentProviders: List<String>,
    val favoriteProviders: List<String>,
    val hasCompletedOnboarding: Boolean = false
) {
    companion object {
        val mock = UserProfile(
            id = UUID.randomUUID(),
            name = "Maria Santos",
            email = "maria@example.com",
            avatarURL = null,
            isPremium = false,
            preferredSendCurrency = "EUR",
            preferredReceiveCurrency = "PHP",
            defaultDeliveryMethod = DeliveryMethod.MobileWallet,
            alerts = emptyList(),
            recentProviders = listOf("wise", "remitly", "xoom"),
            favoriteProviders = listOf("wise", "remitly")
        )
    }
}

data class ComparisonResult(
    val id: UUID = UUID.randomUUID(),
    val amount: Double,
    val fromCurrency: String,
    val toCurrency: String,
    val quotes: List<TransferQuote>,
    val timestamp: Date
) {
    val bestQuote: TransferQuote? get() = quotes.maxByOrNull { it.receiveAmount }
    val cheapestQuote: TransferQuote? get() = quotes.minByOrNull { it.totalCost }
    val fastestQuote: TransferQuote? get() = quotes.minByOrNull { it.deliveryEstimate.maxMinutes }
}

data class SponsoredOffer(
    val id: UUID = UUID.randomUUID(),
    val providerName: String,
    val providerIcon: String,
    val headline: String,
    val description: String,
    val ctaText: String,
    val affiliateURL: String,
    val validUntil: Date,
    val discountPercentage: Double?
)

data class ProviderDetail(
    val id: String,
    val name: String,
    val iconName: String,
    val brandColor: BrandColor,
    val description: String,
    val trustScore: Double,
    val userRating: Double,
    val reviewCount: Int,
    val transferLimits: TransferLimits,
    val fees: List<FeeStructure>,
    val deliveryMethods: List<DeliveryMethod>,
    val pros: List<String>,
    val cons: List<String>,
    val historicalRates: List<HistoricalRate>,
    val websiteURL: String,
    val affiliateURL: String?
) {
    data class TransferLimits(
        val minAmount: Double,
        val maxAmount: Double,
        val currency: String
    )

    data class FeeStructure(
        val id: UUID = UUID.randomUUID(),
        val method: DeliveryMethod,
        val fixedFee: Double,
        val percentageFee: Double,
        val description: String
    )
}

// MARK: - Subscriptions (Google Play Billing parity with iOS StoreKit). See docs/services/subscriptions.md.

sealed interface SubscriptionStatus {
    data object Free : SubscriptionStatus
    data object Trial : SubscriptionStatus
    data class Premium(val plan: SubscriptionPlan) : SubscriptionStatus
}

data class SubscriptionPlan(
    val id: String,
    val name: String,
    val price: Double,
    val period: String,
    val features: List<String>,
    val isPopular: Boolean
) {
    /** Play / StoreKit / Stripe SKU id. See docs/services/subscriptions.md. */
    val productID: String
        get() = if (id == "yearly") "wiserate_premium_yearly" else "wiserate_premium_monthly"

    companion object {
        val plans = listOf(
            SubscriptionPlan(
                id = "monthly",
                name = "Monthly",
                price = 4.99,
                period = "month",
                features = listOf("Rate alerts", "Historical analytics", "Unlimited comparisons", "No ads"),
                isPopular = false
            ),
            SubscriptionPlan(
                id = "yearly",
                name = "Yearly",
                price = 39.99,
                period = "year",
                features = listOf("All Monthly features", "Personalized recommendations", "Priority support", "Save 33%"),
                isPopular = true
            )
        )
    }
}
