import { clsx } from "clsx";

type Props = { signal: string; className?: string };

export function AgentStatusBadge({ signal, className }: Props) {
  const isActive = signal.includes("✅") || signal.toLowerCase().includes("activo");
  const isWaiting = signal.includes("⏳") || signal.toLowerCase().includes("esperando");

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        isActive && "bg-green-900 text-green-300",
        isWaiting && "bg-yellow-900 text-yellow-300",
        !isActive && !isWaiting && "bg-gray-700 text-gray-300",
        className
      )}
      aria-label={`Estado: ${signal}`}
    >
      {isActive ? "✅ activo" : isWaiting ? "⏳ esperando" : signal}
    </span>
  );
}
