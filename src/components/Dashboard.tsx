import type { AgentRole } from "@/types";
import { useRepoData } from "@/context/RepoDataContext";
import { AgentCard } from "./AgentCard";
import { RefreshButton } from "./RefreshButton";

const AGENT_ORDER: AgentRole[] = [
  "orchestrator",
  "skills-curator",
  "builder",
  "auditor-ops",
];

type Props = { onSelectAgent: (role: AgentRole) => void };

export function Dashboard({ onSelectAgent }: Props) {
  const { state, tasks, loading, error, lastRefresh, refresh } = useRepoData();

  const agentsWithCounts = AGENT_ORDER.map((role) => {
    const base = state?.agents.find((a) => a.role === role) ?? {
      role,
      ubicacion: "—",
      ultimaSenal: "—",
      pendientes: 0,
      enCurso: 0,
      completadas: 0,
    };
    const roleTasks = tasks.filter((t) => t.role === role);
    return {
      ...base,
      pendientes: roleTasks.filter((t) => t.estado === "pendiente").length,
      enCurso: roleTasks.filter((t) => t.estado === "en-curso").length,
      completadas: roleTasks.filter((t) => t.estado === "completado").length,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Panel Agentes</h1>
          {state?.modoMasterActive && (
            <span className="rounded-full bg-orange-800 px-2 py-0.5 text-xs font-bold text-orange-200">
              MODO MASTER ●
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-gray-500">
              {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <RefreshButton onRefresh={refresh} />
        </div>
      </header>

      {error && (
        <div className="rounded-lg bg-red-900 px-4 py-2 text-sm text-red-200">
          ❌ {error}
        </div>
      )}

      {loading && !state ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-gray-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {agentsWithCounts.map((agent) => (
            <AgentCard
              key={agent.role}
              agent={agent}
              onClick={() => onSelectAgent(agent.role as AgentRole)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
