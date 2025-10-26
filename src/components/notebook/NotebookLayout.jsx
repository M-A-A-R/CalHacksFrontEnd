import React, { useEffect, useRef, useState } from 'react'
import SequenceEditor from '../input/SequenceEditor.jsx'
import ProteinViewer from '../input/ProteinViewer.jsx'
import DataTable from '../input/DataTable.jsx'
import ProtocolUploader from '../input/ProtocolUploader.jsx'
import TextFormattingToolbar from '../ui/TextFormattingToolbar.jsx'
import ComponentSidebar from '../ui/ComponentSidebar.jsx'
import Header from '../ui/Header.jsx'
import ScrollToTopButton from '../ui/ScrollToTopButton.jsx'
import mockAnalysisRaw from '../../../log.md?raw'

const MOCK_ANALYSIS_RESULT = (() => {
  try {
    return JSON.parse(mockAnalysisRaw)
  } catch (error) {
    console.error('Failed to parse mock analysis payload from log.md', error)
    return null
  }
})()

const DOCUMENT_KEY = 'labNotebookDocument'
const SEQUENCE_BLOCKS_KEY = 'labNotebookSequenceBlocks'
const PROTEIN_BLOCKS_KEY = 'labNotebookProteinBlocks'
const TABLE_BLOCKS_KEY = 'labNotebookTableBlocks'
const PROTOCOL_BLOCKS_KEY = 'labNotebookProtocolBlocks'
const NOTEBOOK_TITLE_KEY = 'labNotebookTitle' // Phase 4 - New Data
const SAVE_DEBOUNCE_MS = 600
const SAVE_ENDPOINT = 'http://localhost:8000/api/notebook/save'

// Phase 7.6 - Enhanced default template with header and placeholder text
const DEFAULT_HTML = `
<h1 style="font-size: 1.875rem; font-weight: 700; color: #991B1B; margin-bottom: 0.5rem;">🧬 Bio Research Notebook</h1>
<p style="color: #6B7280; margin-bottom: 1.5rem;"><em>Document your experiments, analyze sequences, and track protocols</em></p>
<h2 style="font-size: 1.25rem; font-weight: 600; color: #DC2626; margin-top: 1.5rem; margin-bottom: 0.75rem;">Experiment Overview</h2>
<p style="color: #1F2937; line-height: 1.75;"><strong>Type here</strong> to add your research notes, observations, and findings...</p>
<p style="color: #1F2937; line-height: 1.75; margin-top: 0.5rem;">A data table and sequence editor have been added below to get you started. Use the sidebar to add more components!</p>
`

// Phase 7.4 - Removed grid snapping system (no longer using absolute positioning)

const diffDocumentHtml = (currentHtml, previousHtml) => {
  if (!previousHtml) {
    return currentHtml
  }
  if (currentHtml === previousHtml) {
    return null
  }
  if (
    currentHtml.length > previousHtml.length &&
    currentHtml.startsWith(previousHtml)
  ) {
    return currentHtml.slice(previousHtml.length)
  }
  return currentHtml
}

const createBlockId = (prefix) =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}`

// Phase 7.4 - Simplified: blocks now just have {id}, order is implicit from array position
const hydrateFloatingBlocks = (stored, fallbackIdPrefix) => {
  if (!stored) {
    return []
  }
  try {
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.map((item, index) => {
      if (item && typeof item === 'object') {
        return {
          id: item.id || `${fallbackIdPrefix}-${index}`,
        }
      }
      return {
        id: item || `${fallbackIdPrefix}-${index}`,
      }
    })
  } catch (error) {
    console.error('Failed to parse floating blocks', error)
    return []
  }
}

const NotebookLayout = ({ demoToLoad = null }) => {
  const editorRef = useRef(null)
  const canvasRef = useRef(null)
  const saveTimeoutRef = useRef(null)
  const lastSnapshotRef = useRef(null)
  const [lastSaved, setLastSaved] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [sequenceBlocks, setSequenceBlocks] = useState([])
  const [proteinBlocks, setProteinBlocks] = useState([])
  const [tableBlocks, setTableBlocks] = useState([])
  const [protocolBlocks, setProtocolBlocks] = useState([])
  const [notebookTitle, setNotebookTitle] = useState('Untitled Notebook') // Phase 4 - New Data
  // Keep the currently loaded demo in state so we can pass initial props
  const [activeDemo, setActiveDemo] = useState(null)
  const [demoTables, setDemoTables] = useState({})
  const [demoProtocols, setDemoProtocols] = useState({})
  const [demoSequences, setDemoSequences] = useState({})
  const [pendingDemo, setPendingDemo] = useState(null)

  useEffect(() => {
    if (!editorRef.current) {
      return
    }
    try {
      const stored = window.localStorage.getItem(DOCUMENT_KEY)
      editorRef.current.innerHTML = stored || DEFAULT_HTML
    } catch (error) {
      console.error('Failed to load notebook document', error)
      editorRef.current.innerHTML = DEFAULT_HTML
    }
  }, [])

  useEffect(() => {
    if (demoToLoad && demoToLoad.id) {
      setPendingDemo(demoToLoad)
    } else {
      setPendingDemo(null)
      setActiveDemo(null)
      setDemoTables({})
      setDemoProtocols({})
      setDemoSequences({})
    }
  }, [demoToLoad])

  useEffect(() => {
    if (!pendingDemo || activeDemo) {
      return
    }

    const demo = pendingDemo

    const seqBlocks =
      Array.isArray(demo.sequences) && demo.sequences.length
        ? demo.sequences.map((s) => ({ id: s.id }))
        : [{ id: createBlockId('seq') }]

    const tableEntries =
      Array.isArray(demo.tables) && demo.tables.length
        ? demo.tables.map((t) => ({ id: t.id }))
        : [{ id: createBlockId('table') }]

    const protocolEntries =
      Array.isArray(demo.protocols) && demo.protocols.length
        ? demo.protocols.map((p) => ({ id: p.id }))
        : []

    const proteinEntries =
      Array.isArray(demo.proteinBlocks) && demo.proteinBlocks.length
        ? demo.proteinBlocks.map((id) => ({ id }))
        : []

    seqBlocks.forEach(({ id }) => {
      try {
        window.localStorage.removeItem(`sequence-block-${id}`)
      } catch {}
    })
    try {
      window.localStorage.removeItem('sequenceEditorData')
    } catch {}

    tableEntries.forEach(({ id }) => {
      try {
        window.localStorage.removeItem(`table-block-${id}`)
      } catch {}
    })

    protocolEntries.forEach(({ id }) => {
      try {
        window.localStorage.removeItem(`protocol-block-${id}`)
      } catch {}
    })

    setSequenceBlocks(seqBlocks)
    setProteinBlocks(proteinEntries)
    setTableBlocks(tableEntries)
    setProtocolBlocks(protocolEntries)
    setDemoTables({})
    setDemoProtocols({})
    setDemoSequences({})
    setLastSaved(null)

    const exampleTitle = `Example – ${demo.name}`
    setNotebookTitle(exampleTitle)
    if (editorRef.current) {
      editorRef.current.innerHTML = demo.documentHtml
    }
    try {
      window.localStorage.setItem(NOTEBOOK_TITLE_KEY, exampleTitle)
    } catch {}
    try {
      window.localStorage.setItem(DOCUMENT_KEY, demo.documentHtml)
    } catch {}
  }, [pendingDemo, activeDemo])

  useEffect(() => {
    // If we are explicitly loading a demo, skip default-first-load scaffolding
    if (demoToLoad && demoToLoad.id) {
      return
    }
    const storedSequences = window.localStorage.getItem(SEQUENCE_BLOCKS_KEY)
    const storedProteins = window.localStorage.getItem(PROTEIN_BLOCKS_KEY)
    const storedTables = window.localStorage.getItem(TABLE_BLOCKS_KEY)
    const storedProtocols = window.localStorage.getItem(PROTOCOL_BLOCKS_KEY)

    // Phase 7.6 - Default template: Check if it's truly a first load (no data or only empty arrays)
    const parseOrEmpty = (stored) => {
      if (!stored) return []
      try {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    
    const seqArray = parseOrEmpty(storedSequences)
    const proteinArray = parseOrEmpty(storedProteins)
    const tableArray = parseOrEmpty(storedTables)
    const protocolArray = parseOrEmpty(storedProtocols)
    
    // It's first load if ALL arrays are empty
    const isFirstLoad = seqArray.length === 0 && proteinArray.length === 0 && 
                        tableArray.length === 0 && protocolArray.length === 0
    
    console.log('🔍 First load check:', { isFirstLoad, seqArray, tableArray })
    
    if (isFirstLoad) {
      // Create default blocks on first load: Data Table + Sequence Editor
      const defaultTableId = createBlockId('table')
      const defaultSequenceId = createBlockId('seq')
      
      console.log('✨ Creating default template with IDs:', { defaultTableId, defaultSequenceId })
      
      setSequenceBlocks([{ id: defaultSequenceId }])
      setProteinBlocks([])
      setTableBlocks([{ id: defaultTableId }])
      setProtocolBlocks([])
      
      // Save default blocks to localStorage immediately
      window.localStorage.setItem(SEQUENCE_BLOCKS_KEY, JSON.stringify([{ id: defaultSequenceId }]))
      window.localStorage.setItem(TABLE_BLOCKS_KEY, JSON.stringify([{ id: defaultTableId }]))
      window.localStorage.setItem(PROTEIN_BLOCKS_KEY, JSON.stringify([]))
      window.localStorage.setItem(PROTOCOL_BLOCKS_KEY, JSON.stringify([]))
    } else {
      // Load existing blocks from localStorage
      console.log('📂 Loading existing blocks from localStorage')
      setSequenceBlocks(hydrateFloatingBlocks(storedSequences, 'seq', 80))
      setProteinBlocks(hydrateFloatingBlocks(storedProteins, 'protein', 420))
      setTableBlocks(hydrateFloatingBlocks(storedTables, 'table', 80))
      setProtocolBlocks(hydrateFloatingBlocks(storedProtocols, 'protocol', 420))
    }
    
    // Phase 4 - Load notebook title from localStorage
    const storedTitle = window.localStorage.getItem(NOTEBOOK_TITLE_KEY)
    if (storedTitle) {
      setNotebookTitle(storedTitle)
    }
  }, [demoToLoad])

  useEffect(() => {
    window.localStorage.setItem(
      SEQUENCE_BLOCKS_KEY,
      JSON.stringify(sequenceBlocks),
    )
  }, [sequenceBlocks])

  useEffect(() => {
    window.localStorage.setItem(
      PROTEIN_BLOCKS_KEY,
      JSON.stringify(proteinBlocks),
    )
  }, [proteinBlocks])

  useEffect(() => {
    window.localStorage.setItem(
      TABLE_BLOCKS_KEY,
      JSON.stringify(tableBlocks),
    )
  }, [tableBlocks])

  useEffect(() => {
    window.localStorage.setItem(
      PROTOCOL_BLOCKS_KEY,
      JSON.stringify(protocolBlocks),
    )
  }, [protocolBlocks])

  useEffect(
    () => () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current)
      }
    },
    [],
  )

  const parseStoredJSON = (key) => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch (error) {
      console.error(`Failed to parse stored data for ${key}`, error)
      return null
    }
  }

  const collectBlockPayloads = (blocks, prefix) => {
    const payloads = {}
    blocks.forEach((block) => {
      const storageKey = `${prefix}-block-${block.id}`
      const data = parseStoredJSON(storageKey)
      if (data !== null) {
        payloads[block.id] = data
      }
    })
    return payloads
  }

  // Phase 7.4 - Simplified: blocks now just have {id}, order is implicit from array position
  const collectSnapshot = () => {
    const documentHtml = editorRef.current?.innerHTML ?? DEFAULT_HTML
    return {
      documentHtml,
      notebookTitle, // Phase 4 - NEW DATA: Include notebook title for backend sync
      sequenceBlocks: sequenceBlocks.map(({ id }) => ({ id })),
      tableBlocks: tableBlocks.map(({ id }) => ({ id })),
      protocolBlocks: protocolBlocks.map(({ id }) => ({ id })),
      sequences: collectBlockPayloads(sequenceBlocks, 'sequence'),
      tables: collectBlockPayloads(tableBlocks, 'table'),
      protocols: collectBlockPayloads(protocolBlocks, 'protocol'),
    }
  }

  const snapshotsEqual = (a, b) => {
    if (a === b) {
      return true
    }
    if (!a || !b) {
      return false
    }
    try {
      return JSON.stringify(a) === JSON.stringify(b)
    } catch (error) {
      console.error('Failed to compare snapshots', error)
      return false
    }
  }

  const computeChanges = (current, previous) => {
    if (!previous) {
      return current
    }
    const delta = {}
    const documentDelta = diffDocumentHtml(
      current.documentHtml,
      previous.documentHtml,
    )
    if (documentDelta) {
      delta.documentHtml = documentDelta
    }
    ;[
      'sequenceBlocks',
      'tableBlocks',
      'protocolBlocks',
      'sequences',
      'tables',
      'protocols',
    ].forEach((key) => {
      if (!snapshotsEqual(current[key], previous[key])) {
        delta[key] = current[key]
      }
    })
    return delta
  }

  const scheduleSave = (html) => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      try {
        setIsSaving(true)
        window.localStorage.setItem(DOCUMENT_KEY, html)
        setLastSaved(new Date().toISOString())
      } catch (error) {
        console.error('Failed to save notebook document', error)
      } finally {
        setIsSaving(false)
      }
    }, SAVE_DEBOUNCE_MS)
  }

  const handleInput = () => {
    if (!editorRef.current) {
      return
    }
    scheduleSave(editorRef.current.innerHTML)
  }

  // Phase 7.4 - Simplified: just add {id}, components will stack vertically
  const addSequenceBlock = () => {
    const id = createBlockId('seq')
    setSequenceBlocks((prev) => [...prev, { id }])
  }

  const addProteinBlock = () => {
    const id = createBlockId('protein')
    setProteinBlocks((prev) => [...prev, { id }])
  }

  const addTableBlock = () => {
    const id = createBlockId('table')
    setTableBlocks((prev) => [...prev, { id }])
  }

  const addProtocolBlock = () => {
    const id = createBlockId('protocol')
    setProtocolBlocks((prev) => [...prev, { id }])
  }

  const removeSequenceBlock = (id) => {
    setSequenceBlocks((prev) => prev.filter((block) => block.id !== id))
    window.localStorage.removeItem(`sequence-block-${id}`)
  }

  const removeProteinBlock = (id) => {
    setProteinBlocks((prev) => prev.filter((block) => block.id !== id))
    window.localStorage.removeItem(`protein-block-${id}`)
  }

  const removeTableBlock = (id) => {
    setTableBlocks((prev) => prev.filter((block) => block.id !== id))
    window.localStorage.removeItem(`table-block-${id}`)
  }

  const removeProtocolBlock = (id) => {
    setProtocolBlocks((prev) => prev.filter((block) => block.id !== id))
    window.localStorage.removeItem(`protocol-block-${id}`)
  }

  const handleSaveNotebook = async () => {
    if (isSyncing) {
      return
    }
    const snapshot = collectSnapshot()
    const previous = lastSnapshotRef.current
    const changes = computeChanges(snapshot, previous)
    if (!changes || Object.keys(changes).length === 0) {
      return
    }

    setIsSyncing(true)
    try {
      const savedAt = new Date().toISOString()
      const payload = {
        savedAt,
        changes,
        snapshot,
      }
      const response = await fetch(SAVE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(`Failed to save notebook: ${response.status}`)
      }
      lastSnapshotRef.current = snapshot
      setLastSaved(savedAt)
    } catch (error) {
      console.error('Notebook save failed', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleAnalyzeNotebook = () => {
    try {
      window.dispatchEvent(new CustomEvent('analysis:reset'))
      window.dispatchEvent(
        new CustomEvent('analysis:mock-result', {
          detail: MOCK_ANALYSIS_RESULT,
        }),
      )
    } catch (error) {
      console.error('Notebook analyze mock dispatch failed', error)
    }
  }

  // Phase 7.4 - Removed handleFloatingDrag (no longer using drag-and-drop)

  const handleResetNotebook = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = DEFAULT_HTML
    }
    sequenceBlocks.forEach((block) =>
      window.localStorage.removeItem(`sequence-block-${block.id}`),
    )
    proteinBlocks.forEach((block) =>
      window.localStorage.removeItem(`protein-block-${block.id}`),
    )
    tableBlocks.forEach((block) =>
      window.localStorage.removeItem(`table-block-${block.id}`),
    )
    protocolBlocks.forEach((block) =>
      window.localStorage.removeItem(`protocol-block-${block.id}`),
    )
    setSequenceBlocks([])
    setProteinBlocks([])
    setTableBlocks([])
    setProtocolBlocks([])
    window.localStorage.removeItem(DOCUMENT_KEY)
    window.localStorage.removeItem(SEQUENCE_BLOCKS_KEY)
    window.localStorage.removeItem(PROTEIN_BLOCKS_KEY)
    window.localStorage.removeItem(TABLE_BLOCKS_KEY)
    window.localStorage.removeItem(PROTOCOL_BLOCKS_KEY)
    window.localStorage.removeItem(NOTEBOOK_TITLE_KEY)
    setLastSaved(null)
  }

  const loadExample = (example) => {
    // Track active demo so children can receive initialData/initialProtocol
    setActiveDemo(example)
    setDemoTables({})
    setDemoProtocols({})
    // Clear local storage content for a clean slate
    try {
      window.localStorage.removeItem(DOCUMENT_KEY)
      window.localStorage.removeItem(SEQUENCE_BLOCKS_KEY)
      window.localStorage.removeItem(PROTEIN_BLOCKS_KEY)
      window.localStorage.removeItem(TABLE_BLOCKS_KEY)
      window.localStorage.removeItem(PROTOCOL_BLOCKS_KEY)
      window.localStorage.removeItem(NOTEBOOK_TITLE_KEY)
    } catch {}

    // Reset local state
    setSequenceBlocks([])
    setProteinBlocks([])
    setTableBlocks([])
    setProtocolBlocks([])
    setLastSaved(null)

    // Replace notebook title + document content
    const title = `Example – ${example.name}`
    setNotebookTitle(title)
    if (editorRef.current) {
      editorRef.current.innerHTML = example.documentHtml
    }
    try { window.localStorage.setItem(NOTEBOOK_TITLE_KEY, title) } catch {}
    try { window.localStorage.setItem(DOCUMENT_KEY, example.documentHtml) } catch {}

    // Seed example components
    const sequencePrefills = {}

    // Sequences (write storage first, then mount blocks)
    if (Array.isArray(example.sequences) && example.sequences.length) {
      example.sequences.forEach((s) => {
        const payload = {
          name: s.name,
          sequence: s.sequence,
          savedAt: new Date().toISOString(),
        }
        try { window.localStorage.setItem(`sequence-block-${s.id}`, JSON.stringify(payload)) } catch {}
        try { window.localStorage.setItem('sequenceEditorData', JSON.stringify(payload)) } catch {}
        sequencePrefills[s.id] = payload
      })
      setSequenceBlocks(example.sequences.map((s) => ({ id: s.id })))
    }

    // Protein viewer block (no precomputed prediction, but add block)
    if (Array.isArray(example.proteinBlocks) && example.proteinBlocks.length) {
      setProteinBlocks(example.proteinBlocks.map((id) => ({ id })))
      // clear previous predictions
      example.proteinBlocks.forEach((id) => {
        try { window.localStorage.removeItem(`protein-block-${id}`) } catch {}
      })
    }

    // Tables (write storage first, then mount blocks)
    if (Array.isArray(example.tables) && example.tables.length) {
      const tablePrefills = {}
      example.tables.forEach((t) => {
        const tablePayload = { columns: t.columns, rows: t.rows }
        try { window.localStorage.setItem(`table-block-${t.id}`, JSON.stringify(tablePayload)) } catch {}
        tablePrefills[t.id] = tablePayload
      })
      setTableBlocks(example.tables.map((t) => ({ id: t.id })))
      setDemoTables(tablePrefills)
      // Notify tables to rehydrate AFTER mount
      setTimeout(() => {
        example.tables.forEach((t) => {
          window.dispatchEvent(new CustomEvent('datatable:seed', { detail: { storageKey: `table-block-${t.id}` } }))
        })
      }, 0)
    }

    // Protocols (write storage first, then mount blocks)
    if (Array.isArray(example.protocols) && example.protocols.length) {
      const protocolPrefills = {}
      example.protocols.forEach((p) => {
        const protoPayload = { title: p.title, description: p.description, steps: p.steps, notes: p.notes }
        try { window.localStorage.setItem(`protocol-block-${p.id}`, JSON.stringify(protoPayload)) } catch {}
        protocolPrefills[p.id] = protoPayload
      })
      setProtocolBlocks(example.protocols.map((p) => ({ id: p.id })))
      setDemoProtocols(protocolPrefills)
      // Notify protocols to rehydrate AFTER mount
      setTimeout(() => {
        example.protocols.forEach((p) => {
          window.dispatchEvent(new CustomEvent('protocol:seed', { detail: { storageKey: `protocol-block-${p.id}` } }))
        })
      }, 0)
    }

    setDemoSequences(sequencePrefills)

    // Reset shared analysis so views refetch when opened
    window.dispatchEvent(new CustomEvent('analysis:reset'))
    window.dispatchEvent(
      new CustomEvent('analysis:mock-result', {
        detail: MOCK_ANALYSIS_RESULT,
      }),
    )
  }

  // Phase 4 - Handler for notebook title changes
  const handleTitleChange = (newTitle) => {
    setNotebookTitle(newTitle)
    // Save to localStorage immediately
    window.localStorage.setItem(NOTEBOOK_TITLE_KEY, newTitle)
  }

  // Phase 6.2 PART B - Handler to insert colored sequence visualization into notebook
  // When a sequence is saved, this function inserts beautiful colored HTML into the notes
  const handleSequenceSaved = (visualHTML) => {
    if (!editorRef.current) return
    
    // Insert the colored sequence block at the end of the document
    // This preserves existing content and adds the new visualization
    editorRef.current.innerHTML += visualHTML
    
    // Trigger the save debounce so the visual output gets saved to localStorage
    scheduleSave()
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800">
      {/* Red Component Sidebar - Phase 3 */}
      <ComponentSidebar
        onAddSequence={addSequenceBlock}
        onAddProtein={addProteinBlock}
        onAddTable={addTableBlock}
        onAddProtocol={addProtocolBlock}
      />
      
      {/* Main content area with left margin for sidebar (192px for w-48 sidebar) */}
      <div className="flex min-h-screen flex-col ml-48 bg-gray-50">
        {/* Phase 4 - New Clean Header */}
        <Header
          onSave={handleSaveNotebook}
          onAnalyze={handleAnalyzeNotebook}
          isSaving={isSyncing}
          lastSaved={lastSaved}
          notebookTitle={notebookTitle}
          onTitleChange={handleTitleChange}
        />

        {pendingDemo && (
          <div className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex flex-col text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {pendingDemo.name}
              </span>
              <span>Click Fill to populate the tables and protocol with the demo data.</span>
            </div>
            <button
              type="button"
              onClick={() => loadExample(pendingDemo)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-notebook-red to-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-200 transition hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h10" />
                <path d="M15 17l3 3 3-3" />
              </svg>
              <span>Fill with sample data</span>
            </button>
          </div>
        )}

        {/* Phase 5 - Main content with infinite scroll support */}
        <main className="flex-1 overflow-auto scroll-smooth">
          {/* Text Formatting Toolbar - Phase 2 Step 2.1 */}
          <TextFormattingToolbar />
          
          {/* Phase 5 - Infinite scroll notebook area */}
          {/* Phase 7.4 - Clean white canvas for vertical stacking (no grid background) */}
          {/* Phase 7.5 - Components and text can interleave */}
          <div
            ref={canvasRef}
            className="relative min-h-screen w-full px-12 py-8 bg-white mx-4 my-4 rounded-lg shadow-md"
          >
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              className="w-full resize-none text-[17px] leading-relaxed text-slate-800 focus:outline-none focus-visible:ring-0 min-h-[200px]"
            />

            {/* Phase 7.5 - Components stack vertically with editable text areas between them */}
            {sequenceBlocks.map((block) => (
              <React.Fragment key={block.id}>
                <div className="w-full mb-6">
                  <div className="rounded-md border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2 bg-gray-50">
                      <div>
                        <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Sequence Editor
                        </h2>
                      </div>
                      {/* Phase 7.4 - Only remove button, no drag handle */}
                      <button
                        type="button"
                        onClick={() => removeSequenceBlock(block.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="px-4 py-3">
                      <SequenceEditor
                        storageKey={`sequence-block-${block.id}`}
                        hideTitle
                        compact
                        initialData={demoSequences[block.id] ?? null}
                        onSequenceSaved={handleSequenceSaved}
                      />
                    </div>
                  </div>
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="w-full min-h-[60px] mb-4 text-[17px] leading-relaxed text-slate-800 focus:outline-none focus-visible:ring-0 px-2 py-2 rounded border border-transparent hover:border-gray-200 focus:border-notebook-red-light transition"
                  placeholder="Type here..."
                />
              </React.Fragment>
            ))}

            {proteinBlocks.map((block) => (
              <React.Fragment key={block.id}>
                <div className="w-full mb-6">
                  <div className="rounded-md border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2 bg-gray-50">
                      <div>
                        <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Protein Viewer
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProteinBlock(block.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                  </div>
                    <div className="px-4 py-3">
                      <ProteinViewer
                        sequenceStorageKey="sequenceEditorData"
                        predictionStorageKey={`protein-block-${block.id}`}
                        compact
                      />
                    </div>
                  </div>
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="w-full min-h-[60px] mb-4 text-[17px] leading-relaxed text-slate-800 focus:outline-none focus-visible:ring-0 px-2 py-2 rounded border border-transparent hover:border-gray-200 focus:border-notebook-red-light transition"
                  placeholder="Type here..."
                />
              </React.Fragment>
            ))}

            {tableBlocks.map((block) => (
              <React.Fragment key={block.id}>
                <div className="w-full mb-6">
                  <div className="rounded-md border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2 bg-gray-50">
                      <div>
                        <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Data Table
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTableBlock(block.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                  </div>
                    <div className="px-4 py-3">
                      <DataTable
                        storageKey={`table-block-${block.id}`}
                        initialData={demoTables[block.id] ?? null}
                        compact
                      />
                    </div>
                  </div>
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="w-full min-h-[60px] mb-4 text-[17px] leading-relaxed text-slate-800 focus:outline-none focus-visible:ring-0 px-2 py-2 rounded border border-transparent hover:border-gray-200 focus:border-notebook-red-light transition"
                  placeholder="Type here..."
                />
              </React.Fragment>
            ))}

            {protocolBlocks.map((block) => (
              <React.Fragment key={block.id}>
                <div className="w-full mb-6">
                  <div className="rounded-md border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2 bg-gray-50">
                      <div>
                        <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Protocol
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProtocolBlock(block.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                  </div>
                    <div className="px-4 py-3">
                      <ProtocolUploader
                        storageKey={`protocol-block-${block.id}`}
                        initialProtocol={demoProtocols[block.id] ?? null}
                        compact
                      />
                    </div>
                  </div>
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="w-full min-h-[60px] mb-4 text-[17px] leading-relaxed text-slate-800 focus:outline-none focus-visible:ring-0 px-2 py-2 rounded border border-transparent hover:border-gray-200 focus:border-notebook-red-light transition"
                  placeholder="Type here..."
                />
              </React.Fragment>
            ))}
          </div>
        </main>

        {/* Footer removed - Component buttons now in sidebar (Phase 3) */}
      </div>
      
      {/* Phase 5 - Scroll to top button */}
      <ScrollToTopButton />
    </div>
  )
}

export default NotebookLayout
