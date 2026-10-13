import type { ContentUpgrader } from "./types";

export const v1ToV2Upgrader: ContentUpgrader = (
  entityType: string,
  data: Record<string, unknown>,
): Record<string, unknown> => {
  const upgraded: Record<string, unknown> = { ...data, schema_version: 2 };

  // Standardize aliases if missing
  if (["skills", "roles", "projects", "transitions"].includes(entityType)) {
    if (!upgraded["aliases"]) {
      upgraded["aliases"] = [];
    }
  }

  // Ensure default reviewed_by
  if (!upgraded["reviewed_by"] && ["skills", "projects"].includes(entityType)) {
    upgraded["reviewed_by"] = "unreviewed";
  }

  return upgraded;
};
