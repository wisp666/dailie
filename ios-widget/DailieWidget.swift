import WidgetKit
import SwiftUI

// Add this file to a new iOS Widget Extension target in Xcode on your Mac.
// The React Native app and extension should share data through an App Group.
struct DailieEntry: TimelineEntry { let date: Date; let sunrise: String; let sunset: String; let moonPhase: String; let kural: String }

struct DailieProvider: TimelineProvider {
    func placeholder(in context: Context) -> DailieEntry { sample() }
    func getSnapshot(in context: Context, completion: @escaping (DailieEntry) -> Void) { completion(sample()) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<DailieEntry>) -> Void) {
        // Replace sample() with values decoded from UserDefaults(suiteName: "group.com.dailie.sky").
        completion(Timeline(entries: [sample()], policy: .after(Calendar.current.date(byAdding: .minute, value: 30, to: .now)!)))
    }
    private func sample() -> DailieEntry { DailieEntry(date: .now, sunrise: "6:42 AM", sunset: "8:16 PM", moonPhase: "Waxing gibbous · 74%", kural: "அகர முதல எழுத்தெல்லாம்…") }
}

struct DailieWidgetView: View {
    var entry: DailieProvider.Entry
    var body: some View {
        ZStack {
            LinearGradient(colors: [.init(red: 0.04, green: 0.06, blue: 0.15), .init(red: 0.20, green: 0.11, blue: 0.27)], startPoint: .topLeading, endPoint: .bottomTrailing)
            VStack(alignment: .leading, spacing: 10) {
                HStack { Text("DAILIE SKY").font(.caption.bold()).foregroundStyle(.orange); Spacer(); Text("🌔") }
                Text(entry.date, style: .date).font(.title3.bold())
                HStack { Label(entry.sunrise, systemImage: "sunrise.fill"); Spacer(); Label(entry.sunset, systemImage: "sunset.fill") }.font(.caption)
                Text(entry.moonPhase).font(.caption).foregroundStyle(.secondary)
                Divider().overlay(.white.opacity(0.2))
                Text(entry.kural).font(.caption).lineLimit(2)
            }.padding()
        }.containerBackground(for: .widget) { Color.clear }
    }
}

@main struct DailieWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "DailieWidget", provider: DailieProvider()) { DailieWidgetView(entry: $0) }
            .configurationDisplayName("Dailie Sky").description("Sun, Moon, Milky Way and a daily Thirukkural.")
            .supportedFamilies([.systemMedium, .systemLarge])
    }
}
