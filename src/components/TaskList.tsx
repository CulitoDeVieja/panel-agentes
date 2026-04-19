import { clsx } from "clsx";
import type { Task } from "@/types";

type Props = {
  tasks: Task[];
  completedIds?: Set<string>;
  showBlocked?: boolean;
  maxItems?: number;
};

const PRIORITY_COLORS = {
  alta: "text-red-400",
  media: "text-yellow-400",
  baja: "text-green-400",
};

export function TaskList({ tasks, completedIds = new Set(), showBlocked = false, maxItems }: Props) {
  const displayed = maxItems ? tasks.slice(0, maxItems) : tasks;

  if (displayed.length === 0) {
    return <p className="py-4 text-center text-sm text-gray-500">(ninguna)</p>;
  }

  return (
    <ul className="space-y-2">
      {displayed.map((task) => {
        const blocked =
          showBlocked &&
          task.dependeDe.length > 0 &&
          task.dependeDe.some((dep) => !completedIds.has(dep));

        return (
          <li
            key={task.id}
            className={clsx(
              "flex items-start gap-2 rounded-lg px-3 py-2 text-sm",
              blocked ? "bg-gray-800 opacity-70" : "bg-gray-800"
            )}
          >
            {blocked && <span title="Bloqueada por dependencias">🔒</span>}
            <span className="flex-1 text-gray-200">{task.title}</span>
            <span className={clsx("shrink-0 text-xs font-medium", PRIORITY_COLORS[task.priority])}>
              {task.priority}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
