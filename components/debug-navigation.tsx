"use client"

interface DebugNavigationProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function DebugNavigation({ currentView, onViewChange }: DebugNavigationProps) {
  return (
    <div className="flex space-x-2">
      <button
        onClick={() => onViewChange("graph")}
        className={`${
          currentView === "graph" ? "bg-green-600" : "bg-gray-600"
        } hover:bg-green-700 text-white text-xs px-2 py-1`}
      >
        Graph
      </button>
      <button
        onClick={() => onViewChange("logs")}
        className={`${
          currentView === "logs" ? "bg-green-600" : "bg-gray-600"
        } hover:bg-green-700 text-white text-xs px-2 py-1`}
      >
        Logs
      </button>
      <button
        onClick={() => onViewChange("simplified-worker-interface")}
        className={`${
          currentView === "simplified-worker-interface" ? "bg-green-600" : "bg-gray-600"
        } hover:bg-green-700 text-white text-xs px-2 py-1`}
      >
        Simplified Worker
      </button>
    </div>
  )
}
