import React, { useState } from 'react'
import SequenceEditor from './components/input/SequenceEditor.jsx'
import ProteinViewer from './components/input/ProteinViewer.jsx'

function App() {
  const [isNotebookOpen, setIsNotebookOpen] = useState(false)

  if (!isNotebookOpen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bio-light p-6">
        <button
          type="button"
          onClick={() => setIsNotebookOpen(true)}
          className="rounded-lg bg-bio-primary px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-600"
        >
          Open Notebook
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bio-light p-6 sm:p-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-xl bg-white p-6 shadow">
          <h1 className="text-3xl font-bold text-bio-dark sm:text-4xl">
            Bio Research Platform
          </h1>
          <p className="mt-2 text-base text-gray-600 sm:text-lg">
            Capture sequences, track experiments, and visualize structures from
            a single workspace.
          </p>
        </header>

        <main className="grid gap-6 lg:grid-cols-2">
          <SequenceEditor />
          <ProteinViewer />
        </main>
      </div>
    </div>
  )
}

export default App

