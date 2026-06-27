package com.wiserate.data.mock

import com.wiserate.core.model.AlertNotifyType
import com.wiserate.core.model.BrandColor
import com.wiserate.core.model.DeliveryEstimate
import com.wiserate.core.model.DeliveryMethod
import com.wiserate.core.model.HistoricalRate
import com.wiserate.core.model.ProviderDetail
import com.wiserate.core.model.RateAlert
import com.wiserate.core.model.SponsoredOffer
import com.wiserate.core.model.TimeFrame
import com.wiserate.core.model.TransferProvider
import com.wiserate.core.model.TransferQuote
import java.util.Calendar
import java.util.Date
import kotlin.random.Random

/**
 * Static mock data. Full parity with iOS `WiseRate/Data/Mock/MockData.swift`.
 * Provider quotes remain mock (server proxy pending) but real rate anchors them
 * via TransferProviderService. See docs/services/exchange-rate.md.
 */
object MockData {

    val providers: List<TransferProvider> = listOf(
        TransferProvider("wise", "Wise", "W", BrandColor.Green, 4.8, 4.7, "https://wise.com", "https://wise.com/invite/u/maria123"),
        TransferProvider("remitly", "Remitly", "R", BrandColor.Blue, 4.6, 4.5, "https://remitly.com", "https://remitly.com/invite/maria123"),
        TransferProvider("western_union", "Western Union", "WU", BrandColor.Yellow, 4.2, 4.0, "https://westernunion.com", "https://westernunion.com/affiliate/maria123"),
        TransferProvider("worldremit", "WorldRemit", "WR", BrandColor.Teal, 4.5, 4.3, "https://worldremit.com", "https://worldremit.com/invite/maria123"),
        TransferProvider("xoom", "Xoom", "X", BrandColor.Indigo, 4.4, 4.2, "https://xoom.com", "https://xoom.com/affiliate/maria123"),
        TransferProvider("moneygram", "MoneyGram", "MG", BrandColor.Red, 4.3, 4.1, "https://moneygram.com", null),
        TransferProvider("skrill", "Skrill", "S", BrandColor.Purple, 4.1, 4.0, "https://skrill.com", null),
        TransferProvider("revolut", "Revolut", "R", BrandColor.Blue, 4.6, 4.5, "https://revolut.com", "https://revolut.com/invite/maria123"),
        TransferProvider("ofx", "OFX", "O", BrandColor.Cyan, 4.5, 4.4, "https://ofx.com", null),
        TransferProvider("xe", "Xe", "Xe", BrandColor.Orange, 4.4, 4.3, "https://xe.com", null),
        TransferProvider("santander", "Santander", "SB", BrandColor.Red, 3.8, 3.5, "https://santander.com", null),
        TransferProvider("bbva", "BBVA", "BBVA", BrandColor.Blue, 3.9, 3.6, "https://bbva.com", null),
        TransferProvider("caixabank", "CaixaBank", "CB", BrandColor.Blue, 3.7, 3.4, "https://caixabank.com", null),
        TransferProvider("n26", "N26", "N26", BrandColor.Blue, 4.5, 4.4, "https://n26.com", "https://n26.com/invite/maria123"),
        TransferProvider("ing", "ING", "ING", BrandColor.Orange, 4.2, 4.1, "https://ing.com", null)
    )

    // (id, name, fee, rate-offset added to baseRate is actually the receive multiplier; mirrors iOS tuple)
    private data class QuoteSpec(
        val id: String,
        val name: String,
        val rate: Double,
        val fee: Double,
        val delivery: DeliveryEstimate,
        val markup: Double,
        val isPromotion: Boolean,
        val promotionText: String?
    )

    fun generateQuotes(amount: Double, baseRate: Double = 63.50): List<TransferQuote> {
        val specs = listOf(
            QuoteSpec("wise", "Wise", baseRate + 0.12, 2.99, DeliveryEstimate.Hours, 0.001, false, null),
            QuoteSpec("remitly", "Remitly", baseRate + 0.05, 3.99, DeliveryEstimate.Instant, 0.003, false, null),
            QuoteSpec("western_union", "Western Union", baseRate - 0.30, 4.99, DeliveryEstimate.Instant, 0.008, false, null),
            QuoteSpec("worldremit", "WorldRemit", baseRate + 0.02, 3.49, DeliveryEstimate.Minutes, 0.004, false, null),
            QuoteSpec("xoom", "Xoom", baseRate - 0.10, 3.99, DeliveryEstimate.Hours, 0.005, false, null),
            QuoteSpec("moneygram", "MoneyGram", baseRate - 0.25, 5.99, DeliveryEstimate.Instant, 0.007, false, null),
            QuoteSpec("skrill", "Skrill", baseRate - 0.15, 4.49, DeliveryEstimate.Hours, 0.006, false, null),
            QuoteSpec("revolut", "Revolut", baseRate + 0.15, 0.00, DeliveryEstimate.Hours, 0.001, false, null),
            QuoteSpec("ofx", "OFX", baseRate + 0.08, 0.00, DeliveryEstimate.NextDay, 0.002, false, null),
            QuoteSpec("xe", "Xe", baseRate + 0.00, 2.49, DeliveryEstimate.SameDay, 0.003, false, null),
            QuoteSpec("santander", "Santander", baseRate - 1.20, 15.00, DeliveryEstimate.TwoToThreeDays, 0.015, false, null),
            QuoteSpec("bbva", "BBVA", baseRate - 0.95, 12.00, DeliveryEstimate.TwoToThreeDays, 0.012, false, null),
            QuoteSpec("caixabank", "CaixaBank", baseRate - 1.10, 14.00, DeliveryEstimate.ThreeToFiveDays, 0.014, false, null),
            QuoteSpec("n26", "N26", baseRate + 0.10, 1.50, DeliveryEstimate.Hours, 0.002, true, "Special promotion - 0% fee on first transfer"),
            QuoteSpec("ing", "ING", baseRate - 0.80, 10.00, DeliveryEstimate.NextDay, 0.010, false, null)
        )

        return specs.map { spec ->
            val receiveAmount = (amount - spec.fee) * spec.rate
            TransferQuote(
                providerID = spec.id,
                providerName = spec.name,
                providerIcon = spec.name.take(2),
                sendAmount = amount,
                sendCurrency = "EUR",
                receiveCurrency = "PHP",
                exchangeRate = spec.rate,
                fee = spec.fee,
                feeCurrency = "EUR",
                receiveAmount = receiveAmount,
                deliveryEstimate = spec.delivery,
                deliveryMethod = DeliveryMethod.BankTransfer,
                markup = spec.markup,
                rateValidUntil = Date(System.currentTimeMillis() + 300_000),
                isPromotion = spec.isPromotion,
                promotionText = spec.promotionText
            )
        }
    }

    fun generateHistoricalRates(timeFrame: TimeFrame): List<HistoricalRate> {
        val now = System.currentTimeMillis()
        val (count, intervalMillis) = when (timeFrame) {
            TimeFrame.DAY_24 -> 24 to 3_600_000L
            TimeFrame.WEEK_7 -> (7 * 24) to 3_600_000L
            TimeFrame.MONTH_30 -> 30 to 86_400_000L
            TimeFrame.MONTH_90 -> 90 to 86_400_000L
            TimeFrame.YEAR_1 -> 52 to 604_800_000L
        }

        val rates = mutableListOf<HistoricalRate>()
        var current = 62.0
        for (i in 0 until count) {
            val date = Date(now - intervalMillis * (count - i))
            current = (current + Random.nextDouble(-0.15, 0.15)).coerceIn(58.0, 68.0)
            rates += HistoricalRate(date = date, rate = current, provider = null)
        }
        return rates
    }

    val providerDetails: Map<String, ProviderDetail> = mapOf(
        "wise" to ProviderDetail(
            id = "wise",
            name = "Wise",
            iconName = "W",
            brandColor = BrandColor.Green,
            description = "Wise (formerly TransferWise) is a British fintech company that provides international money transfer services. It is known for its transparent fee structure and mid-market exchange rates.",
            trustScore = 4.8,
            userRating = 4.7,
            reviewCount = 24500,
            transferLimits = ProviderDetail.TransferLimits(1.0, 1_000_000.0, "EUR"),
            fees = listOf(
                ProviderDetail.FeeStructure(method = DeliveryMethod.BankTransfer, fixedFee = 0.41, percentageFee = 0.43, description = "Bank transfer from your Spanish bank account"),
                ProviderDetail.FeeStructure(method = DeliveryMethod.DebitCard, fixedFee = 0.00, percentageFee = 1.50, description = "Debit card payment"),
                ProviderDetail.FeeStructure(method = DeliveryMethod.DebitCard, fixedFee = 0.00, percentageFee = 2.00, description = "Debit card payment")
            ),
            deliveryMethods = listOf(DeliveryMethod.BankTransfer, DeliveryMethod.MobileWallet),
            pros = listOf(
                "Mid-market exchange rate",
                "Transparent fees",
                "Fast transfers (hours)",
                "Excellent mobile app",
                "No hidden markups"
            ),
            cons = listOf(
                "Higher fee for card payments",
                "Limited cash pickup options",
                "Requires verification for large amounts"
            ),
            historicalRates = generateHistoricalRates(TimeFrame.MONTH_30),
            websiteURL = "https://wise.com",
            affiliateURL = "https://wise.com/invite/u/maria123"
        ),
        "remitly" to ProviderDetail(
            id = "remitly",
            name = "Remitly",
            iconName = "R",
            brandColor = BrandColor.Blue,
            description = "Remitly is an American online remittance service that provides international money transfers to over 170 countries.",
            trustScore = 4.6,
            userRating = 4.5,
            reviewCount = 18200,
            transferLimits = ProviderDetail.TransferLimits(1.0, 500_000.0, "EUR"),
            fees = listOf(
                ProviderDetail.FeeStructure(method = DeliveryMethod.BankTransfer, fixedFee = 1.99, percentageFee = 0.00, description = "Bank transfer"),
                ProviderDetail.FeeStructure(method = DeliveryMethod.DebitCard, fixedFee = 3.99, percentageFee = 0.00, description = "Debit card"),
                ProviderDetail.FeeStructure(method = DeliveryMethod.MobileWallet, fixedFee = 0.00, percentageFee = 0.00, description = "GCash, Maya, or bank deposit")
            ),
            deliveryMethods = listOf(DeliveryMethod.BankTransfer, DeliveryMethod.CashPickup, DeliveryMethod.MobileWallet),
            pros = listOf(
                "Fastest for GCash",
                "No fees on mobile wallet transfers",
                "Promotional rates",
                "Good for regular senders"
            ),
            cons = listOf(
                "Slightly lower exchange rates",
                "Markup on exchange rate",
                "Limited for large transfers"
            ),
            historicalRates = generateHistoricalRates(TimeFrame.MONTH_30),
            websiteURL = "https://remitly.com",
            affiliateURL = "https://remitly.com/invite/maria123"
        ),
        "western_union" to ProviderDetail(
            id = "western_union",
            name = "Western Union",
            iconName = "WU",
            brandColor = BrandColor.Yellow,
            description = "Western Union is an American financial services and communications company with a global network for money transfers.",
            trustScore = 4.2,
            userRating = 4.0,
            reviewCount = 32100,
            transferLimits = ProviderDetail.TransferLimits(1.0, 500_000.0, "EUR"),
            fees = listOf(
                ProviderDetail.FeeStructure(method = DeliveryMethod.BankTransfer, fixedFee = 4.99, percentageFee = 0.00, description = "Bank transfer"),
                ProviderDetail.FeeStructure(method = DeliveryMethod.CashPickup, fixedFee = 9.99, percentageFee = 0.00, description = "Cash pickup at agent location"),
                ProviderDetail.FeeStructure(method = DeliveryMethod.DebitCard, fixedFee = 5.99, percentageFee = 0.00, description = "Debit card")
            ),
            deliveryMethods = listOf(DeliveryMethod.BankTransfer, DeliveryMethod.CashPickup, DeliveryMethod.MobileWallet),
            pros = listOf(
                "Widest cash pickup network",
                "Instant cash pickup",
                "Available in most towns",
                "No bank account needed"
            ),
            cons = listOf(
                "Higher fees",
                "Poorer exchange rates",
                "Hidden markup in rates",
                "Slow bank transfers"
            ),
            historicalRates = generateHistoricalRates(TimeFrame.MONTH_30),
            websiteURL = "https://westernunion.com",
            affiliateURL = "https://westernunion.com/affiliate/maria123"
        )
    )

    val sponsoredOffers: List<SponsoredOffer> = listOf(
        SponsoredOffer(
            providerName = "N26",
            providerIcon = "N26",
            headline = "Open N26 & Get 0% Transfer Fee",
            description = "Send your first €500 with zero fees when you open an N26 account today.",
            ctaText = "Open Account",
            affiliateURL = "https://n26.com/invite/maria123",
            validUntil = daysFromNow(30),
            discountPercentage = 100.0
        ),
        SponsoredOffer(
            providerName = "Revolut",
            providerIcon = "R",
            headline = "Revolut Premium: Free Transfers",
            description = "Upgrade to Premium and enjoy unlimited free international transfers at the real exchange rate.",
            ctaText = "Try Premium",
            affiliateURL = "https://revolut.com/invite/maria123",
            validUntil = daysFromNow(14),
            discountPercentage = null
        )
    )

    val mockAlerts: List<RateAlert> = listOf(
        RateAlert(targetRate = 64.0, isEnabled = true, createdAt = daysFromNow(-7), triggeredAt = null, notifyType = AlertNotifyType.RateAbove),
        RateAlert(targetRate = 63.0, isEnabled = true, createdAt = daysFromNow(-3), triggeredAt = null, notifyType = AlertNotifyType.RateBelow),
        RateAlert(targetRate = 65.0, isEnabled = false, createdAt = daysFromNow(-14), triggeredAt = daysFromNow(-2), notifyType = AlertNotifyType.RateAbove)
    )

    private fun daysFromNow(days: Int): Date =
        Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, days) }.time
}
