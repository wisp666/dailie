import Foundation
import WidgetKit

let dailieAppGroup = "group.com.dailie.sky"
let dailieSnapshotKey = "dailie.widget.snapshot"

struct WidgetDaySnapshot: Codable, Hashable {
    let dateKey: String
    let dayLabel: String
    let dateLabel: String
    let tamilMonth: String
    let nakshatra: String
    let moonPhase: String
    let moonEmoji: String
    let moonIllumination: Int
    let sunrise: String
    let sunset: String
    let moonrise: String
    let moonset: String
    let milkyWayRise: String
    let milkyWaySet: String
    let kuralNumber: Int
    let kuralTamil: String
    let kuralEnglish: String
}

struct WidgetSnapshot: Codable {
    let schemaVersion: Int
    let generatedAt: String
    let locationLabel: String
    let days: [WidgetDaySnapshot]
}

struct DailySkyEntry: TimelineEntry {
    let date: Date
    let locationLabel: String
    let day: WidgetDaySnapshot
    let isPlaceholder: Bool
}
