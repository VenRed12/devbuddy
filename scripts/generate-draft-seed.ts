import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const rootDir = process.cwd();
const contentDir = path.join(rootDir, "content");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeYaml(subDir: string, filename: string, data: unknown) {
  const dir = path.join(contentDir, subDir);
  ensureDir(dir);
  const filePath = path.join(dir, `${filename}.yaml`);
  fs.writeFileSync(filePath, YAML.stringify(data), "utf8");
}

function writeMd(projectSlug: string, filename: string, content: string) {
  const dir = path.join(contentDir, "projects-guided", projectSlug);
  ensureDir(dir);
  const filePath = path.join(dir, `${filename}.md`);
  fs.writeFileSync(filePath, content, "utf8");
}

// 1. Skills
const skills = [
  { slug: "java", name: "Java Programming", category: "languages", tags: ["java", "backend"], base_hours: 40, fundamental: true, description: "Core Java runtime and OOP." },
  { slug: "spring", name: "Spring Framework", category: "frameworks", tags: ["java", "spring"], base_hours: 30, fundamental: false, description: "Classic Spring dependency injection and MVC." },
  { slug: "spring-boot", name: "Spring Boot", category: "frameworks", tags: ["java", "microservices"], base_hours: 20, fundamental: false, description: "Opinionated Spring application framework." },
  { slug: "sql", name: "SQL & Relational Databases", category: "databases", tags: ["sql", "data"], base_hours: 25, fundamental: true, description: "Standard relational querying and indexing." },
  { slug: "postgresql", name: "PostgreSQL", category: "databases", tags: ["postgres", "sql"], base_hours: 20, fundamental: false, description: "Advanced open-source relational database." },
  { slug: "rest-apis", name: "RESTful API Design", category: "architecture", tags: ["api", "http"], base_hours: 20, fundamental: true, description: "HTTP REST API patterns and OpenAPI." },
  { slug: "jenkins", name: "Jenkins CI/CD", category: "devops", tags: ["ci-cd", "automation"], base_hours: 20, fundamental: false, description: "Jenkins declarative and scripted pipelines." },
  { slug: "github-actions", name: "GitHub Actions", category: "devops", tags: ["ci-cd", "cloud"], base_hours: 15, fundamental: false, description: "GitHub native CI/CD workflows." },
  { slug: "docker", name: "Docker Containers", category: "containers", tags: ["docker", "devops"], base_hours: 20, fundamental: false, description: "Container creation, multi-stage builds, and registries." },
  { slug: "kubernetes", name: "Kubernetes", category: "containers", tags: ["k8s", "cloud"], base_hours: 35, fundamental: false, description: "Container orchestration, services, and ingresses." },
  { slug: "aws-ec2", name: "AWS EC2", category: "cloud", tags: ["aws", "infrastructure"], base_hours: 15, fundamental: false, description: "Elastic compute cloud instances." },
  { slug: "aws-s3", name: "AWS S3", category: "cloud", tags: ["aws", "storage"], base_hours: 10, fundamental: false, description: "Simple storage service object store." },
  { slug: "aws-ecs", name: "AWS ECS", category: "cloud", tags: ["aws", "containers"], base_hours: 20, fundamental: false, description: "Elastic Container Service on AWS." },
  { slug: "aws-iam", name: "AWS IAM", category: "security", tags: ["aws", "security"], base_hours: 15, fundamental: false, description: "Identity and access management policies and roles." },
  { slug: "prometheus", name: "Prometheus Monitoring", category: "observability", tags: ["monitoring", "metrics"], base_hours: 15, fundamental: false, description: "Metrics collection and PromQL querying." },
  { slug: "grafana", name: "Grafana Dashboards", category: "observability", tags: ["dashboards", "metrics"], base_hours: 10, fundamental: false, description: "Visualisation dashboards and alert rules." },
  { slug: "llm-apis", name: "LLM API Integration", category: "ai", tags: ["ai", "llm"], base_hours: 15, fundamental: false, description: "Direct inference against modern LLM endpoints." },
  { slug: "prompt-engineering", name: "Prompt Engineering", category: "ai", tags: ["ai", "prompts"], base_hours: 12, fundamental: false, description: "Structured prompts, few-shot, and chain-of-thought." },
  { slug: "embeddings", name: "Text Embeddings", category: "ai", tags: ["ai", "vectors"], base_hours: 15, fundamental: false, description: "Dense semantic vector representations." },
  { slug: "rag", name: "Retrieval-Augmented Generation", category: "ai", tags: ["ai", "rag"], base_hours: 25, fundamental: false, description: "Context grounding using external document retrieval." },
  { slug: "vector-databases", name: "Vector Databases", category: "ai", tags: ["ai", "databases"], base_hours: 20, fundamental: false, description: "Vector indexing and similarity search engines." },
  { slug: "ai-evaluation", name: "AI & LLM Evaluation", category: "ai", tags: ["ai", "evaluation"], base_hours: 20, fundamental: false, description: "Model quality benchmarking and ground truth evals." },
  { slug: "test-automation", name: "Test Automation", category: "qa", tags: ["qa", "testing"], base_hours: 25, fundamental: false, description: "Automated end-to-end and integration suites." },
  { slug: "selenium", name: "Selenium WebDriver", category: "qa", tags: ["qa", "ui-testing"], base_hours: 20, fundamental: false, description: "Browser automation testing." },
  { slug: "unit-testing", name: "Unit Testing & TDD", category: "engineering", tags: ["testing", "quality"], base_hours: 15, fundamental: true, description: "Fast, isolated unit testing." },
  { slug: "system-design", name: "System Design", category: "architecture", tags: ["architecture", "leadership"], base_hours: 30, fundamental: true, description: "Distributed systems and resilience patterns." },
  { slug: "agile-delivery", name: "Agile Delivery Management", category: "management", tags: ["agile", "delivery"], base_hours: 20, fundamental: false, description: "Engineering iteration management." },
  { slug: "ai-strategy", name: "AI Product Strategy", category: "management", tags: ["ai", "strategy"], base_hours: 20, fundamental: false, description: "Executive AI assessment and ROI planning." },
  { slug: "cloud-cost-management", name: "Cloud Cost Optimization", category: "cloud", tags: ["finops", "cloud"], base_hours: 15, fundamental: false, description: "Cloud FinOps analysis and right-sizing." },
];

for (const s of skills) {
  writeYaml("skills", s.slug, {
    schema_version: 1,
    slug: s.slug,
    aliases: [],
    name: s.name,
    category: s.category,
    tags: s.tags,
    base_hours: s.base_hours,
    fundamental: s.fundamental,
    description: s.description,
    status: "draft",
    last_reviewed_at: "2026-10-01",
    reviewed_by: "seed-placeholder",
  });
}

// 2. Skill edges
const edges = [
  { from: "spring", to: "spring-boot", type: "upgrade_of", transfer_weight: 0.7, note: "Spring Boot builds directly on core Spring DI and MVC conventions." },
  { from: "jenkins", to: "github-actions", type: "bridge_to", transfer_weight: 0.6, note: "CI pipeline concepts transfer from Jenkins to GitHub Actions." },
  { from: "rest-apis", to: "llm-apis", type: "bridge_to", transfer_weight: 0.7, note: "Calling LLM endpoints relies on standard HTTP REST clients and error handling." },
  { from: "docker", to: "kubernetes", type: "prerequisite_of", transfer_weight: 0, note: "Containerisation with Docker is required before orchestrating with Kubernetes." },
  { from: "docker", to: "aws-ecs", type: "bridge_to", transfer_weight: 0.6, note: "Deploying on ECS builds directly on Docker containerization." },
  { from: "embeddings", to: "vector-databases", type: "prerequisite_of", transfer_weight: 0, note: "Understanding vector embeddings is required to index and query vector databases." },
  { from: "vector-databases", to: "rag", type: "bridge_to", transfer_weight: 0.5, note: "RAG utilizes vector databases for retrieval pipelines." },
  { from: "test-automation", to: "unit-testing", type: "equivalent", transfer_weight: 0.8, note: "Automated test structure shares identical assertions and lifecycle." },
  { from: "sql", to: "postgresql", type: "upgrade_of", transfer_weight: 0.8, note: "SQL foundations transfer directly to PostgreSQL dialect and features." },
  { from: "prometheus", to: "grafana", type: "bridge_to", transfer_weight: 0.5, note: "Prometheus metrics feed into Grafana dashboards." },
];

for (let i = 0; i < edges.length; i++) {
  const edge = edges[i]!;
  writeYaml("skill-edges", `edge-${edge.from}-to-${edge.to}`, {
    schema_version: 1,
    from: edge.from,
    to: edge.to,
    type: edge.type,
    transfer_weight: edge.transfer_weight,
    note: edge.note,
  });
}

// 3. Requirements
const requirements = [
  // Cloud Engineer
  { role: "cloud-engineer", skill: "docker", importance: "core", target_level: 4, applies_to_kind: ["ic"] },
  { role: "cloud-engineer", skill: "aws-ecs", importance: "core", target_level: 4, applies_to_kind: ["ic"] },
  { role: "cloud-engineer", skill: "github-actions", importance: "core", target_level: 3, applies_to_kind: ["ic"] },
  { role: "cloud-engineer", skill: "kubernetes", importance: "expected", target_level: 3, applies_to_kind: ["ic"] },
  { role: "cloud-engineer", skill: "aws-iam", importance: "expected", target_level: 3, applies_to_kind: ["ic"] },
  { role: "cloud-engineer", skill: "prometheus", importance: "nice", target_level: 3, applies_to_kind: ["ic"] },

  // AI Application Engineer
  { role: "ai-application-engineer", skill: "llm-apis", importance: "core", target_level: 3, applies_to_kind: ["ic"] },
  { role: "ai-application-engineer", skill: "rag", importance: "core", target_level: 3, applies_to_kind: ["ic"] },
  { role: "ai-application-engineer", skill: "vector-databases", importance: "core", target_level: 3, applies_to_kind: ["ic"] },
  { role: "ai-application-engineer", skill: "embeddings", importance: "expected", target_level: 3, applies_to_kind: ["ic"] },
  { role: "ai-application-engineer", skill: "prompt-engineering", importance: "expected", target_level: 3, applies_to_kind: ["ic"] },
  { role: "ai-application-engineer", skill: "ai-evaluation", importance: "nice", target_level: 2, applies_to_kind: ["ic"] },

  // DevOps Engineer
  { role: "devops-engineer", skill: "docker", importance: "core", target_level: 4, applies_to_kind: ["ic"] },
  { role: "devops-engineer", skill: "github-actions", importance: "core", target_level: 4, applies_to_kind: ["ic"] },
  { role: "devops-engineer", skill: "kubernetes", importance: "core", target_level: 4, applies_to_kind: ["ic"] },
  { role: "devops-engineer", skill: "prometheus", importance: "expected", target_level: 4, applies_to_kind: ["ic"] },
  { role: "devops-engineer", skill: "grafana", importance: "expected", target_level: 3, applies_to_kind: ["ic"] },

  // AI Engineering Manager
  { role: "ai-engineering-manager", skill: "ai-strategy", importance: "core", target_level: 2, applies_to_kind: ["manager"] },
  { role: "ai-engineering-manager", skill: "ai-evaluation", importance: "core", target_level: 2, applies_to_kind: ["manager"] },
  { role: "ai-engineering-manager", skill: "cloud-cost-management", importance: "expected", target_level: 2, applies_to_kind: ["manager"] },
  { role: "ai-engineering-manager", skill: "system-design", importance: "core", target_level: 3, applies_to_kind: ["manager"] },
];

for (const req of requirements) {
  writeYaml("requirements", `${req.role}-${req.skill}`, {
    schema_version: 1,
    role: req.role,
    skill: req.skill,
    importance: req.importance,
    target_level: req.target_level,
    applies_to_kind: req.applies_to_kind,
  });
}

// 4. Transitions
const transitions = [
  {
    slug: "java-backend-developer-to-cloud-engineer",
    from_role: "java-backend-developer",
    to_role: "cloud-engineer",
    title: "Java Backend Developer to Cloud Engineer",
    summary: "Keep your Java and API expertise; learn containers, cloud services and delivery pipelines.",
    overrides: {
      force_include_skills: [],
      force_exclude_skills: [],
      project_sequence: ["modernise-java-service", "containerise-and-deploy-aws"],
    },
    faqs: [
      { q: "Do I need to relearn Java?", a: "No. The plan treats Java, OOP, SQL and REST as skills you keep." },
    ],
  },
  {
    slug: "java-backend-developer-to-ai-application-engineer",
    from_role: "java-backend-developer",
    to_role: "ai-application-engineer",
    title: "Java Backend Developer to AI Application Engineer",
    summary: "Leverage backend architecture to build reliable RAG systems, embeddings pipelines, and LLM applications.",
    overrides: {
      force_include_skills: [],
      force_exclude_skills: [],
      project_sequence: ["rag-knowledge-assistant", "production-ai-service"],
    },
    faqs: [
      { q: "Is Python mandatory?", a: "No, backend API architectures apply directly to LLM service patterns." },
    ],
  },
  {
    slug: "engineering-manager-to-ai-engineering-manager",
    from_role: "engineering-manager",
    to_role: "ai-engineering-manager",
    title: "Engineering Manager to AI Engineering Manager",
    summary: "Lead high-performing AI engineering teams with calibrated evaluation, architecture, and cost strategies.",
    overrides: {
      force_include_skills: [],
      force_exclude_skills: [],
      project_sequence: ["ai-strategy-and-evaluation-playbook"],
    },
    faqs: [
      { q: "Do managers need to train models?", a: "No. You need architectural judgment and evaluation literacy." },
    ],
  },
];

for (const tr of transitions) {
  writeYaml("transitions", tr.slug, {
    schema_version: 1,
    slug: tr.slug,
    aliases: [],
    from_role: tr.from_role,
    to_role: tr.to_role,
    status: "draft",
    title: tr.title,
    summary: tr.summary,
    overrides: tr.overrides,
    faqs: tr.faqs,
  });
}

// 5. Projects
const projects = [
  {
    slug: "modernise-java-service",
    name: "Modernise a Java Service with Spring Boot and PostgreSQL",
    mode: "guided",
    resource_url: null,
    difficulty: "intermediate",
    est_hours: 10,
    tags: ["java", "spring-boot"],
    requires_skills: ["java"],
    requires_projects: [],
    access: {
      free_preview: true,
      entitlement_keys_any: ["track:java-backend-developer-to-cloud-engineer"],
    },
    covers: [
      { skill: "spring-boot", level: 3 },
      { skill: "postgresql", level: 3 },
    ],
    rubric: [
      "Does the application use Spring Boot auto-configuration?",
      "Are database connections pooled via HikariCP?",
    ],
    verification: {
      checks: [
        {
          id: "has-build-file",
          type: "file_exists",
          glob: "**/pom.xml",
          required: true,
          demonstrates: [{ skill: "spring-boot", level: 3 }],
        },
      ],
    },
    status: "draft",
    last_reviewed_at: "2026-10-01",
    reviewed_by: "seed-placeholder",
  },
  {
    slug: "containerise-and-deploy-aws",
    name: "Containerise and deploy a Spring Boot service on AWS",
    mode: "guided",
    resource_url: null,
    difficulty: "intermediate",
    est_hours: 12,
    tags: ["containers", "cloud"],
    requires_skills: ["spring-boot"],
    requires_projects: ["modernise-java-service"],
    access: {
      free_preview: true,
      entitlement_keys_any: ["track:java-backend-developer-to-cloud-engineer"],
    },
    covers: [
      { skill: "docker", level: 4 },
      { skill: "aws-ecs", level: 4 },
      { skill: "github-actions", level: 3 },
    ],
    rubric: [
      "Does the container run as a non-root user?",
      "Are secrets injected at runtime rather than baked into the image?",
      "Is there a health check endpoint used by the platform?",
    ],
    verification: {
      checks: [
        {
          id: "has-dockerfile",
          type: "file_exists",
          glob: "**/Dockerfile",
          required: true,
          demonstrates: [{ skill: "docker", level: 3 }],
        },
        {
          id: "has-ci",
          type: "file_exists",
          glob: ".github/workflows/*.y*ml",
          required: true,
          demonstrates: [{ skill: "github-actions", level: 3 }],
        },
        {
          id: "nonroot-container",
          type: "file_contains",
          glob: "**/Dockerfile",
          pattern: "^USER\\s+(?!root)",
          required: false,
          demonstrates: [{ skill: "docker", level: 4 }],
        },
        {
          id: "aws-deploy-config",
          type: "file_contains",
          glob: "**/*.{yml,yaml,tf,json}",
          pattern: "(aws_ecs_service|AWS::ECS::Service|aws-actions/)",
          required: true,
          demonstrates: [{ skill: "aws-ecs", level: 4 }],
        },
      ],
    },
    status: "draft",
    last_reviewed_at: "2026-10-01",
    reviewed_by: "seed-placeholder",
  },
  {
    slug: "rag-knowledge-assistant",
    name: "Build a Production RAG Assistant with Vector Search",
    mode: "guided",
    resource_url: null,
    difficulty: "intermediate",
    est_hours: 14,
    tags: ["ai", "rag"],
    requires_skills: ["rest-apis"],
    requires_projects: [],
    access: {
      free_preview: true,
      entitlement_keys_any: ["track:java-backend-developer-to-ai-application-engineer"],
    },
    covers: [
      { skill: "llm-apis", level: 3 },
      { skill: "rag", level: 3 },
      { skill: "vector-databases", level: 3 },
    ],
    rubric: [
      "Is contextual chunking implemented?",
      "Are embeddings queried through an approximate nearest neighbor index?",
    ],
    verification: {
      checks: [
        {
          id: "vector-dep",
          type: "dependency_contains",
          files: ["pom.xml", "build.gradle", "package.json", "requirements.txt", "pyproject.toml"],
          pattern: "pgvector|chromadb|qdrant|pinecone|weaviate",
          required: true,
          demonstrates: [{ skill: "vector-databases", level: 3 }],
        },
      ],
    },
    status: "draft",
    last_reviewed_at: "2026-10-01",
    reviewed_by: "seed-placeholder",
  },
  {
    slug: "production-ai-service",
    name: "End-to-End Semantic Search and Evaluation Service",
    mode: "external",
    resource_url: "https://github.com/example/semantic-search-evaluation",
    difficulty: "advanced",
    est_hours: 16,
    tags: ["ai", "search"],
    requires_skills: ["llm-apis"],
    requires_projects: ["rag-knowledge-assistant"],
    access: {
      free_preview: true,
      entitlement_keys_any: [],
    },
    covers: [
      { skill: "embeddings", level: 3 },
      { skill: "ai-evaluation", level: 2 },
    ],
    rubric: [],
    verification: { checks: [] },
    status: "draft",
    last_reviewed_at: "2026-10-01",
    reviewed_by: "seed-placeholder",
  },
  {
    slug: "kubernetes-cluster-observability",
    name: "Deploy Kubernetes Service with Prometheus and Grafana",
    mode: "external",
    resource_url: "https://github.com/example/k8s-observability-guide",
    difficulty: "advanced",
    est_hours: 18,
    tags: ["k8s", "observability"],
    requires_skills: ["docker"],
    requires_projects: [],
    access: {
      free_preview: true,
      entitlement_keys_any: [],
    },
    covers: [
      { skill: "kubernetes", level: 4 },
      { skill: "prometheus", level: 4 },
      { skill: "grafana", level: 3 },
    ],
    rubric: [],
    verification: { checks: [] },
    status: "draft",
    last_reviewed_at: "2026-10-01",
    reviewed_by: "seed-placeholder",
  },
  {
    slug: "ai-strategy-and-evaluation-playbook",
    name: "AI Strategy, Evaluation and FinOps Playbook",
    mode: "external",
    resource_url: "https://example.com/ai-strategy-playbook",
    difficulty: "intermediate",
    est_hours: 8,
    tags: ["manager-friendly"],
    requires_skills: [],
    requires_projects: [],
    access: {
      free_preview: true,
      entitlement_keys_any: [],
    },
    covers: [
      { skill: "ai-strategy", level: 2 },
      { skill: "ai-evaluation", level: 2 },
      { skill: "cloud-cost-management", level: 2 },
    ],
    rubric: [],
    verification: { checks: [] },
    status: "draft",
    last_reviewed_at: "2026-10-01",
    reviewed_by: "seed-placeholder",
  },
];

for (const p of projects) {
  writeYaml("projects", p.slug, p);
}

// 6. Guided phases markdown files
writeMd(
  "modernise-java-service",
  "01-spring-boot",
  "# Phase 1: Modernise with Spring Boot\n\nMigrate legacy Java web configurations into Spring Boot starters with embedded server support.\n",
);

writeMd(
  "containerise-and-deploy-aws",
  "01-containerise",
  "# Phase 1: Dockerize the Spring Boot Application\n\nWrite a secure multi-stage Dockerfile running as a non-root user.\n",
);

writeMd(
  "containerise-and-deploy-aws",
  "02-deploy",
  "# Phase 2: Deploy to AWS ECS\n\nConfigure AWS ECS Task Definitions and GitHub Actions automation.\n",
);

writeMd(
  "rag-knowledge-assistant",
  "01-rag-pipeline",
  "# Phase 1: RAG Pipeline with Vector Search\n\nIngest documents, generate embeddings, and query vector database.\n",
);

console.log("Draft seed content successfully authored!");
