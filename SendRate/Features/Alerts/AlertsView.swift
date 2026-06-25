import SwiftUI

struct AlertsView: View {
    @State private var viewModel = AlertsViewModel()
    @State private var showCreateAlert = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: SRSpacing.xxl) {
                headerSection
                createAlertButton
                activeAlertsSection
                triggeredAlertsSection
            }
            .padding(.bottom, SRSpacing.xxxxl)
        }
        .background(Color.brand.background)
        .sheet(isPresented: $showCreateAlert) {
            createAlertSheet
        }
    }
    
    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Alerts")
                    .font(SRTypography.title1)
                    .foregroundColor(Color.brand.textPrimary)
                Text("Get notified when rates change")
                    .font(SRTypography.caption)
                    .foregroundColor(Color.brand.textTertiary)
            }
            Spacer()
        }
        .padding(.horizontal, SRSpacing.screenPadding)
        .padding(.top, SRSpacing.lg)
    }
    
    private var createAlertButton: some View {
        Button {
            showCreateAlert = true
        } label: {
            HStack(spacing: SRSpacing.md) {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 20))
                    .foregroundColor(Color.brand.primary)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("Create Alert")
                        .font(SRTypography.subhead)
                        .fontWeight(.medium)
                        .foregroundColor(Color.brand.textPrimary)
                    Text("Get notified when rates hit your target")
                        .font(SRTypography.caption)
                        .foregroundColor(Color.brand.textTertiary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(Color.brand.textTertiary)
            }
            .padding(SRSpacing.lg)
            .background(Color.brand.surfaceElevated)
            .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous)
                    .stroke(Color.brand.primary.opacity(0.2), lineWidth: 0.5)
            )
        }
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private var activeAlertsSection: some View {
        VStack(alignment: .leading, spacing: SRSpacing.lg) {
            SRSectionHeader(title: "Active Alerts", subtitle: "\(viewModel.activeAlerts.count) active")
            
            if viewModel.activeAlerts.isEmpty {
                emptyStateCard(message: "No active alerts")
            } else {
                ForEach(viewModel.activeAlerts) { alert in
                    AlertRow(alert: alert, onToggle: {
                        viewModel.toggleAlert(alert)
                    }, onDelete: {
                        viewModel.deleteAlert(alert)
                    })
                }
            }
        }
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private var triggeredAlertsSection: some View {
        VStack(alignment: .leading, spacing: SRSpacing.lg) {
            SRSectionHeader(title: "Triggered", subtitle: "\(viewModel.triggeredAlerts.count)")
            
            if viewModel.triggeredAlerts.isEmpty {
                emptyStateCard(message: "No triggered alerts yet")
            } else {
                ForEach(viewModel.triggeredAlerts) { alert in
                    TriggeredAlertRow(alert: alert)
                }
            }
        }
        .padding(.horizontal, SRSpacing.screenPadding)
    }
    
    private func emptyStateCard(message: String) -> some View {
        HStack {
            Spacer()
            VStack(spacing: SRSpacing.sm) {
                Image(systemName: "bell.slash")
                    .font(.system(size: 24))
                    .foregroundColor(Color.brand.textTertiary)
                Text(message)
                    .font(SRTypography.subhead)
                    .foregroundColor(Color.brand.textTertiary)
            }
            .padding(SRSpacing.xxl)
            Spacer()
        }
        .background(Color.brand.surface)
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
    }
    
    private var createAlertSheet: some View {
        NavigationStack {
            VStack(spacing: SRSpacing.xxl) {
                VStack(spacing: SRSpacing.md) {
                    Text("EUR/PHP Rate")
                        .font(SRTypography.headline)
                        .foregroundColor(Color.brand.textPrimary)
                    
                    Text("Current rate: 63.50")
                        .font(SRTypography.subhead)
                        .foregroundColor(Color.brand.textSecondary)
                }
                
                VStack(spacing: SRSpacing.lg) {
                    SRPickerField(
                        title: "Alert Type",
                        selection: $viewModel.newAlertType,
                        options: RateAlert.AlertNotifyType.allCases.map { ($0, $0.rawValue) },
                        icon: "bell"
                    )
                    
                    SRNumberField(
                        title: "Target Rate",
                        value: $viewModel.newAlertRate,
                        prefix: "₱",
                        placeholder: "64.00"
                    )
                }
                
                Spacer()
                
                HStack(spacing: SRSpacing.md) {
                    SRPrimaryButton(title: "Cancel", action: { showCreateAlert = false }, style: .secondary)
                    SRPrimaryButton(title: "Create Alert", action: {
                        Task {
                            await viewModel.createAlert()
                            showCreateAlert = false
                        }
                    })
                }
            }
            .padding(SRSpacing.screenPadding)
            .background(Color.brand.background)
            .navigationBarHidden(true)
        }
    }
}

struct AlertRow: View {
    let alert: RateAlert
    let onToggle: () -> Void
    let onDelete: () -> Void
    
    var body: some View {
        HStack(spacing: SRSpacing.md) {
            Image(systemName: "bell.fill")
                .font(.system(size: 14))
                .foregroundColor(alert.isEnabled ? Color.brand.primary : Color.brand.textTertiary)
                .frame(width: 32, height: 32)
                .background(Color.brand.primary.opacity(alert.isEnabled ? 0.1 : 0.05))
                .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 2) {
                Text(alert.notifyType.rawValue)
                    .font(SRTypography.subhead)
                    .fontWeight(.medium)
                    .foregroundColor(Color.brand.textPrimary)
                
                Text("₱\(String(format: "%.2f", alert.targetRate))")
                    .font(SRTypography.number(16))
                    .foregroundColor(Color.brand.primary)
            }
            
            Spacer()
            
            Button {
                onToggle()
            } label: {
                Image(systemName: alert.isEnabled ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 22))
                    .foregroundColor(alert.isEnabled ? Color.brand.success : Color.brand.textTertiary)
            }
        }
        .padding(SRSpacing.lg)
        .background(Color.brand.surfaceElevated)
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
    }
}

struct TriggeredAlertRow: View {
    let alert: RateAlert
    
    var body: some View {
        HStack(spacing: SRSpacing.md) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 14))
                .foregroundColor(Color.brand.success)
                .frame(width: 32, height: 32)
                .background(Color.brand.success.opacity(0.1))
                .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 2) {
                Text(alert.notifyType.rawValue)
                    .font(SRTypography.subhead)
                    .fontWeight(.medium)
                    .foregroundColor(Color.brand.textPrimary)
                
                Text("Target: ₱\(String(format: "%.2f", alert.targetRate))")
                    .font(SRTypography.caption)
                    .foregroundColor(Color.brand.textSecondary)
            }
            
            Spacer()
            
            if let triggeredAt {
                Text(triggeredAt.formatted(.relative(presentation: .named)))
                    .font(SRTypography.caption2)
                    .foregroundColor(Color.brand.textTertiary)
            }
        }
        .padding(SRSpacing.lg)
        .background(Color.brand.surface)
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
    }
}

#Preview {
    AlertsView()
}
