# Dailie Sky

A React Native/Expo companion app for a large iPhone widget showing local Sun, Moon and Milky Way events, Tamil calendar context, and a daily Thirukkural.

## What works now

- Foreground location permission with Toronto as a development fallback
- Sunrise, sunset, moonrise, moonset and Moon illumination via `suncalc`
- Nakshatra from the Moon's geocentric ecliptic longitude via `astronomy-engine`
- Galactic Centre rise/set approximation (the useful anchor for Milky Way visibility)
- A polished large-widget-style in-app preview
- A SwiftUI WidgetKit starter in [`ios-widget`](./ios-widget)

Tamil month boundaries are currently approximate and the project contains three sample Kurals. Before production, use an authoritative Tamil Panchangam calculation/source and a licensed or public-domain complete 1,330-Kural dataset.

## Develop on Linux

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
