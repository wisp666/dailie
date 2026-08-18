# Dailie Sky

A React Native/Expo companion app for a large iPhone widget showing local Sun, Moon and Milky Way events, Tamil calendar context, and a daily Thirukkural.

## What works now

- A seven-day Toronto fixture with Sun, Moon and Milky Way rise/set times
- Seven daily Thirukkurals with Tamil and English text
- A selectable weekly strip and polished daily sky view
- Typed, screen-owned loading/error/ready state
- A versioned React Native-to-WidgetKit snapshot contract
- A split SwiftUI WidgetKit model, timeline provider and view in [`ios-widget`](./ios-widget)

The current week is intentionally dummy data. The existing astronomy helpers remain available for the next integration step. Tamil month boundaries are approximate and the project contains only seven sample Kurals. Before production, use authoritative astronomical and Tamil Panchangam calculations plus a licensed or public-domain complete 1,330-Kural dataset.

## Develop

```bash
npm install
npm start
```

Open the web preview with `w`, Android with `a`, or scan the QR code using Expo Go on a phone on the same network. iOS Simulator, Xcode, WidgetKit compilation, signing, and deployment require macOS.

```bash
npm run typecheck
npm run web
```

## Build the iPhone widget

Follow [`ios-widget/README.md`](./ios-widget/README.md) on the Mac. WidgetKit is native SwiftUI and cannot run the React Native JavaScript bundle as a widget. The intended architecture is:

`React Native calculations/settings → shared App Group JSON → SwiftUI WidgetKit timeline`

## Astronomy notes

Milky Way “rise” is not a single formal event because the galaxy spans the sky. This app tracks the Galactic Centre crossing the horizon. Visibility also depends on astronomical darkness, season, clouds, and light pollution.

## Privacy

Location is requested only while the app is in use. No location data is uploaded by this starter project.
