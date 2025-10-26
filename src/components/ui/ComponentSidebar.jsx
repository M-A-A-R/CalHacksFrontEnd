import React from 'react'

/**
 * ComponentSidebar Component
 * 
 * A fixed red sidebar on the left side that allows users to add different
 * components to their notebook (Sequence Editor, Protein Viewer, Data Table, Protocol Upload).
 * 
 * Features:
 * - Fixed position on the left side (192px width - compact design)
 * - Red background matching the notebook theme
 * - White text and icons for contrast
 * - Hover effects on buttons
 * - Header section with title
 * 
 * @param {Function} onAddSequence - Callback to add a sequence editor block
 * @param {Function} onAddProtein - Callback to add a protein viewer block
 * @param {Function} onAddTable - Callback to add a data table block
 * @param {Function} onAddProtocol - Callback to add a protocol upload block
 */
const ComponentSidebar = ({ 
  onAddSequence, 
  onAddProtein, 
  onAddTable, 
  onAddProtocol 
}) => {
  // Base button styles for sidebar buttons (compact version)
  const buttonClass = `
    w-full text-left px-3 py-2 mx-2 my-1 rounded-md 
    transition-colors duration-150 
    text-white hover:bg-notebook-red-hover 
    flex items-center gap-2 text-sm
  `

  return (
    <aside className="fixed left-0 top-0 h-screen w-48 bg-notebook-red text-white shadow-xl border-r border-notebook-red-dark z-40 flex flex-col">
      {/* Header Section */}
      <div className="p-3 border-b border-notebook-red-dark">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-red-100">
          Components
        </h2>
        <p className="text-xs text-white opacity-70 mt-1">
          Add tools
        </p>
      </div>

      {/* Component Buttons Section */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {/* Sequence Editor Button */}
        <button
          type="button"
          onClick={onAddSequence}
          className={buttonClass}
          title="Add Sequence Editor"
        >
          <span className="text-xl">📝</span>
          <span className="text-sm font-medium">Sequence Editor</span>
        </button>

        {/* Protein Viewer Button */}
        <button
          type="button"
          onClick={onAddProtein}
          className={buttonClass}
          title="Add Protein Viewer"
        >
          <span className="text-xl">🧬</span>
          <span className="text-sm font-medium">Protein Viewer</span>
        </button>

        {/* Data Table Button */}
        <button
          type="button"
          onClick={onAddTable}
          className={buttonClass}
          title="Add Data Table"
        >
          <span className="text-xl">📊</span>
          <span className="text-sm font-medium">Data Table</span>
        </button>

        {/* Protocol Upload Button */}
        <button
          type="button"
          onClick={onAddProtocol}
          className={buttonClass}
          title="Add Protocol Upload"
        >
          <span className="text-xl">📄</span>
          <span className="text-sm font-medium">Protocol Upload</span>
        </button>
      </nav>

      {/* Footer Section (Optional) */}
      <div className="p-3 border-t border-notebook-red-dark">
        {/* Save Status Indicator */}
        <div className="text-xs text-white opacity-70 text-center">
          <p>Tools ready</p>
        </div>
      </div>
    </aside>
  )
}

export default ComponentSidebar

