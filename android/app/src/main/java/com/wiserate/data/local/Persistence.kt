package com.wiserate.data.local

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase

/**
 * Room entities + DAOs for user-owned local data. Mirrors iOS SwiftData models in
 * `WiseRate/Core/Services/Persistence/PersistenceModels.swift`.
 *
 * Stub: defined but not yet wired into any ViewModel — feature code still reads MockData.
 * Rate/quote caching is intentionally NOT here (served by the rate layer, as on iOS).
 * See docs/services/persistence.md.
 */

@Entity(tableName = "user_profile")
data class UserProfileEntity(
    @PrimaryKey val id: String,
    val name: String,
    val email: String,
    val avatarURL: String?,
    val isPremium: Boolean,
    val preferredSendCurrency: String,
    val preferredReceiveCurrency: String,
    val defaultDeliveryMethod: String,
    val hasCompletedOnboarding: Boolean
)

@Entity(tableName = "rate_alert")
data class RateAlertEntity(
    @PrimaryKey val id: String,
    val targetRate: Double,
    val isEnabled: Boolean,
    val createdAt: Long,
    val triggeredAt: Long?,
    val notifyType: String
)

@Entity(tableName = "favorite_provider")
data class FavoriteProviderEntity(
    @PrimaryKey val providerID: String,
    val addedAt: Long
)

@Entity(tableName = "recent_provider")
data class RecentProviderEntity(
    @PrimaryKey val providerID: String,
    val lastViewedAt: Long
)

@Entity(tableName = "setting")
data class SettingEntity(
    @PrimaryKey val key: String,
    val value: String
)

@Dao
interface UserProfileDao {
    @Query("SELECT * FROM user_profile LIMIT 1")
    suspend fun get(): UserProfileEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(profile: UserProfileEntity)
}

@Dao
interface RateAlertDao {
    @Query("SELECT * FROM rate_alert ORDER BY createdAt DESC")
    suspend fun list(): List<RateAlertEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(alert: RateAlertEntity)

    @Query("DELETE FROM rate_alert WHERE id = :id")
    suspend fun delete(id: String)
}

@Dao
interface FavoriteProviderDao {
    @Query("SELECT * FROM favorite_provider ORDER BY addedAt DESC")
    suspend fun list(): List<FavoriteProviderEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(favorite: FavoriteProviderEntity)

    @Query("DELETE FROM favorite_provider WHERE providerID = :id")
    suspend fun delete(id: String)
}

@Dao
interface RecentProviderDao {
    @Query("SELECT * FROM recent_provider ORDER BY lastViewedAt DESC LIMIT 10")
    suspend fun list(): List<RecentProviderEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(recent: RecentProviderEntity)
}

@Dao
interface SettingDao {
    @Query("SELECT value FROM setting WHERE `key` = :key")
    suspend fun get(key: String): String?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun set(setting: SettingEntity)
}

@Database(
    entities = [
        UserProfileEntity::class,
        RateAlertEntity::class,
        FavoriteProviderEntity::class,
        RecentProviderEntity::class,
        SettingEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class WiseRateDatabase : RoomDatabase() {
    abstract fun userProfileDao(): UserProfileDao
    abstract fun rateAlertDao(): RateAlertDao
    abstract fun favoriteProviderDao(): FavoriteProviderDao
    abstract fun recentProviderDao(): RecentProviderDao
    abstract fun settingDao(): SettingDao
}
