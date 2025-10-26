import React, { useState, useEffect } from 'react'

/**
 * Header Component
 * 
 * A clean, professional header for the Bio Research Notebook.
 * 
 * Features:
 * - Left: Logo and app title with red accent
 * - Center: Editable notebook title (click to edit, saves to localStorage)
 * - Right: Save button, last saved timestamp
 * 
 * @param {Function} onSave - Callback function when Save button is clicked
 * @param {boolean} isSaving - Whether a save operation is in progress
 * @param {string} lastSaved - ISO timestamp of last save
 * @param {string} notebookTitle - Current notebook title
 * @param {Function} onTitleChange - Callback when notebook title changes
 */
const Header = ({ 
  onSave, 
  onAnalyze = () => {},
  isSaving = false, 
  lastSaved = null,
  notebookTitle = 'Untitled Notebook',
  onTitleChange
}) => {
  // Local state for editing the notebook title
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState(notebookTitle)

  // Update local state when prop changes
  useEffect(() => {
    setTitleInput(notebookTitle)
  }, [notebookTitle])

  /**
   * Handle title click - enter edit mode
   */
  const handleTitleClick = () => {
    setIsEditingTitle(true)
  }

  /**
   * Handle title blur - save and exit edit mode
   */
  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    if (titleInput.trim() !== notebookTitle) {
      onTitleChange(titleInput.trim() || 'Untitled Notebook')
    }
  }

  /**
   * Handle Enter key - save and exit edit mode
   */
  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTitleBlur()
    } else if (e.key === 'Escape') {
      setTitleInput(notebookTitle)
      setIsEditingTitle(false)
    }
  }

  /**
   * Format the last saved time for display
   */
  const formatLastSaved = (timestamp) => {
    if (!timestamp) return 'Not saved yet'
    
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      
      if (diffMins < 1) return 'Just now'
      if (diffMins === 1) return '1 minute ago'
      if (diffMins < 60) return `${diffMins} minutes ago`
      
      // Format as time if today
      const isToday = date.toDateString() === now.toDateString()
      if (isToday) {
        return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      }
      
      // Format as date and time if older
      return date.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch (error) {
      return 'Unknown'
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-3 shadow-sm">
      {/* Left Section: Logo and Title */}
      <div className="flex items-center gap-3">
        {/* Logo/Icon */}
        <div className="flex items-center justify-center w-8 h-8 bg-notebook-red rounded-md">
          <span className="text-white text-lg font-bold">🧬</span>
        </div>
        
        {/* App Title with Red Accent */}
        <h1 className="text-xl font-bold text-gray-800">
          <span className="text-notebook-red">Bio</span>{' '}
          <span className="text-gray-800">Research Notebook</span>
        </h1>
      </div>

      {/* Center Section: Editable Notebook Title */}
      <div className="flex-1 flex items-center justify-center px-8">
        {isEditingTitle ? (
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
            className="text-lg font-medium text-gray-700 bg-gray-50 border border-notebook-red rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-notebook-red focus:border-transparent max-w-md w-full text-center"
            placeholder="Enter notebook title..."
          />
        ) : (
          <button
            type="button"
            onClick={handleTitleClick}
            className="text-lg font-medium text-gray-700 hover:text-notebook-red transition-colors group flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-50"
            title="Click to edit notebook title"
          >
            <span>{notebookTitle}</span>
            <svg 
              className="w-4 h-4 text-gray-400 group-hover:text-notebook-red opacity-0 group-hover:opacity-100 transition-opacity" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      {/* Right Section: Save Button and Timestamp */}
      <div className="flex items-center gap-4">
        {/* Last Saved Timestamp */}
        <div className="text-sm text-gray-500 min-w-[120px] text-right">
          {isSaving ? (
            <span className="text-notebook-red animate-pulse">Saving...</span>
          ) : (
            <span title={lastSaved ? new Date(lastSaved).toLocaleString() : ''}>
              {formatLastSaved(lastSaved)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAnalyze}
            className="border border-notebook-red text-notebook-red px-4 py-2 rounded-md font-medium text-sm transition-colors hover:bg-notebook-red hover:text-white shadow-sm"
            title="Send notebook for analysis"
          >
            Analyze
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="bg-notebook-red text-white px-4 py-2 rounded-md font-medium text-sm transition-colors hover:bg-notebook-red-hover disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            title="Save notebook to server"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving
              </span>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

