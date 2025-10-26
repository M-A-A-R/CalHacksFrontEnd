import React, { useState } from "react";
import NotebookLayout from "./components/notebook/NotebookLayout.jsx";
import AnalysisView from "./components/AnalysisView.jsx";
import StatisticsView from "./components/StatisticsView.jsx";
import CrossRefView from "./components/CrossRefView.jsx";

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
      <div className="min-h-screen bg-gradient-to-br from-notebook-red-light via-white to-gray-100">
        {/* Top bar */}
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-notebook-red text-white shadow-sm">🧬</div>
            <div>
              <p className="text-sm tracking-wide text-notebook-red-dark">Bio Research Platform</p>
              <h1 className="text-xl font-bold text-bio-dark">Intelligent Lab Notebook</h1>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-8 lg:grid-cols-2 lg:py-12">
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-extrabold leading-tight text-bio-dark sm:text-4xl">
              Document experiments. Analyze results. Cross‑reference literature.
            </h2>
            <p className="mt-4 text-slate-600">
              A high‑performance notebook that unifies free‑form notes, sequence tools,
              interactive graphs, and statistical validation — all linked to verifiable sources.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-notebook-red-dark">AI‑Guided Analysis</p>
                <p className="mt-1 text-sm text-slate-600">Generates interaction graphs with inline source links.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-notebook-red-dark">Statistical Confidence</p>
                <p className="mt-1 text-sm text-slate-600">Visuals for t‑tests, ANOVA, and credible intervals.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-notebook-red-dark">Sequence + Protocols</p>
                <p className="mt-1 text-sm text-slate-600">Clean editors for sequences, tables, and uploads.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-notebook-red-dark">Cross‑Reference Data</p>
                <p className="mt-1 text-sm text-slate-600">Every claim is traceable to notebooks or PubMed.</p>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleOpenNotebook}
                disabled={isLoading}
                className="inline-flex items-center rounded-lg bg-notebook-red px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-notebook-red-hover disabled:opacity-50"
              >
                {isLoading ? "Opening…" : "Open Notebook"}
              </button>
            </div>
          </div>

          {/* Right: glass card preview */}
          <div className="relative hidden rounded-xl border border-slate-200 bg-white/70 p-6 shadow-md backdrop-blur lg:block">
            <div className="absolute -left-6 -top-6 h-16 w-16 rounded-lg bg-notebook-red/20 blur-2xl" />
            <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-notebook-red/10 blur-2xl" />
            <p className="text-sm font-semibold text-notebook-red-dark">Preview</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>• Recommended edit with sources</li>
              <li>• Interaction graph with clickable evidence</li>
              <li>• Visual statistics with error bars and intervals</li>
              <li>• Cross‑reference list of all datasets</li>
            </ul>
            <div className="mt-4 h-40 rounded-lg border border-slate-200 bg-white/70" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="h-16 rounded-md border border-slate-200 bg-white/70" />
              <div className="h-16 rounded-md border border-slate-200 bg-white/70" />
              <div className="h-16 rounded-md border border-slate-200 bg-white/70" />
            </div>
          </div>
        </section>
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
        <NotebookLayout />
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
