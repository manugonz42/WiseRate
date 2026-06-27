import SwiftUI

struct SRNumberField: View {
    let title: String
    @Binding var value: String
    var prefix: String = "€"
    var suffix: String? = nil
    var placeholder: String = "0"
    var keyboardType: UIKeyboardType = .decimalPad
    var formatter: NumberFormatter? = nil
    
    var body: some View {
        VStack(alignment: .leading, spacing: SRSpacing.xs) {
            Text(title)
                .font(SRTypography.caption)
                .foregroundColor(Color.brand.textTertiary)
            
            HStack(spacing: SRSpacing.sm) {
                if !prefix.isEmpty {
                    Text(prefix)
                        .font(SRTypography.title3)
                        .foregroundColor(Color.brand.textSecondary)
                }
                
                TextField(placeholder, text: $value)
                    .font(SRTypography.number(28))
                    .foregroundColor(Color.brand.textPrimary)
                    .keyboardType(keyboardType)
                    .multilineTextAlignment(.leading)
                    .lineLimit(1)
                
                if let suffix {
                    Text(suffix)
                        .font(SRTypography.title3)
                        .foregroundColor(Color.brand.textSecondary)
                }
            }
        }
        .padding(SRSpacing.lg)
        .background(Color.brand.surfaceElevated)
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous)
                .stroke(Color.brand.border, lineWidth: 0.5)
        )
    }
}

struct SRSearchField: View {
    @Binding var text: String
    var placeholder: String = "Search..."
    var icon: String = "magnifyingglass"
    
    var body: some View {
        HStack(spacing: SRSpacing.sm) {
            Image(systemName: icon)
                .foregroundColor(Color.brand.textTertiary)
                .font(.system(size: 16))
            
            TextField(placeholder, text: $text)
                .font(SRTypography.body)
                .foregroundColor(Color.brand.textPrimary)
        }
        .padding(SRSpacing.md)
        .background(Color.brand.surfaceElevated)
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.buttonCornerRadius, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: SRSpacing.buttonCornerRadius, style: .continuous)
                .stroke(Color.brand.border, lineWidth: 0.5)
        )
    }
}

struct SRPickerField<T: Hashable>: View {
    let title: String
    @Binding var selection: T
    let options: [(T, String)]
    var icon: String? = nil
    
    var body: some View {
        VStack(alignment: .leading, spacing: SRSpacing.xs) {
            Text(title)
                .font(SRTypography.caption)
                .foregroundColor(Color.brand.textTertiary)
            
            HStack(spacing: SRSpacing.sm) {
                if let icon {
                    Image(systemName: icon)
                        .foregroundColor(Color.brand.primary)
                        .font(.system(size: 14))
                }
                
                Picker(title, selection: $selection) {
                    ForEach(options, id: \.0) { option in
                        Text(option.1).tag(option.0)
                    }
                }
                .pickerStyle(.menu)
                .tint(Color.brand.textPrimary)
                
                Spacer()
                
                Image(systemName: "chevron.down")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(Color.brand.textTertiary)
            }
        }
        .padding(SRSpacing.lg)
        .background(Color.brand.surfaceElevated)
        .clipShape(RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: SRSpacing.cardCornerRadius, style: .continuous)
                .stroke(Color.brand.border, lineWidth: 0.5)
        )
    }
}

struct SRSectionHeader: View {
    let title: String
    var subtitle: String? = nil
    var trailing: AnyView? = nil
    
    var body: some View {
        HStack(alignment: .bottom) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(SRTypography.headline)
                    .foregroundColor(Color.brand.textPrimary)
                
                if let subtitle {
                    Text(subtitle)
                        .font(SRTypography.caption)
                        .foregroundColor(Color.brand.textTertiary)
                }
            }
            
            Spacer()
            
            if let trailing {
                trailing
            }
        }
        .padding(.horizontal, SRSpacing.screenPadding)
    }
}

struct SRInfoRow: View {
    let label: String
    let value: String
    var labelColor: Color = Color.brand.textSecondary
    var valueColor: Color = Color.brand.textPrimary
    
    var body: some View {
        HStack {
            Text(label)
                .font(SRTypography.subhead)
                .foregroundColor(labelColor)
            Spacer()
            Text(value)
                .font(SRTypography.subhead)
                .fontWeight(.medium)
                .foregroundColor(valueColor)
        }
    }
}

struct SRStatView: View {
    let title: String
    let value: String
    var subtitle: String? = nil
    var color: Color = Color.brand.textPrimary
    
    var body: some View {
        VStack(alignment: .leading, spacing: SRSpacing.xs) {
            Text(title)
                .font(SRTypography.caption)
                .foregroundColor(Color.brand.textTertiary)
            
            Text(value)
                .font(SRTypography.number(22))
                .foregroundColor(color)
            
            if let subtitle {
                Text(subtitle)
                    .font(SRTypography.caption2)
                    .foregroundColor(Color.brand.textTertiary)
            }
        }
    }
}
