export type ContentUpgrader = (
  entityType: string,
  data: Record<string, unknown>,
) => Record<string, unknown>;

export interface RegisteredUpgrader {
  fromVersion: number;
  toVersion: number;
  upgrade: ContentUpgrader;
}
