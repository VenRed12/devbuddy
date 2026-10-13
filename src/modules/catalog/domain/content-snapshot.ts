import type { Skill } from "./skill";
import type { SkillEdge } from "./skill-edge";
import type { Role } from "./role";
import type { RoleSkillRequirement } from "./role-skill-requirement";
import type { Project } from "./project";
import type { TransitionPath } from "./transition-path";

export interface ContentSnapshot {
  version: string;
  skills: Map<string, Skill>;
  edges: SkillEdge[];
  roles: Map<string, Role>;
  requirements: Map<string, RoleSkillRequirement[]>;
  projects: Project[];
  transitionPaths: Map<string, TransitionPath>;
}
