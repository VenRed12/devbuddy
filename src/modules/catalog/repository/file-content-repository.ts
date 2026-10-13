import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import YAML from "yaml";
import type { ContentRepository } from "./content-repository";
import type { ContentSnapshot } from "../domain/content-snapshot";
import { skillSchema, type Skill } from "../domain/skill";
import { skillEdgeSchema, type SkillEdge } from "../domain/skill-edge";
import { roleSchema, type Role } from "../domain/role";
import {
  roleSkillRequirementSchema,
  type RoleSkillRequirement,
} from "../domain/role-skill-requirement";
import {
  transitionPathSchema,
  type TransitionPath,
} from "../domain/transition-path";
import { projectSchema, type Project } from "../domain/project";
import { upgradeContent } from "../migrations/upgradeContent";

export class FileContentRepository implements ContentRepository {
  constructor(private contentDir: string = path.resolve(process.cwd(), "content")) {}

  private readYamlFiles(subDir: string): Array<{ filePath: string; raw: unknown }> {
    const dirPath = path.join(this.contentDir, subDir);
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const results: Array<{ filePath: string; raw: unknown }> = [];

    for (const entry of entries) {
      if (entry.isFile() && (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml"))) {
        const fullPath = path.join(dirPath, entry.name);
        const fileContent = fs.readFileSync(fullPath, "utf8");
        const parsed = YAML.parse(fileContent);
        results.push({ filePath: fullPath, raw: parsed });
      }
    }
    return results;
  }

  public computeContentHash(): string {
    const hash = crypto.createHash("sha256");
    if (!fs.existsSync(this.contentDir)) {
      return hash.digest("hex");
    }

    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      entries.sort((a, b) => a.name.localeCompare(b.name));
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile()) {
          hash.update(path.relative(this.contentDir, fullPath));
          hash.update(fs.readFileSync(fullPath));
        }
      }
    };

    scanDir(this.contentDir);
    return hash.digest("hex");
  }

  public loadRawEntities(): {
    skills: Skill[];
    edges: SkillEdge[];
    roles: Role[];
    requirements: RoleSkillRequirement[];
    transitions: TransitionPath[];
    projects: Project[];
  } {
    const skills = this.readYamlFiles("skills").map(({ raw }) => {
      const upgraded = upgradeContent("skills", raw as Record<string, unknown>);
      return skillSchema.parse(upgraded);
    });

    const edges = this.readYamlFiles("skill-edges").map(({ raw }) => {
      const upgraded = upgradeContent("skill-edges", raw as Record<string, unknown>);
      return skillEdgeSchema.parse(upgraded);
    });

    const roles = this.readYamlFiles("roles").map(({ raw }) => {
      const upgraded = upgradeContent("roles", raw as Record<string, unknown>);
      return roleSchema.parse(upgraded);
    });

    const requirements = this.readYamlFiles("requirements").map(({ raw }) => {
      const upgraded = upgradeContent("requirements", raw as Record<string, unknown>);
      return roleSkillRequirementSchema.parse(upgraded);
    });

    const transitions = this.readYamlFiles("transitions").map(({ raw }) => {
      const upgraded = upgradeContent("transitions", raw as Record<string, unknown>);
      return transitionPathSchema.parse(upgraded);
    });

    const projects = this.readYamlFiles("projects").map(({ raw }) => {
      const upgraded = upgradeContent("projects", raw as Record<string, unknown>);
      return projectSchema.parse(upgraded);
    });

    return {
      skills,
      edges,
      roles,
      requirements,
      transitions,
      projects,
    };
  }

  async getSnapshot(): Promise<ContentSnapshot> {
    const rawData = this.loadRawEntities();

    // Auto-create reverse edges for 'equivalent' type (Rule 8.3-3)
    const allEdges = [...rawData.edges];
    for (const edge of rawData.edges) {
      if (edge.type === "equivalent") {
        const reverseExists = allEdges.some(
          (e) => e.from === edge.to && e.to === edge.from && e.type === "equivalent",
        );
        if (!reverseExists) {
          allEdges.push({
            schema_version: edge.schema_version,
            from: edge.to,
            to: edge.from,
            type: "equivalent",
            transfer_weight: edge.transfer_weight,
            note: edge.note,
          });
        }
      }
    }

    const version = this.computeContentHash();

    const skillsMap = new Map<string, Skill>();
    for (const s of rawData.skills) {
      skillsMap.set(s.slug, s);
    }

    const rolesMap = new Map<string, Role>();
    for (const r of rawData.roles) {
      rolesMap.set(r.slug, r);
    }

    const reqsMap = new Map<string, RoleSkillRequirement[]>();
    for (const req of rawData.requirements) {
      const existing = reqsMap.get(req.role) ?? [];
      existing.push(req);
      reqsMap.set(req.role, existing);
    }

    const pathsMap = new Map<string, TransitionPath>();
    for (const p of rawData.transitions) {
      pathsMap.set(p.slug, p);
      pathsMap.set(`${p.from_role}->${p.to_role}`, p);
    }

    return {
      version,
      skills: skillsMap,
      edges: allEdges,
      roles: rolesMap,
      requirements: reqsMap,
      projects: rawData.projects,
      transitionPaths: pathsMap,
    };
  }
}
