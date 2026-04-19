import type { Task, AgentRole, TaskEstado, TaskPriority } from "@/types";

const PRIORITY_MAP: Record<string, TaskPriority> = {
  alta: "alta",
  media: "media",
  baja: "baja",
};

const ROLE_MAP: Record<string, AgentRole> = {
  orchestrator: "orchestrator",
  "skills-curator": "skills-curator",
  builder: "builder",
  "auditor-ops": "auditor-ops",
};

export function parseTask(content: string, filename: string, path: string): Task {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].replace(/^Tarea:\s*/i, "").trim() : filename;

  const roleMatch = content.match(/\*\*Rol:\*\*\s*(.+)/);
  const roleRaw = roleMatch ? roleMatch[1].trim().toLowerCase() : "";
  const role: AgentRole = ROLE_MAP[roleRaw] ?? "builder";

  const priorityMatch = content.match(/\*\*Prioridad:\*\*\s*(.+)/);
  const priorityRaw = priorityMatch ? priorityMatch[1].trim().toLowerCase() : "media";
  const priority: TaskPriority = PRIORITY_MAP[priorityRaw] ?? "media";

  const createdMatch = content.match(/\*\*Creada:\*\*\s*(.+)/);
  const createdAt = createdMatch ? createdMatch[1].trim() : "";

  const estado = deriveEstado(path);

  const dependeDe = parseBulletSection(content, "Depende de:");
  const habilita = parseBulletSection(content, "Habilita");

  const logMatch = content.match(/##\s+Log del agente\s*\n([\s\S]*?)(?=\n##|$)/);
  const logRaw = logMatch ? logMatch[1].trim() : "";
  const log = logRaw === "(vacío hasta completar)" || logRaw === "" ? null : logRaw;

  const idMatch = filename.match(/^(.+?)\.md$/);
  const id = idMatch ? idMatch[1] : filename;

  return { id, role, title, priority, estado, dependeDe, habilita, file: filename, log, createdAt };
}

function deriveEstado(path: string): TaskEstado {
  if (path.includes("completado")) return "completado";
  if (path.includes("en-curso")) return "en-curso";
  return "pendiente";
}

function parseBulletSection(content: string, sectionName: string): string[] {
  const sectionMatch = content.match(
    new RegExp(`##\\s+${sectionName}[\\s\\S]*?\\n((?:[-*]\\s+.+\\n?)*)`),
  );
  if (!sectionMatch) return [];
  const lines = sectionMatch[1].split("\n").filter((l) => l.trim().startsWith("-"));
  const results: string[] = [];
  for (const line of lines) {
    const val = line.replace(/^[-*]\s+/, "").trim();
    if (val && val !== "(ninguna)" && !val.startsWith("(")) {
      const fileMatch = val.match(/^(\S+\.md)/);
      if (fileMatch) results.push(fileMatch[1]);
      else results.push(val);
    }
  }
  return results;
}

export function parseTaskList(
  files: { content: string; filename: string; path: string }[]
): Task[] {
  return files.map((f) => parseTask(f.content, f.filename, f.path));
}
