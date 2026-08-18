# Adding the iPhone widget on macOS

1. Run `npx expo prebuild --platform ios` on the Mac (commit first so generated changes are easy to review).
2. Open the generated `.xcworkspace` in Xcode and choose **File → New → Target → Widget Extension**.
3. Name it `DailieWidget`, deselect configuration intent, and use iOS 17 or later.
4. Replace Xcode's generated widget source and add `DailieWidget.swift`, `Models`, `Providers`, and `Views` from this folder to the widget target.
5. Add the App Group `group.com.dailie.sky` to both the app and widget targets.
6. Add an Expo native module implementing the `WidgetStorage` boundary in `src/widget/widget-storage.service.ts`. It must JSON-encode `WidgetSnapshotV1`, write it under `dailie.widget.snapshot` in the App Group defaults, and call `WidgetCenter.shared.reloadTimelines(ofKind: "DailieWidget")`.

The provider already decodes schema version 1 and selects today's entry from the seven-day snapshot. Until the bridge is implemented, it renders the matching built-in sample entry.

WidgetKit extensions do not execute React Native JavaScript in the background, so the extension is SwiftUI. The React Native app remains the calculation/settings interface.

Interactive widgets are feasible on iOS 17+: buttons and toggles invoke an `AppIntent`. Good first interactions are switching detail pages, marking a Kural as read, or refreshing cached location data. Arbitrary gestures and continuous animations are not supported.
