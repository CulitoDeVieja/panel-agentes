import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "@/lib/tauri";
import type { Task, StateSnapshot, AppConfig } from "@/types";
import { DEFAULT_CONFIG } from "@/types";

type RepoDataState = {
  state: StateSnapshot | null;
  tasks: Task[];
  config: AppConfig;
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  refresh: () => Promise<void>;
  setConfig: (cfg: AppConfig) => Promise<void>;
};

const RepoDataContext = createContext<RepoDataState | null>(null);

export function RepoDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StateSnapshot | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [config, setConfigState] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stateData, cfg, pending, inProgress, completed] = await Promise.all([
        api.readState(),
        api.getConfig(),
        api.listTasks("pendiente"),
        api.listTasks("en-curso"),
        api.listTasks("completado"),
      ]);
      setState(stateData);
      setConfigState(cfg);
      setTasks([...pending, ...inProgress, ...completed]);
      setLastRefresh(new Date());
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.gitPull();
      await loadData();
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  }, [loadData]);

  const setConfig = useCallback(async (cfg: AppConfig) => {
    await api.setConfig(cfg);
    setConfigState(cfg);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <RepoDataContext.Provider value={{ state, tasks, config, loading, error, lastRefresh, refresh, setConfig }}>
      {children}
    </RepoDataContext.Provider>
  );
}

export function useRepoData(): RepoDataState {
  const ctx = useContext(RepoDataContext);
  if (!ctx) throw new Error("useRepoData must be used within RepoDataProvider");
  return ctx;
}
