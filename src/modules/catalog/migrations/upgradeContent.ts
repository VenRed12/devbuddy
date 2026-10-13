import type { RegisteredUpgrader } from "./types";
import { v1ToV2Upgrader } from "./v1ToV2";

export const LATEST_SCHEMA_VERSION = 1;

const registeredUpgraders: RegisteredUpgrader[] = [
  {
    fromVersion: 1,
    toVersion: 2,
    upgrade: v1ToV2Upgrader,
  },
];

export function upgradeContent(
  entityType: string,
  raw: Record<string, unknown>,
  targetVersion: number = LATEST_SCHEMA_VERSION,
): Record<string, unknown> {
  let currentVersion = typeof raw["schema_version"] === "number" ? raw["schema_version"] : 1;
  let data = { ...raw };

  if (currentVersion === targetVersion) {
    return data;
  }

  while (currentVersion < targetVersion) {
    const upgrader = registeredUpgraders.find(
      (u) => u.fromVersion === currentVersion && u.toVersion === currentVersion + 1,
    );
    if (!upgrader) {
      throw new Error(
        `No migration path found for ${entityType} from schema_version ${currentVersion} to ${currentVersion + 1}`,
      );
    }
    data = upgrader.upgrade(entityType, data);
    currentVersion = upgrader.toVersion;
  }

  return data;
}
