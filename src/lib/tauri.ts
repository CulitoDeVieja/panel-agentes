import { invoke } from "@tauri-apps/api/core";
import type { Task, StateSnapshot, GitResult, AppConfig } from "@/types";

export type Estado = "pendiente" | "en-curso" | "completado";
export type Role =
  | "orchestrator"
  | "skills-curator"
  | "builder"
  | "auditor-ops";

export const api = {
  listTasks: (estado: Estado, rol?: Role) =>
    invoke<Task[]>("list_tasks", { estado, rol: rol ?? null }),

  readState: () => invoke<StateSnapshot>("read_state"),

  readTask: (archivo: string) => invoke<Task>("read_task", { archivo }),

  gitPull: () => invoke<GitResult>("git_pull"),

  gitLog: (limit: number) =>
    invoke<{ hash: string; message: string; author: string; date: string }[]>(
      "git_log",
      { limit }
    ),

  gitStatus: () =>
    invoke<{ branch: string; dirty: boolean; ahead: number; behind: number }>(
      "git_status"
    ),

  getConfig: () => invoke<AppConfig>("get_config"),

  setConfig: (cfg: AppConfig) => invoke<void>("set_config", { cfg }),
};
