import { clsx } from "clsx";
import type { AgentSnapshot } from "@/types";
import { AgentStatusBadge } from "./AgentStatusBadge";

type Props = {
  agent: AgentSnapshot;
  onClick: () => void;
  active?: boolean;
};

const ROLE_LABELS: Record<string, string> = {
  orchestrator: "Orchestrator",
  "skills-curator": "Skills Curator",
  builder: "Builder",
  "auditor-ops": "Auditor / Ops",
};

export function AgentCard({ agent, onClick, active = false }: Props) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex flex-col gap-3 rounded-xl border p-4 text-left transition-colors hover:border-blue-500 hover:bg-gray-750",
        active ? "border-blue-500 bg-gray-750" : "border-gray-700 bg-gray-800"
      )}
      aria-label={`Ver detalles de ${ROLE_LABELS[agent.role] ?? agent.role}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-white">
          {ROLE_LABELS[agent.role] ?? agent.role}
        </span>
        <AgentStatusBadge signal={agent.ultimaSenal} />
      </div>
      <div className="text-xs text-gray-400">{agent.ubicacion}</div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-gray-700 py-2">
          <div className="text-lg font-bold text-yellow-400">{agent.pendientes}</div>
          <div className="text-xs text-gray-400">pendiente</div>
        </div>
        <div className="rounded-lg bg-gray-700 py-2">
          <div className="text-lg font-bold text-blue-400">{agent.enCurso}</div>
          <div className="text-xs text-gray-400">en curso</div>
        </div>
        <div className="rounded-lg bg-gray-700 py-2">
          <div className="text-lg font-bold text-green-400">{agent.completadas}</div>
          <div className="text-xs text-gray-400">completado</div>
        </div>
      </div>
    </button>
  );
}
