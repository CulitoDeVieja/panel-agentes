import { useState } from "react";
import type { AgentRole } from "@/types";
import { RepoDataProvider } from "@/context/RepoDataContext";
import { Dashboard } from "@/components/Dashboard";
import { AgentDetail } from "@/components/AgentDetail";

type View = { type: "dashboard" } | { type: "agent"; role: AgentRole };

function AppContent() {
  const [view, setView] = useState<View>({ type: "dashboard" });

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
      <div className="mx-auto max-w-3xl">
        {view.type === "dashboard" ? (
          <Dashboard onSelectAgent={(role) => setView({ type: "agent", role })} />
        ) : (
          <AgentDetail
            role={view.role}
            onBack={() => setView({ type: "dashboard" })}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <RepoDataProvider>
      <AppContent />
    </RepoDataProvider>
  );
}
