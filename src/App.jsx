import React, { useState } from "react";
import NotebookLayout from "./components/notebook/NotebookLayout.jsx";
import AnalysisView from "./components/AnalysisView.jsx";

function App() {
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("notebook");

  const handleOpenNotebook = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/letta/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setIsNotebookOpen(true);
      setActiveTab("notebook");
    } catch (error) {
      console.error("Failed to open notebook:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabButtonClassName = (tab) =>
    `rounded-md px-5 py-2 text-sm font-semibold transition ${
      activeTab === tab
        ? "bg-notebook-red text-white shadow-sm"
        : "text-gray-600 hover:bg-white hover:text-notebook-red"
    }`;

  if (!isNotebookOpen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bio-light p-6">
        <button
          type="button"
          onClick={handleOpenNotebook}
          disabled={isLoading}
          className="rounded-lg bg-bio-primary px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Opening…" : "Open Notebook"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-center gap-3 px-6 py-3">
          <button
            type="button"
            onClick={() => setActiveTab("notebook")}
            className={tabButtonClassName("notebook")}
            aria-selected={activeTab === "notebook"}
          >
            Notebook
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("analysis")}
            className={tabButtonClassName("analysis")}
            aria-selected={activeTab === "analysis"}
          >
            Analysis
          </button>
        </div>
      </div>

      <div className={activeTab === "analysis" ? "hidden" : "block"}>
        <NotebookLayout />
      </div>

      <div className={activeTab === "analysis" ? "block" : "hidden"}>
        <AnalysisView isActive={activeTab === "analysis"} />
      </div>
    </div>
  );
}

export default App;
