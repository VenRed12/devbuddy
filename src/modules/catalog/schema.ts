import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    aliases: text("aliases").array().notNull().default([]),
    name: text("name").notNull(),
    category: text("category").notNull(),
    tags: text("tags").array().notNull().default([]),
    baseHours: integer("base_hours").notNull(),
    fundamental: boolean("fundamental").notNull().default(false),
    description: text("description").notNull(),
    status: text("status", { enum: ["draft", "published", "retired"] })
      .notNull()
      .default("draft"),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("skills_slug_idx").on(table.slug),
    index("skills_category_idx").on(table.category),
  ],
);

export const skillEdges = pgTable(
  "skill_edges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fromSkillId: uuid("from_skill_id")
      .notNull()
      .references(() => skills.id),
    toSkillId: uuid("to_skill_id")
      .notNull()
      .references(() => skills.id),
    type: text("type", {
      enum: ["upgrade_of", "bridge_to", "prerequisite_of", "equivalent"],
    }).notNull(),
    transferWeight: real("transfer_weight").notNull().default(0),
    note: text("note").notNull(),
  },
  (table) => [
    uniqueIndex("skill_edges_unique_idx").on(
      table.fromSkillId,
      table.toSkillId,
      table.type,
    ),
    index("skill_edges_from_idx").on(table.fromSkillId),
    index("skill_edges_to_idx").on(table.toSkillId),
  ],
);

export const roles = pgTable(
  "roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    aliases: text("aliases").array().notNull().default([]),
    name: text("name").notNull(),
    kind: text("kind", { enum: ["ic", "manager", "architect"] })
      .notNull()
      .default("ic"),
    isCurrentRole: boolean("is_current_role").notNull().default(false),
    isTargetRole: boolean("is_target_role").notNull().default(false),
    status: text("status", { enum: ["draft", "published", "retired"] })
      .notNull()
      .default("draft"),
  },
  (table) => [
    uniqueIndex("roles_slug_idx").on(table.slug),
    index("roles_kind_idx").on(table.kind),
  ],
);

export const roleImpliedSkills = pgTable(
  "role_implied_skills",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id),
    level: integer("level").notNull(),
  },
  (table) => [
    uniqueIndex("role_implied_skills_pk").on(table.roleId, table.skillId),
    index("role_implied_skills_role_idx").on(table.roleId),
    index("role_implied_skills_skill_idx").on(table.skillId),
  ],
);

export const roleSkillRequirements = pgTable(
  "role_skill_requirements",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id),
    importance: text("importance", { enum: ["core", "expected", "nice"] })
      .notNull()
      .default("expected"),
    targetLevel: integer("target_level").notNull(),
    appliesToKind: text("applies_to_kind").array().notNull().default(["ic"]),
  },
  (table) => [
    uniqueIndex("role_skill_requirements_pk").on(table.roleId, table.skillId),
    index("role_skill_requirements_role_idx").on(table.roleId),
    index("role_skill_requirements_skill_idx").on(table.skillId),
  ],
);

export const transitionPaths = pgTable(
  "transition_paths",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    aliases: text("aliases").array().notNull().default([]),
    fromRoleId: uuid("from_role_id")
      .notNull()
      .references(() => roles.id),
    toRoleId: uuid("to_role_id")
      .notNull()
      .references(() => roles.id),
    status: text("status", { enum: ["draft", "published", "retired"] })
      .notNull()
      .default("draft"),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    overrides: jsonb("overrides").notNull().default({}),
    faqs: jsonb("faqs").notNull().default([]),
  },
  (table) => [
    uniqueIndex("transition_paths_slug_idx").on(table.slug),
    index("transition_paths_from_idx").on(table.fromRoleId),
    index("transition_paths_to_idx").on(table.toRoleId),
  ],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    aliases: text("aliases").array().notNull().default([]),
    name: text("name").notNull(),
    mode: text("mode", { enum: ["guided", "external"] }).notNull(),
    resourceUrl: text("resource_url"),
    difficulty: text("difficulty").notNull(),
    estHours: integer("est_hours").notNull(),
    tags: text("tags").array().notNull().default([]),
    requiresSkills: jsonb("requires_skills").notNull().default([]),
    requiresProjects: jsonb("requires_projects").notNull().default([]),
    access: jsonb("access").notNull().default({}),
    rubric: jsonb("rubric").notNull().default([]),
    verification: jsonb("verification").notNull().default({}),
    guidedContentPath: text("guided_content_path"),
    status: text("status", { enum: ["draft", "published", "retired"] })
      .notNull()
      .default("draft"),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("projects_slug_idx").on(table.slug),
    index("projects_mode_idx").on(table.mode),
  ],
);

export const projectSkills = pgTable(
  "project_skills",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id),
    levelDemonstrated: integer("level_demonstrated").notNull(),
  },
  (table) => [
    uniqueIndex("project_skills_pk").on(table.projectId, table.skillId),
    index("project_skills_project_idx").on(table.projectId),
    index("project_skills_skill_idx").on(table.skillId),
  ],
);

export const resources = pgTable(
  "resources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id),
    title: text("title").notNull(),
    url: text("url").notNull(),
    kind: text("kind").notNull(),
    lastCheckStatus: text("last_check_status"),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
  },
  (table) => [
    index("resources_skill_idx").on(table.skillId),
  ],
);

export const contentVersions = pgTable(
  "content_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    hash: text("hash").notNull(),
    manifest: jsonb("manifest").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("content_versions_hash_idx").on(table.hash),
  ],
);
