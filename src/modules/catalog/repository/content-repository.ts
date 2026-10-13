import type { ContentSnapshot } from "../domain/content-snapshot";

export interface ContentRepository {
  getSnapshot(): Promise<ContentSnapshot>;
}
