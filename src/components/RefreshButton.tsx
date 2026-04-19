import { useState } from "react";
import { clsx } from "clsx";

type Props = { onRefresh: () => Promise<void> };
type Status = "idle" | "loading" | "ok" | "error";

export function RefreshButton({ onRefresh }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleClick = async () => {
    if (status === "loading") return;
    setStatus("loading");
    try {
      await onRefresh();
      setStatus("ok");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setErrMsg(String(e));
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={status === "loading"}
      title={status === "error" ? errMsg : "Actualizar desde git pull"}
      className={clsx(
        "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        status === "idle" && "bg-gray-700 text-gray-200 hover:bg-gray-600",
        status === "loading" && "cursor-not-allowed bg-gray-700 text-gray-400",
        status === "ok" && "bg-green-800 text-green-200",
        status === "error" && "bg-red-800 text-red-200"
      )}
      aria-label="Refrescar datos"
    >
      {status === "loading" ? (
        <span className="animate-spin">⟳</span>
      ) : status === "ok" ? (
        "✅ Actualizado"
      ) : status === "error" ? (
        "❌ Error"
      ) : (
        "↻ Refrescar"
      )}
    </button>
  );
}
