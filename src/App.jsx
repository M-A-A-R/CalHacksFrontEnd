import React, { useState } from "react";
import NotebookLayout from "./components/notebook/NotebookLayout.jsx";
import AnalysisView from "./components/AnalysisView.jsx";
import StatisticsView from "./components/StatisticsView.jsx";
import CrossRefView from "./components/CrossRefView.jsx";
import LandingPage from "./components/home/LandingPage.jsx";
import { DEMO_NOTEBOOK } from "./demoNotebook.js";

function App() {
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("notebook");
  const [openWithDemo, setOpenWithDemo] = useState(false);

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

      setOpenWithDemo(false);
      setIsNotebookOpen(true);
      setActiveTab("notebook");
    } catch (error) {
      console.error("Failed to open notebook:", error);
      // Open a local blank notebook anyway
      setOpenWithDemo(false);
      setIsNotebookOpen(true);
      setActiveTab("notebook");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDemoNotebook = async () => {
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

      setOpenWithDemo(true);
      setIsNotebookOpen(true);
      setActiveTab("notebook");
    } catch (error) {
      console.error("Failed to open demo notebook:", error);
      setOpenWithDemo(true);
      setIsNotebookOpen(true);
      setActiveTab("notebook");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDemo = () => {
    const demoSection = document.getElementById("benchbrain-demos");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth", block: "start" });
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
      <LandingPage
        onOpenNotebook={handleOpenNotebook}
        onOpenDemo={handleOpenDemoNotebook}
        onRequestDemo={handleRequestDemo}
        isLoading={isLoading}
      />
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
          <button
            type="button"
            onClick={() => setActiveTab("statistics")}
            className={tabButtonClassName("statistics")}
            aria-selected={activeTab === "statistics"}
          >
            Statistics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("crossref")}
            className={tabButtonClassName("crossref")}
            aria-selected={activeTab === "crossref"}
          >
            Cross-Reference Data
          </button>
        </div>
      </div>

      <div className={activeTab === "notebook" ? "block" : "hidden"}>
        <NotebookLayout demoToLoad={openWithDemo ? DEMO_NOTEBOOK : null} />
      </div>

      <div className={activeTab === "analysis" ? "block" : "hidden"}>
        <AnalysisView isActive={activeTab === "analysis"} />
      </div>

      <div className={activeTab === "statistics" ? "block" : "hidden"}>
        <StatisticsView isActive={activeTab === "statistics"} />
      </div>

      <div className={activeTab === "crossref" ? "block" : "hidden"}>
        <CrossRefView isActive={activeTab === "crossref"} />
      </div>
    </div>
  );
}

export default App;

