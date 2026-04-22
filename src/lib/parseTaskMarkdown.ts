export type TaskParsed = {
  id: string;
  role: string;
  title: string;
  priority: "alta" | "media" | "baja";
  estado: "pendiente" | "en-curso" | "completado";
  dependeDe: string[];
  habilita: string[];
  log: string | null;
  createdAt: string;
};

const PRIORITY_VALUES = new Set(["alta", "media", "baja"]);

export function parseTaskMarkdown(
  content: string,
  filename: string,
  estado: TaskParsed["estado"],
): TaskParsed {
  const id = filename.replace(/\.md$/, "");

  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].replace(/^Tarea:\s*/i, "").trim() : id;

  const roleMatch = content.match(/\*\*Rol:\*\*\s*(.+)/);
  const role = roleMatch ? roleMatch[1].trim().toLowerCase() : "";

  const priorityMatch = content.match(/\*\*Prioridad:\*\*\s*(.+)/);
  const priorityRaw = priorityMatch ? priorityMatch[1].trim().toLowerCase() : "media";
  const priority: TaskParsed["priority"] = PRIORITY_VALUES.has(priorityRaw)
    ? (priorityRaw as TaskParsed["priority"])
    : "media";

  const createdMatch = content.match(/\*\*Creada:\*\*\s*(.+)/);
  const createdAt = createdMatch ? createdMatch[1].trim() : "";

  const dependeDe = parseBulletSection(content, "Depende de:");
  const habilita = parseBulletSection(content, "Habilita");

  const logMatch = content.match(/##\s+Log del agente\s*\n([\s\S]*?)(?=\n##|$)/);
  const logRaw = logMatch ? logMatch[1].trim() : "";
  const log = logRaw === "" || logRaw === "(vacío hasta completar)" ? null : logRaw;

  return { id, role, title, priority, estado, dependeDe, habilita, log, createdAt };
}

function parseBulletSection(content: string, sectionName: string): string[] {
  const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sectionMatch = content.match(
    new RegExp(`##\\s+${escaped}[\\s\\S]*?\\n((?:[-*]\\s+.+\\n?)*)`),
  );
  if (!sectionMatch) return [];

  const results: string[] = [];
  for (const line of sectionMatch[1].split("\n")) {
    if (!line.trim().startsWith("-") && !line.trim().startsWith("*")) continue;
    const val = line.replace(/^[-*]\s+/, "").trim();
    if (!val || val === "(ninguna)" || val.startsWith("(")) continue;
    const fileMatch = val.match(/^(\S+\.md)/);
    results.push(fileMatch ? fileMatch[1] : val);
  }
  return results;
}
