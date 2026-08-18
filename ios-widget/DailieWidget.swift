import SwiftUI
import WidgetKit

@main
struct DailieWidget: Widget {
    let kind = "DailieWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DailySkyTimelineProvider()) { entry in
            DailySkyWidgetView(entry: entry)
        }
        .configurationDisplayName("Dailie Sky")
        .description("A seven-day view of the Sun, Moon, Milky Way and Thirukkural.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}
