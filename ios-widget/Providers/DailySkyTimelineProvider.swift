import Foundation
import WidgetKit

struct DailySkyTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> DailySkyEntry {
        sampleEntry()
    }

    func getSnapshot(in context: Context, completion: @escaping (DailySkyEntry) -> Void) {
        completion(loadEntry() ?? sampleEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<DailySkyEntry>) -> Void) {
        let entry = loadEntry() ?? sampleEntry()
        let nextMidnight = Calendar.current.startOfDay(for: Calendar.current.date(byAdding: .day, value: 1, to: .now) ?? .now)
        completion(Timeline(entries: [entry], policy: .after(nextMidnight)))
    }

    private func loadEntry() -> DailySkyEntry? {
        guard
            let defaults = UserDefaults(suiteName: dailieAppGroup),
            let json = defaults.string(forKey: dailieSnapshotKey),
            let data = json.data(using: .utf8),
            let snapshot = try? JSONDecoder().decode(WidgetSnapshot.self, from: data),
            snapshot.schemaVersion == 1,
            let day = dayForToday(in: snapshot.days) ?? snapshot.days.first
        else { return nil }

        return DailySkyEntry(date: .now, locationLabel: snapshot.locationLabel, day: day, isPlaceholder: false)
    }

    private func dayForToday(in days: [WidgetDaySnapshot]) -> WidgetDaySnapshot? {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd"
        return days.first { $0.dateKey == formatter.string(from: .now) }
    }

    private func sampleEntry() -> DailySkyEntry {
        DailySkyEntry(
            date: .now,
            locationLabel: "Toronto, Ontario",
            day: WidgetDaySnapshot(
                dateKey: "2026-08-16", dayLabel: "Sunday", dateLabel: "Aug 16",
                tamilMonth: "ஆவணி", nakshatra: "ரோகிணி", moonPhase: "Waxing Crescent",
                moonEmoji: "🌒", moonIllumination: 18, sunrise: "6:21 AM", sunset: "8:17 PM",
                moonrise: "9:54 AM", moonset: "10:11 PM", milkyWayRise: "4:42 PM",
                milkyWaySet: "2:51 AM", kuralNumber: 1,
                kuralTamil: "அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு.",
                kuralEnglish: "As the letter A is first among letters, the eternal is first in the world."
            ),
            isPlaceholder: true
        )
    }
}
