import type { Skill } from "../domain/skill";
import type { SkillEdge } from "../domain/skill-edge";
import type { Role } from "../domain/role";
import type { RoleSkillRequirement } from "../domain/role-skill-requirement";
import type { Project } from "../domain/project";
import type { TransitionPath } from "../domain/transition-path";

export interface ValidationIssue {
  type: "error" | "warning";
  code: string;
  message: string;
  entityType?: string;
  slug?: string;
}

export interface ValidationOptions {
  previousManifest?: Record<string, string[]>; // entityType -> array of slugs
  isValidEntitlementKey?: (key: string) => boolean;
  validateCheckSpec?: (spec: unknown) => { valid: boolean; error?: string };
  getGuidedPhaseFiles?: (projectSlug: string) => string[];
  now?: Date;
}

export interface RawEntities {
  skills: Skill[];
  edges: SkillEdge[];
  roles: Role[];
  requirements: RoleSkillRequirement[];
  transitions: TransitionPath[];
  projects: Project[];
}

export function validateGraph(
  data: RawEntities,
  options: ValidationOptions = {},
): {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];
  const now = options.now ?? new Date();

  const addError = (
    code: string,
    message: string,
    entityType?: string,
    slug?: string,
  ) => {
    issues.push({ type: "error", code, message, entityType, slug });
  };

  const addWarning = (
    code: string,
    message: string,
    entityType?: string,
    slug?: string,
  ) => {
    issues.push({ type: "warning", code, message, entityType, slug });
  };

  // Maps for slug and alias resolution
  // entityType -> alias/slug -> canonical slug
  const slugResolvers = new Map<string, Map<string, string>>();

  function buildResolver(entityType: string, items: Array<{ slug: string; aliases: string[] }>) {
    const map = new Map<string, string>();
    for (const item of items) {
      if (map.has(item.slug)) {
        addError(
          "DUPLICATE_SLUG",
          `Duplicate slug "${item.slug}" in entity "${entityType}"`,
          entityType,
          item.slug,
        );
      }
      map.set(item.slug, item.slug);
      for (const alias of item.aliases) {
        if (map.has(alias)) {
          addError(
            "DUPLICATE_ALIAS",
            `Duplicate alias "${alias}" in entity "${entityType}" conflicts with slug or alias`,
            entityType,
            item.slug,
          );
        }
        map.set(alias, item.slug);
      }
    }
    slugResolvers.set(entityType, map);
  }

  // 1. Build resolvers
  buildResolver("skills", data.skills);
  buildResolver("roles", data.roles);
  buildResolver("transitions", data.transitions);
  buildResolver("projects", data.projects);

  const resolveSkill = (s: string) => slugResolvers.get("skills")?.get(s);
  const resolveRole = (r: string) => slugResolvers.get("roles")?.get(r);
  const resolveProject = (p: string) => slugResolvers.get("projects")?.get(p);

  const skillMap = new Map<string, Skill>();
  for (const s of data.skills) skillMap.set(s.slug, s);

  const roleMap = new Map<string, Role>();
  for (const r of data.roles) roleMap.set(r.slug, r);

  const projectMap = new Map<string, Project>();
  for (const p of data.projects) projectMap.set(p.slug, p);

  // 2. Validate Edge references and weights (Rule 1 & 3)
  for (const edge of data.edges) {
    const fromResolved = resolveSkill(edge.from);
    const toResolved = resolveSkill(edge.to);

    if (!fromResolved) {
      addError(
        "INVALID_EDGE_FROM",
        `Edge specifies unknown source skill "${edge.from}"`,
        "skill-edges",
      );
    }
    if (!toResolved) {
      addError(
        "INVALID_EDGE_TO",
        `Edge specifies unknown target skill "${edge.to}"`,
        "skill-edges",
      );
    }
    if (edge.transfer_weight < 0 || edge.transfer_weight > 1) {
      addError(
        "INVALID_TRANSFER_WEIGHT",
        `Edge from "${edge.from}" to "${edge.to}" has invalid transfer_weight ${edge.transfer_weight} (must be in [0, 1])`,
        "skill-edges",
      );
    }
  }

  // 3. Cycle Detection in prerequisite_of edges (Rule 2)
  const prereqGraph = new Map<string, string[]>();
  for (const edge of data.edges) {
    if (edge.type === "prerequisite_of") {
      const from = resolveSkill(edge.from) ?? edge.from;
      const to = resolveSkill(edge.to) ?? edge.to;
      const existing = prereqGraph.get(from) ?? [];
      existing.push(to);
      prereqGraph.set(from, existing);
    }
  }

  function detectCycle(
    node: string,
    adj: Map<string, string[]>,
    visited: Set<string>,
    recStack: Set<string>,
    cyclePath: string[],
  ): boolean {
    visited.add(node);
    recStack.add(node);
    cyclePath.push(node);

    for (const neighbor of adj.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        if (detectCycle(neighbor, adj, visited, recStack, cyclePath)) return true;
      } else if (recStack.has(neighbor)) {
        cyclePath.push(neighbor);
        return true;
      }
    }

    recStack.delete(node);
    cyclePath.pop();
    return false;
  }

  const visitedPrereqs = new Set<string>();
  for (const node of prereqGraph.keys()) {
    if (!visitedPrereqs.has(node)) {
      const cyclePath: string[] = [];
      if (detectCycle(node, prereqGraph, visitedPrereqs, new Set(), cyclePath)) {
        addError(
          "CYCLE_DETECTED_PREREQUISITE",
          `Cycle detected in prerequisite_of edges: ${cyclePath.join(" -> ")}`,
          "skill-edges",
        );
      }
    }
  }

  // Cycle Detection in requires_projects (Rule 2)
  const projectDepGraph = new Map<string, string[]>();
  for (const p of data.projects) {
    const deps = p.requires_projects.map((req) => resolveProject(req) ?? req);
    projectDepGraph.set(p.slug, deps);

    for (const req of p.requires_projects) {
      if (!resolveProject(req)) {
        addError(
          "UNKNOWN_REQUIRED_PROJECT",
          `Project "${p.slug}" requires unknown project "${req}"`,
          "projects",
          p.slug,
        );
      }
    }
  }

  const visitedProjects = new Set<string>();
  for (const node of projectDepGraph.keys()) {
    if (!visitedProjects.has(node)) {
      const cyclePath: string[] = [];
      if (detectCycle(node, projectDepGraph, visitedProjects, new Set(), cyclePath)) {
        addError(
          "CYCLE_DETECTED_PROJECT_REQUIRES",
          `Cycle detected in requires_projects: ${cyclePath.join(" -> ")}`,
          "projects",
        );
      }
    }
  }

  // 4. Validate Role Skill Requirements
  for (const req of data.requirements) {
    if (!resolveRole(req.role)) {
      addError(
        "INVALID_REQUIREMENT_ROLE",
        `Requirement references unknown role "${req.role}"`,
        "requirements",
      );
    }
    if (!resolveSkill(req.skill)) {
      addError(
        "INVALID_REQUIREMENT_SKILL",
        `Requirement references unknown skill "${req.skill}"`,
        "requirements",
      );
    }
  }

  // 5. Validate Transition Paths (Rule 4)
  for (const tp of data.transitions) {
    const fromRoleSlug = resolveRole(tp.from_role);
    const toRoleSlug = resolveRole(tp.to_role);

    if (!fromRoleSlug) {
      addError(
        "UNKNOWN_FROM_ROLE",
        `Transition path "${tp.slug}" references unknown from_role "${tp.from_role}"`,
        "transitions",
        tp.slug,
      );
    }
    if (!toRoleSlug) {
      addError(
        "UNKNOWN_TO_ROLE",
        `Transition path "${tp.slug}" references unknown to_role "${tp.to_role}"`,
        "transitions",
        tp.slug,
      );
    }

    if (tp.status === "published" && fromRoleSlug && toRoleSlug) {
      const fromRole = roleMap.get(fromRoleSlug);
      const toRole = roleMap.get(toRoleSlug);

      if (fromRole?.status !== "published") {
        addError(
          "UNPUBLISHED_FROM_ROLE",
          `Published transition "${tp.slug}" has unpublished from_role "${fromRoleSlug}"`,
          "transitions",
          tp.slug,
        );
      }
      if (toRole?.status !== "published") {
        addError(
          "UNPUBLISHED_TO_ROLE",
          `Published transition "${tp.slug}" has unpublished to_role "${toRoleSlug}"`,
          "transitions",
          tp.slug,
        );
      }

      const targetReqs = data.requirements.filter(
        (r) => resolveRole(r.role) === toRoleSlug,
      );
      if (targetReqs.length === 0) {
        addError(
          "NO_REQUIREMENTS_FOR_TARGET",
          `Published transition "${tp.slug}" target role "${toRoleSlug}" has no requirements`,
          "transitions",
          tp.slug,
        );
      }

      const coreReqs = targetReqs.filter((r) => r.importance === "core");
      let uncoveredCoreCount = 0;

      for (const coreReq of coreReqs) {
        const reqSkillSlug = resolveSkill(coreReq.skill);
        const hasCoveringProject = data.projects.some((p) =>
          p.covers.some(
            (c) =>
              resolveSkill(c.skill) === reqSkillSlug &&
              c.level >= coreReq.target_level,
          ),
        );
        if (!hasCoveringProject) {
          uncoveredCoreCount++;
          addWarning(
            "UNCOVERED_CORE_SKILL",
            `Published transition "${tp.slug}" has uncovered core skill "${coreReq.skill}"`,
            "transitions",
            tp.slug,
          );
        }
      }

      if (coreReqs.length > 0) {
        const uncoveredPercentage = uncoveredCoreCount / coreReqs.length;
        if (uncoveredPercentage > 0.2) {
          addError(
            "TOO_MANY_UNCOVERED_CORE_SKILLS",
            `Published transition "${tp.slug}" has ${Math.round(uncoveredPercentage * 100)}% uncovered core skills (>20% threshold)`,
            "transitions",
            tp.slug,
          );
        }
      }
    }
  }

  // 6. Validate Projects (Rule 5 & 7)
  for (const p of data.projects) {
    if (p.mode === "external") {
      if (!p.resource_url || p.resource_url.trim().length === 0) {
        addError(
          "MISSING_RESOURCE_URL",
          `External project "${p.slug}" must have a non-empty resource_url`,
          "projects",
          p.slug,
        );
      }
    } else if (p.mode === "guided") {
      if (options.getGuidedPhaseFiles) {
        const phaseFiles = options.getGuidedPhaseFiles(p.slug);
        if (!phaseFiles || phaseFiles.length === 0) {
          addError(
            "MISSING_GUIDED_PHASES",
            `Guided project "${p.slug}" has no Markdown phase files`,
            "projects",
            p.slug,
          );
        }
      }

      if (
        !p.access.entitlement_keys_any ||
        p.access.entitlement_keys_any.length === 0
      ) {
        addError(
          "MISSING_ENTITLEMENT_KEY",
          `Guided project "${p.slug}" must declare at least one access.entitlement_keys_any`,
          "projects",
          p.slug,
        );
      } else if (options.isValidEntitlementKey) {
        const hasValidKey = p.access.entitlement_keys_any.some((k) =>
          options.isValidEntitlementKey!(k),
        );
        if (!hasValidKey) {
          addError(
            "INVALID_ENTITLEMENT_KEY",
            `Guided project "${p.slug}" has entitlement keys [${p.access.entitlement_keys_any.join(", ")}] none of which match billing products`,
            "projects",
            p.slug,
          );
        }
      }
    }

    // Skill coverage validation
    for (const c of p.covers) {
      if (!resolveSkill(c.skill)) {
        addError(
          "UNKNOWN_COVERAGE_SKILL",
          `Project "${p.slug}" claims coverage for unknown skill "${c.skill}"`,
          "projects",
          p.slug,
        );
      }
    }

    // Requires skills validation
    for (const reqSkill of p.requires_skills) {
      if (!resolveSkill(reqSkill)) {
        addError(
          "UNKNOWN_REQUIRES_SKILL",
          `Project "${p.slug}" requires unknown skill "${reqSkill}"`,
          "projects",
          p.slug,
        );
      }
    }

    // Verification check validation (Rule 7)
    for (const check of p.verification.checks) {
      for (const d of check.demonstrates) {
        if (!resolveSkill(d.skill)) {
          addError(
            "CHECK_UNKNOWN_SKILL",
            `Verification check "${check.id}" in project "${p.slug}" references unknown skill "${d.skill}"`,
            "projects",
            p.slug,
          );
        }
      }

      if (options.validateCheckSpec) {
        const specResult = options.validateCheckSpec(check);
        if (!specResult.valid) {
          addError(
            "INVALID_CHECK_SPEC",
            `Verification check "${check.id}" in project "${p.slug}" failed validation: ${specResult.error}`,
            "projects",
            p.slug,
          );
        }
      }
    }
  }

  // 7. Check last_reviewed_at staleness (Rule 6)
  const maxAgeMs = 180 * 24 * 60 * 60 * 1000; // 180 days

  for (const s of data.skills) {
    if (now.getTime() - s.last_reviewed_at.getTime() > maxAgeMs) {
      addWarning(
        "STALE_REVIEW_DATE",
        `Skill "${s.slug}" last reviewed on ${s.last_reviewed_at.toISOString().split("T")[0]} (>180 days ago)`,
        "skills",
        s.slug,
      );
    }
  }

  for (const p of data.projects) {
    if (now.getTime() - p.last_reviewed_at.getTime() > maxAgeMs) {
      addWarning(
        "STALE_REVIEW_DATE",
        `Project "${p.slug}" last reviewed on ${p.last_reviewed_at.toISOString().split("T")[0]} (>180 days ago)`,
        "projects",
        p.slug,
      );
    }
  }

  // 8. Disappeared Slug Check (Rule 8)
  if (options.previousManifest) {
    const checkRetiredOrAliased = (
      entityType: string,
      currentMap: Map<string, { status: string; aliases: string[] }>,
    ) => {
      const prevSlugs = options.previousManifest![entityType] ?? [];
      for (const prevSlug of prevSlugs) {
        const current = currentMap.get(prevSlug);
        if (!current) {
          // Check if it appears in any aliases
          const isAliased = Array.from(currentMap.values()).some((item) =>
            item.aliases.includes(prevSlug),
          );
          if (!isAliased) {
            addError(
              "VANISHED_SLUG_NOT_RETIRED_OR_ALIASED",
              `Slug "${prevSlug}" disappeared in "${entityType}" without being marked retired or listed as an alias`,
              entityType,
              prevSlug,
            );
          }
        }
      }
    };

    checkRetiredOrAliased(
      "skills",
      skillMap as Map<string, { status: string; aliases: string[] }>,
    );
    checkRetiredOrAliased(
      "roles",
      roleMap as Map<string, { status: string; aliases: string[] }>,
    );
    const transitionEntries = Array.from(slugResolvers.get("transitions")?.keys() ?? []).map(
      (slug) => [slug, { status: "draft", aliases: [] as string[] }] as [string, { status: string; aliases: string[] }],
    );
    checkRetiredOrAliased(
      "transitions",
      new Map(transitionEntries),
    );
    checkRetiredOrAliased(
      "projects",
      projectMap as Map<string, { status: string; aliases: string[] }>,
    );
  }

  const errors = issues.filter((i) => i.type === "error");
  const warnings = issues.filter((i) => i.type === "warning");

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
