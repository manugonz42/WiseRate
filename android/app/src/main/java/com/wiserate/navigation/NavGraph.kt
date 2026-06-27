package com.wiserate.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShowChart
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.wiserate.design.theme.WiseColors
import com.wiserate.features.alerts.AlertsScreen
import com.wiserate.features.analytics.AnalyticsScreen
import com.wiserate.features.comparison.ComparisonScreen
import com.wiserate.features.home.HomeScreen
import com.wiserate.features.onboarding.OnboardingScreen
import com.wiserate.features.premium.PremiumScreen
import com.wiserate.features.profile.ProfileScreen
import com.wiserate.features.providerdetails.ProviderDetailScreen
import com.wiserate.features.referral.ReferralScreen
import com.wiserate.features.settings.SettingsScreen

/**
 * App-level navigation: NavHost + 5-tab bottom bar, mirroring iOS `AppRouter.swift` and
 * docs/architecture/navigation.md. Premium/Settings/Referral are modal sheets on iOS;
 * modeled here as full-screen routes for scaffold simplicity.
 *
 * Onboarding gate: boots into Onboarding, which routes to Home on complete. The auto-skip
 * below mirrors iOS WiseRateApp.swift's shortcut — remove when real onboarding ships
 * (docs/modules/onboarding.md).
 */
@Composable
fun WiseRateApp(deepLinkUri: String? = null) {
    val navController = rememberNavController()

    // TODO(onboarding): start at Routes.ONBOARDING once the gate is real. See onboarding.md.
    val startDestination = Routes.HOME

    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route
    val showBottomBar = currentRoute in Tab.entries.map { it.route }

    Scaffold(
        containerColor = WiseColors.background,
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(containerColor = WiseColors.surface) {
                    Tab.entries.forEach { tab ->
                        NavigationBarItem(
                            selected = currentRoute == tab.route,
                            onClick = {
                                navController.navigate(tab.route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(tab.icon(), contentDescription = tab.item.label) },
                            label = { Text(tab.item.label) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = WiseColors.primary,
                                selectedTextColor = WiseColors.primary,
                                indicatorColor = WiseColors.surfaceElevated,
                                unselectedIconColor = WiseColors.textTertiary,
                                unselectedTextColor = WiseColors.textTertiary
                            )
                        )
                    }
                }
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = startDestination
        ) {
            composable(Routes.HOME) {
                HomeScreen(
                    onProviderTap = { navController.navigate(Routes.providerDetail(it)) },
                    onCompareAll = { navController.navigate(Routes.COMPARE) },
                    onUpgrade = { navController.navigate(Routes.PREMIUM) },
                    contentPadding = padding
                )
            }
            composable(Routes.COMPARE) {
                ComparisonScreen(
                    onProviderTap = { navController.navigate(Routes.providerDetail(it)) },
                    contentPadding = padding
                )
            }
            composable(Routes.ANALYTICS) {
                AnalyticsScreen(
                    onUpgrade = { navController.navigate(Routes.PREMIUM) },
                    onSetAlert = { navController.navigate(Routes.ALERTS) },
                    contentPadding = padding
                )
            }
            composable(Routes.ALERTS) {
                AlertsScreen(
                    onUpgrade = { navController.navigate(Routes.PREMIUM) },
                    contentPadding = padding
                )
            }
            composable(Routes.PROFILE) {
                ProfileScreen(
                    onSettings = { navController.navigate(Routes.SETTINGS) },
                    onReferral = { navController.navigate(Routes.REFERRAL) },
                    onUpgrade = { navController.navigate(Routes.PREMIUM) },
                    onProviderTap = { navController.navigate(Routes.providerDetail(it)) },
                    contentPadding = padding
                )
            }
            composable(
                route = Routes.PROVIDER_DETAIL,
                arguments = listOf(navArgument("providerID") { type = NavType.StringType })
            ) { entry ->
                ProviderDetailScreen(
                    providerID = entry.arguments?.getString("providerID").orEmpty(),
                    onBack = { navController.popBackStack() },
                    onUpgrade = { navController.navigate(Routes.PREMIUM) }
                )
            }
            composable(Routes.PREMIUM) {
                PremiumScreen(onDismiss = { navController.popBackStack() })
            }
            composable(Routes.SETTINGS) {
                SettingsScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.REFERRAL) {
                ReferralScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.ONBOARDING) {
                OnboardingScreen(onComplete = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.ONBOARDING) { inclusive = true }
                    }
                })
            }
        }
    }
}

private fun Tab.icon(): ImageVector = when (this) {
    Tab.Home -> Icons.Filled.Home
    Tab.Compare -> Icons.Filled.SwapHoriz
    Tab.Analytics -> Icons.Filled.ShowChart
    Tab.Alerts -> Icons.Filled.Notifications
    Tab.Profile -> Icons.Filled.Person
}
