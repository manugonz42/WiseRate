import Foundation
import UserNotifications

/// Local rate-alert notifications backed by `UNUserNotificationCenter`.
/// Rate alerts are condition-based (threshold crossings), not time-based, so there is
/// nothing to schedule by date: alerts are evaluated against the latest cached rate on
/// launch / scene-active (`checkAndFireDueAlerts`) and fired immediately when due.
/// See docs/services/notifications.md.
///
/// Push (APNs) is deferred — there is no backend yet.
protocol NotificationServiceProtocol {
    func requestPermission() async -> Bool
    func authorizationStatus() async -> UNAuthorizationStatus
    func schedule(alert: RateAlert)
    func cancel(alertID: UUID)
    func checkAndFireDueAlerts() async
}

final class NotificationService: NSObject, NotificationServiceProtocol, UNUserNotificationCenterDelegate {
    static let shared = NotificationService()

    /// Routed by the app to deep-link a tapped notification to its alert
    /// (`sendrate://alert/<id>`, handled in-app rather than via URL scheme).
    var onAlertTapped: ((UUID) -> Void)?

    private let center = UNUserNotificationCenter.current()
    private let userInfoKey = "alertID"

    // MARK: Permission

    func requestPermission() async -> Bool {
        // Caller-gated (onboarding step 4 / Settings re-prompt). Never auto re-prompts.
        do {
            return try await center.requestAuthorization(options: [.alert, .sound, .badge])
        } catch {
            return false
        }
    }

    func authorizationStatus() async -> UNAuthorizationStatus {
        await center.notificationSettings().authorizationStatus
    }

    // MARK: Scheduling

    func schedule(alert: RateAlert) {
        // Catch an already-met threshold right away; ongoing firing is the foreground check.
        Task { await evaluate([alert]) }
    }

    func cancel(alertID: UUID) {
        let id = alertID.uuidString
        center.removePendingNotificationRequests(withIdentifiers: [id])
        center.removeDeliveredNotifications(withIdentifiers: [id])
    }

    func checkAndFireDueAlerts() async {
        let alerts = await PersistenceService.shared.alerts.list()
        await evaluate(alerts)
    }

    /// Fires a local notification for each enabled, not-yet-triggered alert whose condition
    /// is met against the latest EUR→PHP rate, then marks it triggered so it won't re-fire.
    private func evaluate(_ alerts: [RateAlert]) async {
        let pending = alerts.filter { $0.isEnabled && $0.triggeredAt == nil }
        guard !pending.isEmpty else { return }

        let profile = await PersistenceService.shared.profile.load()
        guard let rate = try? await ExchangeRateService.shared.getCurrentRate(
            from: profile.preferredSendCurrency,
            to: profile.preferredReceiveCurrency
        ) else { return }

        for alert in pending where isDue(alert, current: rate.rate) {
            await fire(alert, current: rate.rate)
            await PersistenceService.shared.alerts.setTriggered(id: alert.id, at: .now)
        }
    }

    private func isDue(_ alert: RateAlert, current: Double) -> Bool {
        switch alert.notifyType {
        case .rateAbove: return current >= alert.targetRate
        case .rateBelow: return current <= alert.targetRate
        case .providerCheapest:
            // RateAlert has no bound-provider field yet, so this can't be evaluated.
            // See docs/services/notifications.md + docs/architecture/data-model.md.
            return false
        }
    }

    private func fire(_ alert: RateAlert, current: Double) async {
        let content = UNMutableNotificationContent()
        content.title = "Rate alert"
        content.body = bodyText(for: alert, current: current)
        content.sound = .default
        content.userInfo = [userInfoKey: alert.id.uuidString]

        // nil trigger = deliver immediately.
        let request = UNNotificationRequest(identifier: alert.id.uuidString, content: content, trigger: nil)
        try? await center.add(request)
    }

    private func bodyText(for alert: RateAlert, current: Double) -> String {
        let target = String(format: "%.2f", alert.targetRate)
        let now = String(format: "%.2f", current)
        switch alert.notifyType {
        case .rateAbove: return "EUR/PHP is now ₱\(now) — at or above your ₱\(target) target."
        case .rateBelow: return "EUR/PHP is now ₱\(now) — at or below your ₱\(target) target."
        case .providerCheapest: return "Your provider is now the cheapest option."
        }
    }

    // MARK: UNUserNotificationCenterDelegate

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification) async
        -> UNNotificationPresentationOptions {
        [.banner, .sound]
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse) async {
        let raw = response.notification.request.content.userInfo[userInfoKey] as? String
        guard let raw, let id = UUID(uuidString: raw) else { return }
        await MainActor.run { onAlertTapped?(id) }
    }
}
