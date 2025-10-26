import React, { useState, useEffect } from 'react'

/**
 * TextFormattingToolbar Component
 * 
 * A fixed toolbar at the top of the notebook area that provides text formatting options.
 * Uses document.execCommand for basic formatting (compatible with contentEditable).
 * 
 * Features:
 * - Bold, Italic, Underline, Strikethrough
 * - Headings (H1, H2)
 * - Lists (Bullet, Numbered)
 * - Horizontal Rule
 * 
 * @param {Function} onCommand - Callback function when a formatting command is executed
 */
const TextFormattingToolbar = ({ onCommand }) => {
  // Track which buttons are active based on current selection
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
  })

  // Update active formats when selection changes
  useEffect(() => {
    const updateActiveFormats = () => {
      try {
        setActiveFormats({
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline'),
          strikeThrough: document.queryCommandState('strikeThrough'),
        })
      } catch (error) {
        // Ignore errors (happens when no contentEditable is focused)
      }
    }

    // Listen for selection changes
    document.addEventListener('selectionchange', updateActiveFormats)
    return () => document.removeEventListener('selectionchange', updateActiveFormats)
  }, [])

  /**
   * Execute a formatting command on the selected text
   * @param {string} command - The command to execute (e.g., 'bold', 'italic')
   * @param {string} value - Optional value for the command
   */
  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    
    // Call the callback if provided
    if (onCommand) {
      onCommand(command, value)
    }

    // Refocus on the editor to maintain user experience
    // (The editor should handle focus management)
  }

  /**
   * Format a heading by wrapping selection in heading tags
   */
  const formatHeading = (level) => {
    executeCommand('formatBlock', `h${level}`)
  }

  /**
   * Insert a horizontal rule at cursor position
   */
  const insertHorizontalRule = () => {
    executeCommand('insertHorizontalRule')
  }

  // Base button styles - White buttons on red toolbar
  const buttonBaseClass = 'flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-150 text-white hover:bg-notebook-red-hover'
  
  // Active button styles (when format is applied to current selection)
  const buttonActiveClass = 'bg-white text-notebook-red'

  return (
    <div className="sticky top-0 z-50 bg-notebook-red border-b border-notebook-red-dark shadow-sm">
      <div className="flex items-center gap-1 px-4 py-2 max-w-full overflow-x-auto">
        
        {/* Text Style Group */}
        <div className="flex items-center gap-1 pr-3 border-r border-notebook-red-dark">
          {/* Bold Button */}
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className={`${buttonBaseClass} ${activeFormats.bold ? buttonActiveClass : ''}`}
            title="Bold (Ctrl+B)"
            aria-label="Bold"
          >
            <span className="font-bold text-sm">B</span>
          </button>

          {/* Italic Button */}
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className={`${buttonBaseClass} ${activeFormats.italic ? buttonActiveClass : ''}`}
            title="Italic (Ctrl+I)"
            aria-label="Italic"
          >
            <span className="italic text-sm">I</span>
          </button>

          {/* Underline Button */}
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className={`${buttonBaseClass} ${activeFormats.underline ? buttonActiveClass : ''}`}
            title="Underline (Ctrl+U)"
            aria-label="Underline"
          >
            <span className="underline text-sm">U</span>
          </button>

          {/* Strikethrough Button */}
          <button
            type="button"
            onClick={() => executeCommand('strikeThrough')}
            className={`${buttonBaseClass} ${activeFormats.strikeThrough ? buttonActiveClass : ''}`}
            title="Strikethrough"
            aria-label="Strikethrough"
          >
            <span className="line-through text-sm">S</span>
          </button>
        </div>

        {/* Heading Group */}
        <div className="flex items-center gap-1 pr-3 border-r border-notebook-red-dark">
          {/* Heading 1 */}
          <button
            type="button"
            onClick={() => formatHeading(1)}
            className={buttonBaseClass}
            title="Heading 1"
            aria-label="Heading 1"
          >
            <span className="font-bold text-sm">H1</span>
          </button>

          {/* Heading 2 */}
          <button
            type="button"
            onClick={() => formatHeading(2)}
            className={buttonBaseClass}
            title="Heading 2"
            aria-label="Heading 2"
          >
            <span className="font-bold text-sm">H2</span>
          </button>
        </div>

        {/* List Group */}
        <div className="flex items-center gap-1 pr-3 border-r border-notebook-red-dark">
          {/* Bullet List */}
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className={buttonBaseClass}
            title="Bullet List"
            aria-label="Bullet List"
          >
            <span className="text-sm">•</span>
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className={buttonBaseClass}
            title="Numbered List"
            aria-label="Numbered List"
          >
            <span className="text-sm font-semibold">1.</span>
          </button>
        </div>

        {/* Insert Group */}
        <div className="flex items-center gap-1">
          {/* Horizontal Rule */}
          <button
            type="button"
            onClick={insertHorizontalRule}
            className={buttonBaseClass}
            title="Insert Horizontal Line"
            aria-label="Insert Horizontal Line"
          >
            <span className="text-sm">─</span>
          </button>
        </div>

        {/* Info text */}
        <div className="ml-auto pl-3 text-xs text-white opacity-80 hidden sm:block">
          Format your notes
        </div>
      </div>
    </div>
  )
}

export default TextFormattingToolbar

