import SwiftUI
import WidgetKit

struct DailySkyWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: DailySkyEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("DAILIE SKY")
                        .font(.caption2.bold())
                        .tracking(1.4)
                        .foregroundStyle(.orange)
                    Text(entry.locationLabel)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Text(entry.day.moonEmoji).font(.title)
            }

            HStack(alignment: .firstTextBaseline) {
                Text(entry.day.dayLabel).font(.title3.bold())
                Text(entry.day.dateLabel).font(.caption).foregroundStyle(.secondary)
                Spacer()
                Text("\(entry.day.moonIllumination)%").font(.caption.bold())
            }

            HStack(spacing: 14) {
                event("sunrise.fill", entry.day.sunrise, .yellow)
                event("sunset.fill", entry.day.sunset, .orange)
                event("moonrise.fill", entry.day.moonrise, .indigo)
            }

            if family == .systemLarge {
                HStack(spacing: 14) {
                    event("moonset.fill", entry.day.moonset, .purple)
                    event("sparkles", entry.day.milkyWayRise, .pink)
                    event("sparkle", entry.day.milkyWaySet, .mint)
                }
                Text("\(entry.day.tamilMonth) · \(entry.day.nakshatra)")
                    .font(.caption.bold())
                    .foregroundStyle(.purple.opacity(0.85))
            }

            Divider().overlay(.white.opacity(0.14))
            Text("திருக்குறள் · \(entry.day.kuralNumber)")
                .font(.caption2.bold())
                .foregroundStyle(.orange)
            Text(entry.day.kuralTamil)
                .font(.caption)
                .lineLimit(family == .systemLarge ? 3 : 2)
        }
        .containerBackground(for: .widget) {
            LinearGradient(
                colors: [Color(red: 0.03, green: 0.05, blue: 0.14), Color(red: 0.18, green: 0.09, blue: 0.24)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }

    private func event(_ icon: String, _ time: String, _ color: Color) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon).foregroundStyle(color)
            Text(time).font(.caption2.bold())
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
