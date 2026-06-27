package com.wiserate.core.model

/**
 * Cross-platform enums. Mirrors iOS `WiseRate/Core/Models/Enums.swift`.
 * Icons are Material symbol names (vs SF Symbols on iOS). See docs/architecture/data-model.md.
 */

enum class SortOption(val label: String, val icon: String) {
    HighestPHP("Highest PHP", "north_east"),
    LowestFee("Lowest Fee", "paid"),
    Fastest("Fastest", "bolt"),
    BestRate("Best Rate", "show_chart"),
    Recommended("Recommended", "star")
}

enum class TimeFrame(val label: String) {
    DAY_24("24H"),
    WEEK_7("7D"),
    MONTH_30("30D"),
    MONTH_90("90D"),
    YEAR_1("1Y");

    /**
     * Calendar days of history to request. ECB data is daily, so 24H/7D are
     * approximated from recent daily closes — see docs/services/exchange-rate.md.
     */
    val lookbackDays: Int
        get() = when (this) {
            DAY_24 -> 2
            WEEK_7 -> 7
            MONTH_30 -> 30
            MONTH_90 -> 90
            YEAR_1 -> 365
        }
}

enum class TabItem(val label: String, val icon: String, val selectedIcon: String) {
    Home("Home", "home", "home"),
    Compare("Compare", "swap_horiz", "swap_horiz"),
    Analytics("Analytics", "show_chart", "show_chart"),
    Alerts("Alerts", "notifications", "notifications"),
    Profile("Profile", "person", "person")
}

enum class OnboardingPage(val index: Int, val title: String, val subtitle: String, val icon: String) {
    Welcome(0, "Welcome to WiseRate", "Find the cheapest way to send money from Spain to the Philippines", "send"),
    Features(1, "Compare & Save", "Compare exchange rates, fees, and delivery times across 15+ providers", "bar_chart"),
    Currency(2, "Your Currencies", "Set your default sending and receiving currencies", "currency_exchange"),
    Notifications(3, "Stay Updated", "Get alerts when rates hit your target", "notifications_active")
}

enum class AlertFrequency(val label: String) {
    Immediate("Immediate"),
    Hourly("Hourly Digest"),
    Daily("Daily Digest")
}
