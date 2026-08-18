import { weeklySkyFixture } from './daily-sky.fixture';
import type { WeeklySkySnapshot } from './daily-sky.types';

export async function loadWeeklySky(): Promise<WeeklySkySnapshot> {
  // Keep the async boundary so real location and calculation services can replace
  // this fixture without changing the screen contract.
  return weeklySkyFixture;
}
