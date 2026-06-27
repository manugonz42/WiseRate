package com.wiserate.data.remote

import kotlinx.serialization.Serializable
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * Retrofit client for api.frankfurter.dev (ECB reference rates, no API key).
 * Stub: declared but not yet wired into [com.wiserate.core.service.MockExchangeRateService].
 * Mirrors iOS `WiseRate/Core/Services/Networking/FrankfurterDTO.swift`.
 * See docs/services/exchange-rate.md.
 *
 * Base URL: https://api.frankfurter.dev/v1/
 */
interface FrankfurterApi {

    /** GET /v1/latest?base=EUR&symbols=PHP */
    @GET("latest")
    suspend fun latest(
        @Query("base") base: String,
        @Query("symbols") symbols: String
    ): FrankfurterLatest

    /**
     * GET /v1/{start}..{end}?base=EUR&symbols=PHP — open-ended `{start}..` allowed.
     * Pass the range as a single path segment, e.g. "2024-01-01..".
     */
    @GET("{range}")
    suspend fun timeseries(
        @Path("range", encoded = true) range: String,
        @Query("base") base: String,
        @Query("symbols") symbols: String
    ): FrankfurterTimeseries

    companion object {
        const val BASE_URL = "https://api.frankfurter.dev/v1/"
    }
}

@Serializable
data class FrankfurterLatest(
    val amount: Double,
    val base: String,
    val date: String,
    val rates: Map<String, Double>
)

@Serializable
data class FrankfurterTimeseries(
    val base: String,
    val start_date: String,
    val end_date: String,
    /** date string -> (symbol -> rate) */
    val rates: Map<String, Map<String, Double>>
)
