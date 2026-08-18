import type { WidgetSnapshotV1 } from './widget-snapshot';

export type WidgetStorage = Readonly<{
  writeSnapshot: (snapshot: WidgetSnapshotV1) => Promise<void>;
  reloadTimelines: () => Promise<void>;
}>;

export async function publishWidgetSnapshot(snapshot: WidgetSnapshotV1, storage: WidgetStorage): Promise<void> {
  await storage.writeSnapshot(snapshot);
  await storage.reloadTimelines();
}

// The concrete implementation must be provided by an Expo native module that writes
// JSON to UserDefaults(suiteName: "group.com.dailie.sky") and reloads WidgetKit.
