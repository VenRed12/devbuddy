import type { ContentRepository } from "./content-repository";
import type { ContentSnapshot } from "../domain/content-snapshot";
import type { Skill } from "../domain/skill";
import type { SkillEdge } from "../domain/skill-edge";
import type { Role } from "../domain/role";
import type { RoleSkillRequirement } from "../domain/role-skill-requirement";
import type { Project, ProjectAccess, ProjectVerification } from "../domain/project";
import type { TransitionPath, TransitionOverrides, Faq } from "../domain/transition-path";
import type { Status, RoleKind, EdgeType, Importance, Level, ProjectMode, ProjectDifficulty } from "../domain/types";
import { getDb } from "@/platform/db/client";
import {
  skills as skillsTable,
  skillEdges as skillEdgesTable,
  roles as rolesTable,
  roleSkillRequirements as roleSkillRequirementsTable,
  transitionPaths as transitionPathsTable,
  projects as projectsTable,
  contentVersions as contentVersionsTable,
} from "../schema";
import { desc } from "drizzle-orm";

export class DbContentRepository implements ContentRepository {
  private cachedSnapshot: ContentSnapshot | null = null;
  private cachedVersion: string | null = null;

  async getSnapshot(): Promise<ContentSnapshot> {
    const db = getDb();

    // 1. Fetch latest content version
    const latestVersionRows = await db
      .select()
      .from(contentVersionsTable)
      .orderBy(desc(contentVersionsTable.createdAt))
      .limit(1);

    const latestVersion = latestVersionRows[0]?.hash ?? "initial";

    // 2. Return cached snapshot if version hasn't changed
    if (this.cachedSnapshot && this.cachedVersion === latestVersion) {
      return this.cachedSnapshot;
    }

    // 3. Load from tables
    const dbSkills = await db.select().from(skillsTable);
    const dbRoles = await db.select().from(rolesTable);
    const dbEdges = await db.select().from(skillEdgesTable);
    const dbReqs = await db.select().from(roleSkillRequirementsTable);
    const dbTransitions = await db.select().from(transitionPathsTable);
    const dbProjects = await db.select().from(projectsTable);

    // Map skill ID to slug
    const skillIdToSlug = new Map<string, string>();
    const skillsMap = new Map<string, Skill>();
    for (const s of dbSkills) {
      skillIdToSlug.set(s.id, s.slug);
      skillsMap.set(s.slug, {
        schema_version: 1,
        slug: s.slug,
        aliases: s.aliases ?? [],
        name: s.name,
        category: s.category,
        tags: s.tags ?? [],
        base_hours: s.baseHours,
        fundamental: s.fundamental,
        description: s.description,
        status: s.status as Status,
        last_reviewed_at: s.lastReviewedAt,
        reviewed_by: "db-seeded",
      });
    }

    // Map role ID to slug
    const roleIdToSlug = new Map<string, string>();
    const rolesMap = new Map<string, Role>();
    for (const r of dbRoles) {
      roleIdToSlug.set(r.id, r.slug);
      rolesMap.set(r.slug, {
        schema_version: 1,
        slug: r.slug,
        aliases: r.aliases ?? [],
        name: r.name,
        kind: r.kind as RoleKind,
        is_current_role: r.isCurrentRole,
        is_target_role: r.isTargetRole,
        implied_skills: [],
        status: r.status as Status,
      });
    }

    const edges: SkillEdge[] = dbEdges
      .map((e) => {
        const fromSlug = skillIdToSlug.get(e.fromSkillId);
        const toSlug = skillIdToSlug.get(e.toSkillId);
        if (!fromSlug || !toSlug) return null;
        return {
          schema_version: 1,
          from: fromSlug,
          to: toSlug,
          type: e.type as EdgeType,
          transfer_weight: e.transferWeight,
          note: e.note,
        };
      })
      .filter((e): e is SkillEdge => e !== null);

    const reqsMap = new Map<string, RoleSkillRequirement[]>();
    for (const req of dbReqs) {
      const roleSlug = roleIdToSlug.get(req.roleId);
      const skillSlug = skillIdToSlug.get(req.skillId);
      if (!roleSlug || !skillSlug) continue;
      const list = reqsMap.get(roleSlug) ?? [];
      list.push({
        schema_version: 1,
        role: roleSlug,
        skill: skillSlug,
        importance: req.importance as Importance,
        target_level: req.targetLevel as Level,
        applies_to_kind: req.appliesToKind as RoleKind[],
      });
      reqsMap.set(roleSlug, list);
    }

    const pathsMap = new Map<string, TransitionPath>();
    for (const p of dbTransitions) {
      const fromRoleSlug = roleIdToSlug.get(p.fromRoleId);
      const toRoleSlug = roleIdToSlug.get(p.toRoleId);
      if (!fromRoleSlug || !toRoleSlug) continue;
      const pathData: TransitionPath = {
        schema_version: 1,
        slug: p.slug,
        aliases: p.aliases ?? [],
        from_role: fromRoleSlug,
        to_role: toRoleSlug,
        status: p.status as Status,
        title: p.title,
        summary: p.summary,
        overrides: p.overrides as TransitionOverrides,
        faqs: p.faqs as Faq[],
      };
      pathsMap.set(p.slug, pathData);
      pathsMap.set(`${fromRoleSlug}->${toRoleSlug}`, pathData);
    }

    const projects: Project[] = dbProjects.map((p) => ({
      schema_version: 1,
      slug: p.slug,
      aliases: p.aliases ?? [],
      name: p.name,
      mode: p.mode as ProjectMode,
      resource_url: p.resourceUrl,
      difficulty: p.difficulty as ProjectDifficulty,
      est_hours: p.estHours,
      tags: p.tags ?? [],
      requires_skills: (p.requiresSkills as string[]) ?? [],
      requires_projects: (p.requiresProjects as string[]) ?? [],
      access: p.access as ProjectAccess,
      rubric: (p.rubric as string[]) ?? [],
      verification: p.verification as ProjectVerification,
      status: p.status as Status,
      last_reviewed_at: p.lastReviewedAt,
      reviewed_by: "db-seeded",
      covers: [],
    }));

    const snapshot: ContentSnapshot = {
      version: latestVersion,
      skills: skillsMap,
      edges,
      roles: rolesMap,
      requirements: reqsMap,
      projects,
      transitionPaths: pathsMap,
    };

    this.cachedSnapshot = snapshot;
    this.cachedVersion = latestVersion;

    return snapshot;
  }
}
