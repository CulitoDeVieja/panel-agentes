import type { AgentRole, Task } from "@/types";
import { useRepoData } from "@/context/RepoDataContext";
import { AgentStatusBadge } from "./AgentStatusBadge";
import { TaskList } from "./TaskList";

type Props = { role: AgentRole; onBack: () => void };

const ROLE_LABELS: Record<string, string> = {
  orchestrator: "Orchestrator",
  "skills-curator": "Skills Curator",
  builder: "Builder",
  "auditor-ops": "Auditor / Ops",
};

export function AgentDetail({ role, onBack }: Props) {
  const { state, tasks } = useRepoData();
  const agent = state?.agents.find((a) => a.role === role);
  const roleTasks = tasks.filter((t) => t.role === role);

  const pendientes = roleTasks.filter((t) => t.estado === "pendiente");
  const enCurso = roleTasks.filter((t) => t.estado === "en-curso");
  const completadas = roleTasks.filter((t) => t.estado === "completado");
  const completedIds = new Set(completadas.map((t) => t.file));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-lg bg-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-600"
          aria-label="Volver al dashboard"
        >
          ← Volver
        </button>
        <h2 className="text-xl font-bold text-white">
          {ROLE_LABELS[role] ?? role}
        </h2>
        {agent && <AgentStatusBadge signal={agent.ultimaSenal} />}
      </div>

      <Section title={`Pendientes (${pendientes.length})`}>
        <TaskList tasks={pendientes} completedIds={completedIds} showBlocked />
      </Section>

      <Section title={`En curso (${enCurso.length})`}>
        <TaskList tasks={enCurso} />
      </Section>

      <Section title={`Completadas (últimas 10)`}>
        <TaskList tasks={completadas} maxItems={10} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h3>
      {children}
    </div>
  );
}
