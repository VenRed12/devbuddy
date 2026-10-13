import path from "node:path";
import { FileContentRepository } from "../src/modules/catalog/repository/file-content-repository";
import { getDb } from "../src/platform/db/client";
import { env } from "../src/platform/env";
import {
  skills as skillsTable,
  roles as rolesTable,
  skillEdges as skillEdgesTable,
  roleSkillRequirements as roleSkillRequirementsTable,
  transitionPaths as transitionPathsTable,
  projects as projectsTable,
  contentVersions as contentVersionsTable,
} from "../src/modules/catalog/schema";
import { eq, inArray, notInArray } from "drizzle-orm";

export async function runContentSeed(options: { contentDir?: string; dryRun?: boolean } = {}) {
  const contentDir = options.contentDir ?? path.resolve(process.cwd(), "content");
  const repo = new FileContentRepository(contentDir);
  const data = repo.loadRawEntities();
  const hash = repo.computeContentHash();

  const manifest = {
    skills: data.skills.map((s) => s.slug),
    roles: data.roles.map((r) => r.slug),
    transitions: data.transitions.map((t) => t.slug),
    projects: data.projects.map((p) => p.slug),
  };

  console.log(`Content seed: hash=${hash.slice(0, 8)}... (${data.skills.length} skills, ${data.roles.length} roles, ${data.projects.length} projects)`);

  if (options.dryRun || !env.DATABASE_URL) {
    console.log("No DATABASE_URL configured or dryRun=true; skipping database writes.");
    return {
      hash,
      manifest,
      seeded: false,
    };
  }

  const db = getDb();

  // 1. Upsert skills
  for (const s of data.skills) {
    const existing = await db
      .select()
      .from(skillsTable)
      .where(eq(skillsTable.slug, s.slug))
      .limit(1);

    if (existing[0]) {
      await db
        .update(skillsTable)
        .set({
          name: s.name,
          category: s.category,
          tags: s.tags,
          baseHours: s.base_hours,
          fundamental: s.fundamental,
          description: s.description,
          status: s.status,
          aliases: s.aliases,
          lastReviewedAt: s.last_reviewed_at,
        })
        .where(eq(skillsTable.id, existing[0].id));
    } else {
      await db.insert(skillsTable).values({
        slug: s.slug,
        aliases: s.aliases,
        name: s.name,
        category: s.category,
        tags: s.tags,
        baseHours: s.base_hours,
        fundamental: s.fundamental,
        description: s.description,
        status: s.status,
        lastReviewedAt: s.last_reviewed_at,
      });
    }
  }

  // Mark retired skills (not in content)
  if (manifest.skills.length > 0) {
    await db
      .update(skillsTable)
      .set({ status: "retired" })
      .where(notInArray(skillsTable.slug, manifest.skills));
  }

  // 2. Upsert roles
  for (const r of data.roles) {
    const existing = await db
      .select()
      .from(rolesTable)
      .where(eq(rolesTable.slug, r.slug))
      .limit(1);

    if (existing[0]) {
      await db
        .update(rolesTable)
        .set({
          name: r.name,
          kind: r.kind,
          isCurrentRole: r.is_current_role,
          isTargetRole: r.is_target_role,
          status: r.status,
          aliases: r.aliases,
        })
        .where(eq(rolesTable.id, existing[0].id));
    } else {
      await db.insert(rolesTable).values({
        slug: r.slug,
        aliases: r.aliases,
        name: r.name,
        kind: r.kind,
        isCurrentRole: r.is_current_role,
        isTargetRole: r.is_target_role,
        status: r.status,
      });
    }
  }

  // Map skill and role slugs to IDs
  const allDbSkills = await db.select().from(skillsTable);
  const skillSlugToId = new Map(allDbSkills.map((s) => [s.slug, s.id]));

  const allDbRoles = await db.select().from(rolesTable);
  const roleSlugToId = new Map(allDbRoles.map((r) => [r.slug, r.id]));

  // 3. Upsert skill edges
  for (const edge of data.edges) {
    const fromId = skillSlugToId.get(edge.from);
    const toId = skillSlugToId.get(edge.to);
    if (!fromId || !toId) continue;

    const existing = await db
      .select()
      .from(skillEdgesTable)
      .where(
        eq(skillEdgesTable.fromSkillId, fromId),
      );

    const match = existing.find(
      (e) => e.toSkillId === toId && e.type === edge.type,
    );

    if (match) {
      await db
        .update(skillEdgesTable)
        .set({
          transferWeight: edge.transfer_weight,
          note: edge.note,
        })
        .where(eq(skillEdgesTable.id, match.id));
    } else {
      await db.insert(skillEdgesTable).values({
        fromSkillId: fromId,
        toSkillId: toId,
        type: edge.type,
        transferWeight: edge.transfer_weight,
        note: edge.note,
      });
    }
  }

  // 4. Upsert requirements
  for (const req of data.requirements) {
    const roleId = roleSlugToId.get(req.role);
    const skillId = skillSlugToId.get(req.skill);
    if (!roleId || !skillId) continue;

    const existing = await db
      .select()
      .from(roleSkillRequirementsTable)
      .where(eq(roleSkillRequirementsTable.roleId, roleId));

    const match = existing.find((r) => r.skillId === skillId);
    if (match) {
      await db
        .update(roleSkillRequirementsTable)
        .set({
          importance: req.importance,
          targetLevel: req.target_level,
          appliesToKind: req.applies_to_kind,
        })
        .where(eq(roleSkillRequirementsTable.roleId, roleId));
    } else {
      await db.insert(roleSkillRequirementsTable).values({
        roleId,
        skillId,
        importance: req.importance,
        targetLevel: req.target_level,
        appliesToKind: req.applies_to_kind,
      });
    }
  }

  // 5. Upsert transitions
  for (const tr of data.transitions) {
    const fromRoleId = roleSlugToId.get(tr.from_role);
    const toRoleId = roleSlugToId.get(tr.to_role);
    if (!fromRoleId || !toRoleId) continue;

    const existing = await db
      .select()
      .from(transitionPathsTable)
      .where(eq(transitionPathsTable.slug, tr.slug))
      .limit(1);

    if (existing[0]) {
      await db
        .update(transitionPathsTable)
        .set({
          fromRoleId,
          toRoleId,
          status: tr.status,
          title: tr.title,
          summary: tr.summary,
          overrides: tr.overrides,
          faqs: tr.faqs,
        })
        .where(eq(transitionPathsTable.id, existing[0].id));
    } else {
      await db.insert(transitionPathsTable).values({
        slug: tr.slug,
        aliases: tr.aliases,
        fromRoleId,
        toRoleId,
        status: tr.status,
        title: tr.title,
        summary: tr.summary,
        overrides: tr.overrides,
        faqs: tr.faqs,
      });
    }
  }

  // 6. Upsert projects
  for (const p of data.projects) {
    const existing = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.slug, p.slug))
      .limit(1);

    if (existing[0]) {
      await db
        .update(projectsTable)
        .set({
          name: p.name,
          mode: p.mode,
          resourceUrl: p.resource_url,
          difficulty: p.difficulty,
          estHours: p.est_hours,
          tags: p.tags,
          requiresSkills: p.requires_skills,
          requiresProjects: p.requires_projects,
          access: p.access,
          rubric: p.rubric,
          verification: p.verification,
          status: p.status,
          aliases: p.aliases,
          lastReviewedAt: p.last_reviewed_at,
        })
        .where(eq(projectsTable.id, existing[0].id));
    } else {
      await db.insert(projectsTable).values({
        slug: p.slug,
        aliases: p.aliases,
        name: p.name,
        mode: p.mode,
        resourceUrl: p.resource_url,
        difficulty: p.difficulty,
        estHours: p.est_hours,
        tags: p.tags,
        requiresSkills: p.requires_skills,
        requiresProjects: p.requires_projects,
        access: p.access,
        rubric: p.rubric,
        verification: p.verification,
        status: p.status,
        lastReviewedAt: p.last_reviewed_at,
      });
    }
  }

  // 7. Record content version
  await db.insert(contentVersionsTable).values({
    hash,
    manifest,
  });

  console.log("Database successfully seeded and content_version recorded!");
  return { hash, manifest, seeded: true };
}

if (process.argv[1]?.includes("content-seed")) {
  runContentSeed().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
}
