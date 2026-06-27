package com.wiserate.di

import com.wiserate.core.service.AnalyticsService
import com.wiserate.core.service.ExchangeRateService
import com.wiserate.core.service.LogAnalyticsService
import com.wiserate.core.service.MockExchangeRateService
import com.wiserate.core.service.MockNotificationService
import com.wiserate.core.service.MockSubscriptionService
import com.wiserate.core.service.MockTransferProviderService
import com.wiserate.core.service.NotificationService
import com.wiserate.core.service.SubscriptionService
import com.wiserate.core.service.TransferProviderService
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Binds each service interface to its mock implementation — the Android equivalent of
 * iOS's `*.shared` singletons. Swap a binding to its real impl as services land,
 * following the iOS sequencing (exchange-rate → persistence → notifications + subscriptions).
 */
@Module
@InstallIn(SingletonComponent::class)
abstract class AppModule {

    @Binds
    @Singleton
    abstract fun bindExchangeRateService(impl: MockExchangeRateService): ExchangeRateService

    @Binds
    @Singleton
    abstract fun bindTransferProviderService(impl: MockTransferProviderService): TransferProviderService

    @Binds
    @Singleton
    abstract fun bindAnalyticsService(impl: LogAnalyticsService): AnalyticsService

    @Binds
    @Singleton
    abstract fun bindNotificationService(impl: MockNotificationService): NotificationService

    @Binds
    @Singleton
    abstract fun bindSubscriptionService(impl: MockSubscriptionService): SubscriptionService
}
