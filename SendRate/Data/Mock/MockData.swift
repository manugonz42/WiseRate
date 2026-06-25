import Foundation

struct MockData {
    static let providers: [TransferProvider] = [
        TransferProvider(id: "wise", name: "Wise", iconName: "W", brandColor: .green, trustScore: 4.8, userRating: 4.7, websiteURL: "https://wise.com", affiliateURL: "https://wise.com/invite/u/maria123"),
        TransferProvider(id: "remitly", name: "Remitly", iconName: "R", brandColor: .blue, trustScore: 4.6, userRating: 4.5, websiteURL: "https://remitly.com", affiliateURL: "https://remitly.com/invite/maria123"),
        TransferProvider(id: "western_union", name: "Western Union", iconName: "WU", brandColor: .yellow, trustScore: 4.2, userRating: 4.0, websiteURL: "https://westernunion.com", affiliateURL: "https://westernunion.com/affiliate/maria123"),
        TransferProvider(id: "worldremit", name: "WorldRemit", iconName: "WR", brandColor: .teal, trustScore: 4.5, userRating: 4.3, websiteURL: "https://worldremit.com", affiliateURL: "https://worldremit.com/invite/maria123"),
        TransferProvider(id: "xoom", name: "Xoom", iconName: "X", brandColor: .indigo, trustScore: 4.4, userRating: 4.2, websiteURL: "https://xoom.com", affiliateURL: "https://xoom.com/affiliate/maria123"),
        TransferProvider(id: "moneygram", name: "MoneyGram", iconName: "MG", brandColor: .red, trustScore: 4.3, userRating: 4.1, websiteURL: "https://moneygram.com", affiliateURL: nil),
        TransferProvider(id: "skrill", name: "Skrill", iconName: "S", brandColor: .purple, trustScore: 4.1, userRating: 4.0, websiteURL: "https://skrill.com", affiliateURL: nil),
        TransferProvider(id: "revolut", name: "Revolut", iconName: "R", brandColor: .blue, trustScore: 4.6, userRating: 4.5, websiteURL: "https://revolut.com", affiliateURL: "https://revolut.com/invite/maria123"),
        TransferProvider(id: "ofx", name: "OFX", iconName: "O", brandColor: .cyan, trustScore: 4.5, userRating: 4.4, websiteURL: "https://ofx.com", affiliateURL: nil),
        TransferProvider(id: "xe", name: "Xe", iconName: "Xe", brandColor: .orange, trustScore: 4.4, userRating: 4.3, websiteURL: "https://xe.com", affiliateURL: nil),
        TransferProvider(id: "santander", name: "Santander", iconName: "SB", brandColor: .red, trustScore: 3.8, userRating: 3.5, websiteURL: "https://santander.com", affiliateURL: nil),
        TransferProvider(id: "bbva", name: "BBVA", iconName: "BBVA", brandColor: .blue, trustScore: 3.9, userRating: 3.6, websiteURL: "https://bbva.com", affiliateURL: nil),
        TransferProvider(id: "caixabank", name: "CaixaBank", iconName: "CB", brandColor: .blue, trustScore: 3.7, userRating: 3.4, websiteURL: "https://caixabank.com", affiliateURL: nil),
        TransferProvider(id: "n26", name: "N26", iconName: "N26", brandColor: .blue, trustScore: 4.5, userRating: 4.4, websiteURL: "https://n26.com", affiliateURL: "https://n26.com/invite/maria123"),
        TransferProvider(id: "ing", name: "ING", iconName: "ING", brandColor: .orange, trustScore: 4.2, userRating: 4.1, websiteURL: "https://ing.com", affiliateURL: nil)
    ]
    
    static func generateQuotes(for amount: Double) -> [TransferQuote] {
        let baseRate = 63.50
        let quotes: [(String, String, Double, Double, DeliveryEstimate, Double, Bool, String?)] = [
            ("wise", "Wise", baseRate + 0.12, 2.99, .hours, 0.001, false, nil),
            ("remitly", "Remitly", baseRate + 0.05, 3.99, .instant, 0.003, false, nil),
            ("western_union", "Western Union", baseRate - 0.30, 4.99, .instant, 0.008, false, nil),
            ("worldremit", "WorldRemit", baseRate + 0.02, 3.49, .minutes, 0.004, false, nil),
            ("xoom", "Xoom", baseRate - 0.10, 3.99, .hours, 0.005, false, nil),
            ("moneygram", "MoneyGram", baseRate - 0.25, 5.99, .instant, 0.007, false, nil),
            ("skrill", "Skrill", baseRate - 0.15, 4.49, .hours, 0.006, false, nil),
            ("revolut", "Revolut", baseRate + 0.15, 0.00, .hours, 0.001, false, nil),
            ("ofx", "OFX", baseRate + 0.08, 0.00, .nextDay, 0.002, false, nil),
            ("xe", "Xe", baseRate + 0.00, 2.49, .sameDay, 0.003, false, nil),
            ("santander", "Santander", baseRate - 1.20, 15.00, .twoToThreeDays, 0.015, false, nil),
            ("bbva", "BBVA", baseRate - 0.95, 12.00, .twoToThreeDays, 0.012, false, nil),
            ("caixabank", "CaixaBank", baseRate - 1.10, 14.00, .threeToFiveDays, 0.014, false, nil),
            ("n26", "N26", baseRate + 0.10, 1.50, .hours, 0.002, true, "Special promotion - 0% fee on first transfer"),
            ("ing", "ING", baseRate - 0.80, 10.00, .nextDay, 0.010, false, nil)
        ]
        
        return quotes.map { quote in
            let receiveAmount = (amount - quote.2) * quote.3
            return TransferQuote(
                providerID: quote.0,
                providerName: quote.1,
                providerIcon: String(quote.1.prefix(2)),
                sendAmount: amount,
                sendCurrency: "EUR",
                receiveCurrency: "PHP",
                exchangeRate: quote.3,
                fee: quote.2,
                feeCurrency: "EUR",
                receiveAmount: receiveAmount,
                deliveryEstimate: quote.4,
                deliveryMethod: .bankTransfer,
                markup: quote.5,
                rateValidUntil: Date().addingTimeInterval(300),
                isPromotion: quote.6,
                promotionText: quote.7
            )
        }
    }
    
    static func generateHistoricalRates(timeFrame: TimeFrame) -> [HistoricalRate] {
        let calendar = Calendar.current
        let now = Date()
        let count: Int
        let interval: TimeInterval
        
        switch timeFrame {
        case .day24:
            count = 24
            interval = 3600
        case .week7:
            count = 7 * 24
            interval = 3600
        case .month30:
            count = 30
            interval = 86400
        case .month90:
            count = 90
            interval = 86400
        case .year1:
            count = 52
            interval = 604800
        }
        
        var rates: [HistoricalRate] = []
        var currentRate = 62.0
        
        for i in 0..<count {
            let date = calendar.date(byAdding: .second, value: -Int(interval * Double(count - i)), to: now)!
            let change = Double.random(in: -0.15...0.15)
            currentRate = max(58.0, min(68.0, currentRate + change))
            rates.append(HistoricalRate(date: date, rate: currentRate, provider: nil))
        }
        
        return rates
    }
    
    static let providerDetails: [String: ProviderDetail] = [
        "wise": ProviderDetail(
            id: "wise",
            name: "Wise",
            iconName: "W",
            brandColor: .green,
            description: "Wise (formerly TransferWise) is a British fintech company that provides international money transfer services. It is known for its transparent fee structure and mid-market exchange rates.",
            trustScore: 4.8,
            userRating: 4.7,
            reviewCount: 24500,
            transferLimits: .init(minAmount: 1, maxAmount: 1000000, currency: "EUR"),
            fees: [
                .init(method: .bankTransfer, fixedFee: 0.41, percentageFee: 0.43, description: "Bank transfer from your Spanish bank account"),
                .init(method: .debitCard, fixedFee: 0.00, percentageFee: 1.50, description: "Debit card payment"),
                .init(method: .creditCard, fixedFee: 0.00, percentageFee: 2.00, description: "Credit card payment")
            ],
            deliveryMethods: [.bankTransfer, .mobileWallet],
            pros: [
                "Mid-market exchange rate",
                "Transparent fees",
                "Fast transfers (hours)",
                "Excellent mobile app",
                "No hidden markups"
            ],
            cons: [
                "Higher fee for card payments",
                "Limited cash pickup options",
                "Requires verification for large amounts"
            ],
            historicalRates: generateHistoricalRates(timeFrame: .month30),
            websiteURL: "https://wise.com",
            affiliateURL: "https://wise.com/invite/u/maria123"
        ),
        "remitly": ProviderDetail(
            id: "remitly",
            name: "Remitly",
            iconName: "R",
            brandColor: .blue,
            description: "Remitly is an American online remittance service that provides international money transfers to over 170 countries.",
            trustScore: 4.6,
            userRating: 4.5,
            reviewCount: 18200,
            transferLimits: .init(minAmount: 1, maxAmount: 500000, currency: "EUR"),
            fees: [
                .init(method: .bankTransfer, fixedFee: 1.99, percentageFee: 0.00, description: "Bank transfer"),
                .init(method: .debitCard, fixedFee: 3.99, percentageFee: 0.00, description: "Debit card"),
                .init(method: .mobileWallet, fixedFee: 0.00, percentageFee: 0.00, description: "GCash, Maya, or bank deposit")
            ],
            deliveryMethods: [.bankTransfer, .cashPickup, .mobileWallet],
            pros: [
                "Fastest for GCash",
                "No fees on mobile wallet transfers",
                "Promotional rates",
                "Good for regular senders"
            ],
            cons: [
                "Slightly lower exchange rates",
                "Markup on exchange rate",
                "Limited for large transfers"
            ],
            historicalRates: generateHistoricalRates(timeFrame: .month30),
            websiteURL: "https://remitly.com",
            affiliateURL: "https://remitly.com/invite/maria123"
        ),
        "western_union": ProviderDetail(
            id: "western_union",
            name: "Western Union",
            iconName: "WU",
            brandColor: .yellow,
            description: "Western Union is an American financial services and communications company with a global network for money transfers.",
            trustScore: 4.2,
            userRating: 4.0,
            reviewCount: 32100,
            transferLimits: .init(minAmount: 1, maxAmount: 500000, currency: "EUR"),
            fees: [
                .init(method: .bankTransfer, fixedFee: 4.99, percentageFee: 0.00, description: "Bank transfer"),
                .init(method: .cashPickup, fixedFee: 9.99, percentageFee: 0.00, description: "Cash pickup at agent location"),
                .init(method: .debitCard, fixedFee: 5.99, percentageFee: 0.00, description: "Debit card")
            ],
            deliveryMethods: [.bankTransfer, .cashPickup, .mobileWallet],
            pros: [
                "Widest cash pickup network",
                "Instant cash pickup",
                "Available in most towns",
                "No bank account needed"
            ],
            cons: [
                "Higher fees",
                "Poorer exchange rates",
                "Hidden markup in rates",
                "Slow bank transfers"
            ],
            historicalRates: generateHistoricalRates(timeFrame: .month30),
            websiteURL: "https://westernunion.com",
            affiliateURL: "https://westernunion.com/affiliate/maria123"
        )
    ]
    
    static let sponsoredOffers: [SponsoredOffer] = [
        SponsoredOffer(
            providerName: "N26",
            providerIcon: "N26",
            headline: "Open N26 & Get 0% Transfer Fee",
            description: "Send your first €500 with zero fees when you open an N26 account today.",
            ctaText: "Open Account",
            affiliateURL: "https://n26.com/invite/maria123",
            validUntil: Calendar.current.date(byAdding: .day, value: 30, to: Date())!,
            discountPercentage: 100
        ),
        SponsoredOffer(
            providerName: "Revolut",
            providerIcon: "R",
            headline: "Revolut Premium: Free Transfers",
            description: "Upgrade to Premium and enjoy unlimited free international transfers at the real exchange rate.",
            ctaText: "Try Premium",
            affiliateURL: "https://revolut.com/invite/maria123",
            validUntil: Calendar.current.date(byAdding: .day, value: 14, to: Date())!,
            discountPercentage: nil
        )
    ]
    
    static let mockAlerts: [RateAlert] = [
        RateAlert(targetRate: 64.0, isEnabled: true, createdAt: Date().addingTimeInterval(-86400 * 7), triggeredAt: nil, notifyType: .rateAbove),
        RateAlert(targetRate: 63.0, isEnabled: true, createdAt: Date().addingTimeInterval(-86400 * 3), triggeredAt: nil, notifyType: .rateBelow),
        RateAlert(targetRate: 65.0, isEnabled: false, createdAt: Date().addingTimeInterval(-86400 * 14), triggeredAt: Date().addingTimeInterval(-86400 * 2), notifyType: .rateAbove)
    ]
}
