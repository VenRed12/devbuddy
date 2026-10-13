import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { upgradeContent, LATEST_SCHEMA_VERSION } from "../src/modules/catalog/migrations/upgradeContent";

export async function runContentMigrate(options: {
  contentDir?: string;
  targetVersion?: number;
} = {}) {
  const contentDir = options.contentDir ?? path.resolve(process.cwd(), "content");
  const targetVersion = options.targetVersion ?? LATEST_SCHEMA_VERSION;
  const subdirs = ["skills", "skill-edges", "roles", "requirements", "transitions", "projects"];

  let migratedCount = 0;

  for (const sub of subdirs) {
    const dirPath = path.join(contentDir, sub);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const raw = YAML.parse(fs.readFileSync(filePath, "utf8"));
      const currentVersion = typeof raw["schema_version"] === "number" ? raw["schema_version"] : 1;

      if (currentVersion < targetVersion) {
        const upgraded = upgradeContent(sub, raw, targetVersion);
        fs.writeFileSync(filePath, YAML.stringify(upgraded), "utf8");
        migratedCount++;
        console.log(`Migrated ${sub}/${file} from v${currentVersion} to v${targetVersion}`);
      }
    }
  }

  console.log(`Migration complete: ${migratedCount} files updated to v${targetVersion}`);
  return { migratedCount };
}

if (process.argv[1]?.includes("content-migrate")) {
  runContentMigrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
}
