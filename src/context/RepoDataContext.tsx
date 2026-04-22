
import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchTareasList, parseTaskMarkdown } from '../utils'; // Asumiendo que estos son los hooks importados
import { TaskParsed } from '../types'; // Asumiendo que este es el tipo importado

type RepoData = {
  tasks: TaskParsed[];
  byRole: (role: string) => TaskParsed[];
  refresh: () => Promise<void>;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
};

const RepoDataContext = createContext<RepoData>({
  tasks: [],
  byRole: () => [],
  refresh: async () => {},
  loading: false,
  error: null,
  lastFetch: null
});

export const useRepoData = (): RepoData => useContext(RepoDataContext);

export function RepoDataProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [tasks, setTasks] = useState<TaskParsed[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  useEffect(() => {
    const fetchRepoData = async () => {
      try {
        setLoading(true);
        setError(null);
        const rawTasks = await fetchTareasList();
        const parsedTasks = await Promise.all(rawTasks.map(parseTaskMarkdown));
        setTasks(parsedTasks);
        setLastFetch(new Date());
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepoData();
  }, []);

  const refresh = async () => {
    await fetchRepoData();
  };

  const byRole = (role: string): TaskParsed[] => tasks.filter(task => task.role === role);

  return (
    <RepoDataContext.Provider value={{ tasks, byRole, refresh, loading, error, lastFetch }}>
      {children}
    </RepoDataContext.Provider>
  );
}
