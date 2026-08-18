# Dailie Sky Application Architecture

## Purpose

This document defines the default architecture for Dailie Sky, an Expo and React Native application with a native iOS WidgetKit extension.

The goal is a predictable house architecture that developers and coding agents can understand, extend, test, and review without repeatedly making foundational decisions. Optimize for:

- predictable one-way data flow
- strong TypeScript types
- explicit state and workflow ownership
- testable calculations and services
- clear native-platform boundaries
- minimal hidden coupling
- abstractions justified by current requirements

These are defaults, not absolute rules. Deviations are allowed when requirements justify them, but they must be deliberate.

## Expo SDK 57 Is the Source of Truth

Expo has changed. Before writing Expo or React Native integration code, read the exact versioned documentation at:

https://docs.expo.dev/versions/v57.0.0/

This repository uses Expo SDK 57, React Native 0.86, and React 19.2. Do not rely on examples or APIs from other Expo SDK versions without verifying compatibility.

- Install Expo-compatible native packages with `npx expo install`.
- Check SDK 57 documentation before changing permissions, configuration plugins, native modules, or application lifecycle behavior.
- Preserve compatibility with the versions declared in `package.json`.
- Do not add a library when the Expo SDK or React Native already provides the required capability.

## 1. Unified Mental Model

The application follows this default flow:

```text
USER OR SYSTEM INTENT
        ↓
SCREEN / WORKFLOW ORCHESTRATION
        ↓
TYPED SERVICE OR PURE CALCULATION
        ↓
OUTCOME
        ↓
SCREEN-OWNED STATE
        ↓
DERIVED PRESENTATION
        ↓
COMPONENTS
        ↓
SEMANTIC CALLBACK
        └──────────────→ SCREEN / WORKFLOW ORCHESTRATION
```

For the current application:

```text
App opens or user requests refresh
        ↓
Daily Sky screen starts loading
        ↓
Location service requests permission and resolves coordinates
        ↓
Daily Sky service invokes astronomy and Kural services
        ↓
Screen receives a typed snapshot or error
        ↓
Presentational components render props
```

Each layer should have one primary responsibility. The code should make these questions easy to answer:

- Who owns the current state?
- What did the user or operating system request?
- Which service performs the work?
- Is a function pure, or does it access a device or storage boundary?
- Why is the UI loading, ready, degraded, or unavailable?
- Can the calculation and presentation be tested without device access?
- Which data crosses between React Native and WidgetKit?

## 2. Project Structure

Use a simple structure appropriate to the current single-screen application:

```text
src/
  services/
    astronomy/
      astronomy.service.ts
      astronomy.types.ts
    location/
      location.service.ts
      location.types.ts
    kural/
      kural.service.ts
      kural.types.ts
    daily-sky/
      daily-sky.service.ts
      daily-sky.types.ts

  screens/
    DailySkyScreen.tsx

  components/
    DailySkyView.tsx
    Metric.tsx
    KuralCard.tsx

  widget/
    widget-snapshot.ts
    widget-storage.service.ts

ios-widget/
  DailieWidget.swift
  Models/
  Providers/
  Views/
```

This is the intended direction, not a requirement to create empty files or folders immediately. Introduce a directory when the code it owns exists.

When a domain becomes large, it may contain further subdivisions such as `calculations`, `fixtures`, or `components`. Do not create layers solely for architectural symmetry.

### Ownership by folder

- `src/services`: typed calculation, device-access, storage, and workflow modules.
- `src/screens`: React components that own view lifecycle state and orchestrate services.
- `src/components`: reusable or screen-specific presentational React components.
- `src/widget`: the React Native side of the WidgetKit data contract and App Group storage bridge.
- `ios-widget`: the native SwiftUI WidgetKit extension.

Keep `App.tsx` small. Until navigation exists, it may render `DailySkyScreen` directly. Do not introduce a router solely to satisfy the folder structure.

## 3. Services Are Typed and Stateless

A service is a TypeScript module that calculates, obtains, transforms, stores, or coordinates data. A service does not imply an HTTP API and does not need to be a class.

Prefer exported functions:

```ts
export async function resolveCurrentLocation(): Promise<ResolvedLocation> {
  // Device integration and fallback policy.
}
```

Services must not act as hidden mutable stores. Do not keep application state in module-level variables or mutable singleton instances unless a platform API explicitly requires that lifecycle.

Prefer:

```text
Screen owns state
    ↓ calls
Stateless service
    ↓ returns
Typed result
```

Avoid:

```text
Component mutates singleton
    ↓
Singleton silently holds UI data
    ↓
Components require a custom subscription mechanism
```

Separate pure work from side effects where practical:

- Astronomy calculations should be deterministic for the same date and coordinates.
- Kural selection should be deterministic for the same date and dataset.
- Location permission, geolocation, reverse geocoding, App Group writes, and clock access are external boundaries.
- Workflow services may coordinate pure services and external boundaries but should return one explicit typed result.

Do not introduce dependency injection infrastructure for a small number of functions. Tests can pass dependencies as parameters when replacement is needed.

## 4. Strong Types and Data Contracts

Every service result, component prop, callback payload, persisted record, and native bridge payload must have a known TypeScript type.

- Do not use `any` for application data.
- Use `unknown` at untrusted boundaries and validate or narrow it.
- Prefer domain unions over unrestricted strings when the possible values are known.
- Keep domain types near the service or feature that owns them.
- Export a type only when another module needs it.
- Do not create multiple interfaces for the same data merely because it crossed a component boundary.

Create a separate presentation model only when it has a real semantic difference from the calculation, storage, or native-contract representation.

Dates may remain `Date` objects inside TypeScript calculations. Dates crossing JSON or native-storage boundaries must use an explicitly documented string or numeric representation, normally ISO 8601 strings.

## 5. State Ownership

Local React state is the default for the current application. The screen that starts a workflow owns its lifecycle state.

Prefer an explicit state model when several fields describe one lifecycle:

```ts
type DailySkyViewState =
  | { status: 'loading' }
  | { status: 'ready'; snapshot: DailySkySnapshot }
  | { status: 'error'; message: string; previous?: DailySkySnapshot };
```

This prevents contradictory combinations such as `loading: true` alongside an unrelated stale error.

State that exists only for an immediate interaction remains local to the nearest component. Examples include:

- pressed or focused state
- temporary menu visibility
- animation progress
- ordinary in-progress form edits
- transient disclosure state

Do not introduce Redux Toolkit, thunks, Zustand, or another global state library for the current single-screen workflow. Introduce shared state management only when concrete requirements emerge, such as:

- multiple independent screens need the same live state
- state must outlive its natural component owner
- several workflows coordinate through shared business events
- complex updates require traceable reducers and selectors
- local ownership creates demonstrated duplication or inconsistency

If Redux Toolkit is adopted later, services remain independent of Redux. Thunks, listener middleware, or other workflows may call services, but services must not dispatch actions or import the store.

## 6. Screens Are Orchestration Boundaries

A screen is the primary boundary between application workflows and presentation. A screen may:

- own loading, ready, degraded, permission, and error state
- start work in response to mount, focus, lifecycle changes, or user intent
- call workflow services
- derive screen-level presentation values
- pass typed data into components
- receive semantic callbacks from descendants

Presentational components should not request location, read shared storage, or coordinate workflows. They receive data and callbacks through props.

Keep effect usage deliberate:

- Use `useEffect` to synchronize with an external system or lifecycle event.
- Do not create chains of effects that indirectly implement a business workflow.
- Put a multi-step operation in one named async workflow function or service.
- Handle cancellation or stale completion when a screen can unmount or a request can be superseded.
- Do not suppress hook dependency warnings to force desired behavior.

## 7. Component Communication

Use typed, readonly props and semantic callback names.

Prefer:

```ts
type DailySkyViewProps = Readonly<{
  snapshot: DailySkySnapshot;
  onRefreshRequested: () => void;
}>;
```

Prefer business or user intent:

- `onRefreshRequested`
- `onLocationPermissionRequested`
- `onSettingsOpened`

Avoid implementation or gesture-specific names when the meaning is known:

- `onButtonClicked`
- `onStateChanged`
- `onDataSet`

Explicit prop passing is the default. If values are repeatedly forwarded through components that do not read or transform them, reconsider the component hierarchy before introducing global context.

Do not create wrapper components that add no behavior, layout, semantic boundary, or test value.

## 8. Derivation Ownership

Store authoritative facts and derive presentation values rather than duplicating them.

Derive values as close as practical to where they are consumed:

- Pure domain derivation shared across callers belongs in a service or pure helper.
- Screen-level presentation derivation belongs in the screen.
- Component-specific visual derivation belongs in the consuming component.
- Use `useMemo` only when referential stability or meaningful computation cost requires it; it is not a default for every derived value.

Do not put derived values into state when they can be calculated from current props or state.

## 9. Location, Permissions, and Degraded Operation

Location is a device boundary and must be isolated in the location service.

The location workflow must explicitly represent:

- permission granted
- permission denied
- permission restricted or unavailable when distinguishable
- location lookup failure
- reverse-geocoding failure
- development or product fallback use

The current Toronto fallback is intentional degraded behavior. It must remain visible to the UI so the application does not imply that fallback calculations use the user's actual location.

- Request only the permissions needed by the feature.
- Keep permission copy synchronized with `app.json` and application behavior.
- Do not upload or persist precise location without an explicit product requirement.
- Avoid repeated permission prompts caused by rendering or effect loops.
- Treat location values and labels as user-sensitive data.

## 10. Astronomy and Calendar Accuracy

Astronomy and calendar calculations are domain logic, not component logic.

- Keep calculations deterministic and independently testable.
- Pass the date, latitude, and longitude explicitly.
- Document approximations next to their implementation.
- Do not present an approximation as authoritative data.
- Preserve `null` when an event does not occur for the supplied date and location.
- Test high-latitude and missing-event cases where sunrise, sunset, moonrise, moonset, or Galactic Centre crossings may be absent.
- Use a consistent definition of the local day and timezone at calculation boundaries.

Tamil month boundaries are currently approximate. Before production, use an authoritative Tamil Panchangam calculation or source. The included Kural data is a sample; use a licensed or public-domain complete 1,330-Kural dataset before production.

## 11. Native Widget Architecture

The iOS widget is not a React Native screen or page. It is a separate WidgetKit extension running outside the React Native application process.

```text
REACT NATIVE CALCULATIONS / SETTINGS
        ↓
VERSIONED APP GROUP JSON SNAPSHOT
        ↓
SWIFT WIDGETKIT TIMELINE PROVIDER
        ↓
SWIFTUI WIDGET VIEW
```

The React Native side belongs under `src/widget`. It is responsible for:

- converting application data into a versioned serializable snapshot
- writing the snapshot through the App Group storage bridge
- requesting a WidgetKit timeline reload when appropriate

The native extension belongs under `ios-widget`. It is responsible for:

- reading the shared snapshot
- decoding and validating the supported schema version
- handling absent, invalid, or stale data
- creating WidgetKit timeline entries
- rendering the SwiftUI widget

The widget must not depend on the React Native JavaScript runtime being active. Do not attempt to import React Native services or components into WidgetKit.

### Widget snapshot contract

The shared payload must be JSON-compatible and explicitly versioned. A representative contract is:

```ts
type WidgetSnapshotV1 = {
  schemaVersion: 1;
  generatedAt: string;
  locationLabel: string;
  sunrise: string | null;
  sunset: string | null;
  moonrise: string | null;
  moonset: string | null;
  milkyWayRise: string | null;
  milkyWaySet: string | null;
  moonPhase: string;
  moonIllumination: number;
  nakshatra: string;
  tamilMonth: string;
  kural: {
    number: number;
    tamil: string;
    english: string;
  };
};
```

The actual TypeScript and Swift definitions must remain semantically aligned. A contract change must account for previously stored snapshots and installed older widget versions. Add or change fields compatibly where practical, and increment `schemaVersion` for incompatible changes.

WidgetKit controls refresh scheduling. Do not assume exact execution times or continuous background access. Timeline entries should include enough data to render safely until the next expected refresh.

## 12. Platform-Specific Code

Keep platform-specific behavior behind a typed boundary.

- Prefer Expo APIs when they satisfy the requirement.
- Use `.ios.ts`, `.android.ts`, or `.native.ts` files when implementations differ materially.
- Keep Swift and iOS extension code under the native widget boundary.
- Components should not be filled with repeated `Platform.OS` branches when a service or platform-specific module can express the difference clearly.
- Provide a safe unsupported-platform result when a feature exists only on iOS.

The iOS widget is the product target described by the repository. Do not create Android widget infrastructure unless requirements explicitly add it.

## 13. Persistence and Sensitive Data

Choose persistence according to the data:

- Component state for transient view state.
- App Group storage for the versioned widget snapshot.
- Ordinary application persistence only for settings that must survive launches.
- Secure storage for secrets or credentials if they are introduced later.

Do not treat module-level variables as persistence. Do not persist loading flags, transient errors, or incomplete workflows without an explicit recovery requirement.

Persist only the minimum location-derived information required by the product. Define freshness and migration behavior for persisted structures.

## 14. Accessibility and Native Presentation

React Native components must remain usable with native assistive technologies.

- Give interactive controls an appropriate `accessibilityRole`.
- Provide an accessible name when visible content is ambiguous, symbolic, or icon-only.
- Keep touch targets comfortably usable.
- Do not communicate meaning by color alone.
- Support dynamic content and longer localized strings without assuming fixed text dimensions.
- Account for safe areas, keyboard behavior, and differing phone and tablet sizes.
- Use stable keys derived from domain identity for lists.
- Use virtualized list components for data sets large enough to require them.

## 15. Errors and Logging

Do not silently discard errors at service boundaries.

- Convert expected failures into typed or deliberately classified outcomes.
- Give the screen enough information to display the correct degraded or retry state.
- Do not expose raw native or third-party error messages directly to users.
- Preserve useful diagnostic context in development logging without logging precise location or other sensitive data.
- Empty `catch` blocks are not acceptable.

Fallback behavior and errors are different facts. If fallback succeeds, the UI should still be able to explain that fallback data is being shown.

## 16. Testing Strategy

The architecture must allow calculations and presentation to be tested without live location access or a running widget extension.

### Pure unit tests

Test astronomy, calendar, Kural selection, serialization, and parsing as deterministic functions. Important cases include:

- known dates and coordinates
- timezone and local-day boundaries
- absent rise or set events
- moon phase boundaries
- Tamil month boundary approximations
- widget snapshot compatibility

### Service tests

Inject or mock device boundaries such as location, reverse geocoding, the clock, and App Group storage. Cover:

- granted permission
- denied permission
- lookup failure
- reverse-geocoding failure
- fallback behavior
- stale or superseded results where applicable

### Component and screen tests

Use React Native Testing Library when component tests are introduced. Test observable behavior through rendered text, accessibility semantics, and user interactions rather than implementation details.

Components should accept typed fixture data and semantic callbacks without requiring device access.

### End-to-end tests

Use a native-capable framework such as Maestro or Detox when native end-to-end coverage becomes necessary. Playwright is appropriate only for the Expo web target; it does not replace native iOS behavior or WidgetKit testing.

For test element identification, prefer:

```text
Accessibility role/name
        >
Visible user-facing semantics
        >
Stable testID based on application meaning
        >
Scoped index only when order itself is under test
```

Avoid selectors coupled to component nesting or visual layout.

## 17. Dependencies and Abstractions

Prefer the simplest structure that preserves the boundaries in this document.

Introduce an abstraction when:

- the same behavior is genuinely repeated
- it enforces an important boundary
- it removes meaningful complexity
- the business concept deserves a name
- it makes an external dependency replaceable in tests

Do not introduce an abstraction because it might theoretically be reused later.

Before adding a dependency:

- verify compatibility with Expo SDK 57
- determine whether Expo or React Native already provides the capability
- consider native configuration, build, and maintenance costs
- confirm that the current requirement cannot be met clearly with existing code

## 18. Future API and State Evolution

The application does not currently require backend API architecture or global state management. Do not prebuild either system.

If a backend is added later:

- put typed clients behind services
- keep transport details out of screens and components
- treat generated OpenAPI contracts as external data contracts when generation is available
- keep loading, error, polling, and presentation state outside generated DTOs
- use typed mock factories for significant responses

If shared state management is added later:

- retain screen and service boundaries
- keep reducers pure
- use selectors for shared domain derivation
- describe actions as meaningful intent or outcomes
- keep ordinary component interaction state local
- choose async concurrency and cancellation deliberately

Redux Toolkit is a reasonable future choice because it supports slices, reducers, selectors, thunks, and listener middleware, but it is not part of the current default architecture.

## 19. Architecture Summary

The current default is:

```text
CONTRACT
What shape does data have?
→ TypeScript domain types and versioned widget snapshots

STATE
What does the current view know?
→ Screen-owned React state

INTENT
What does the user or system want?
→ Semantic callbacks and lifecycle events

WORKFLOW
How does work happen?
→ Named stateless services and explicit async functions

PRESENTATION
How is the result displayed?
→ Typed React Native components

NATIVE WIDGET
How does data reach the home-screen widget?
→ App Group JSON snapshot → WidgetKit timeline → SwiftUI
```

When uncertain, optimize for predictable data flow, strong typing, explicit ownership, testability, accurate platform boundaries, and consistency with the surrounding application.
