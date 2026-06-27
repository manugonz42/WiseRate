package com.wiserate.navigation

/**
 * Route map mirroring iOS `WiseRate/Navigation/AppRouter.swift` (Route enum) and
 * docs/architecture/navigation.md. Routes are plain string paths for Nav Compose;
 * the 5 top-level tabs are [Tab], pushes/sheets are [Dest].
 */
object Routes {
    // Tabs
    const val HOME = "home"
    const val COMPARE = "compare"
    const val ANALYTICS = "analytics"
    const val ALERTS = "alerts"
    const val PROFILE = "profile"

    // Pushes / sheets (sheets are modeled as routes for scaffold simplicity)
    const val PROVIDER_DETAIL = "provider/{providerID}"
    const val PREMIUM = "premium"
    const val SETTINGS = "settings"
    const val REFERRAL = "referral"
    const val ONBOARDING = "onboarding"

    fun providerDetail(id: String) = "provider/$id"
}

/** The 5 bottom-bar tabs, paired with their TabItem metadata. */
enum class Tab(val route: String, val item: com.wiserate.core.model.TabItem) {
    Home(Routes.HOME, com.wiserate.core.model.TabItem.Home),
    Compare(Routes.COMPARE, com.wiserate.core.model.TabItem.Compare),
    Analytics(Routes.ANALYTICS, com.wiserate.core.model.TabItem.Analytics),
    Alerts(Routes.ALERTS, com.wiserate.core.model.TabItem.Alerts),
    Profile(Routes.PROFILE, com.wiserate.core.model.TabItem.Profile)
}
