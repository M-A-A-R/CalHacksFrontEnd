import React, { useState } from "react";
import NotebookLayout from "./components/notebook/NotebookLayout.jsx";

function App() {
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (error) {
      console.error("Failed to open notebook:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  return <NotebookLayout />;
}

export default App;
