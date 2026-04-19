export type AgentRole =
  | "orchestrator"
  | "skills-curator"
  | "builder"
  | "auditor-ops";

export type TaskEstado = "pendiente" | "en-curso" | "completado";
export type TaskPriority = "alta" | "media" | "baja";

export type Task = {
  id: string;
  role: AgentRole;
  title: string;
  priority: TaskPriority;
  estado: TaskEstado;
  dependeDe: string[];
  habilita: string[];
  file: string;
  log: string | null;
  createdAt: string;
};

export type AgentSnapshot = {
  role: AgentRole;
  ubicacion: string;
  ultimaSenal: string;
  pendientes: number;
  enCurso: number;
  completadas: number;
};

export type StateSnapshot = {
  updated: string;
  agents: AgentSnapshot[];
  modoMasterActive: boolean;
};

export type GitResult = {
  ok: boolean;
  message: string;
  head: string;
};

export type AppConfig = {
  repoPath: string;
  refreshTimeoutMs: number;
  autoRefreshOnFocus: boolean;
};

export const DEFAULT_CONFIG: AppConfig = {
  repoPath: "C:/Users/Tony/AppData/Local/Temp/agente-repo",
  refreshTimeoutMs: 5000,
  autoRefreshOnFocus: false,
};
