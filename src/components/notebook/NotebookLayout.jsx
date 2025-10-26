import React, { useEffect, useRef, useState } from 'react'
import SequenceEditor from '../input/SequenceEditor.jsx'
import ProteinViewer from '../input/ProteinViewer.jsx'
import DataTable from '../input/DataTable.jsx'
import ProtocolUploader from '../input/ProtocolUploader.jsx'
import TextFormattingToolbar from '../ui/TextFormattingToolbar.jsx'
import ComponentSidebar from '../ui/ComponentSidebar.jsx'
import Header from '../ui/Header.jsx'
import ScrollToTopButton from '../ui/ScrollToTopButton.jsx'

const DOCUMENT_KEY = 'labNotebookDocument'
const SEQUENCE_BLOCKS_KEY = 'labNotebookSequenceBlocks'
const PROTEIN_BLOCKS_KEY = 'labNotebookProteinBlocks'
const TABLE_BLOCKS_KEY = 'labNotebookTableBlocks'
const PROTOCOL_BLOCKS_KEY = 'labNotebookProtocolBlocks'
const NOTEBOOK_TITLE_KEY = 'labNotebookTitle' // Phase 4 - New Data
const SAVE_DEBOUNCE_MS = 600
const SAVE_ENDPOINT = 'http://localhost:8000/api/notebook/save'
const ANALYZE_ENDPOINT = 'http://localhost:8000/api/letta/analyze'
const MOCK_ANALYSIS_RESULT = {
  breakthrough_summary:
    'Computational modeling indicates that modifying the ATP-binding pocket of CFTR can enhance chloride channel activity while maintaining proper protein folding and membrane localization.',
  recommended_protein_edit: {
    target_protein: 'CFTR',
    edit_type: 'site-directed mutagenesis',
    edit_details:
      'Introduce F508S substitution combined with R553Q to stabilize NBD1-NBD2 interface and improve ATP hydrolysis coupling.',
    rationale:
      'F508 deletion is the most common CF mutation; restoring stability at this region while optimizing nucleotide binding should enhance channel gating without compromising trafficking.',
  },
  expected_outcome:
    'Increased chloride transport efficiency by 40-60% compared to ΔF508 mutant, with improved plasma membrane retention.',
  confidence: 0.73,
  next_steps: [
    'Perform molecular dynamics simulations on the double mutant to validate stability predictions.',
    'Design expression constructs for mammalian cell testing.',
    'Plan electrophysiology experiments to measure single-channel conductance and open probability.',
  ],
  analysis_summary:
    'CFTR function depends on proper NBD domain assembly and ATP-driven conformational changes. The proposed edits target both folding stability and catalytic efficiency. Cross-reference with ABC transporter studies shows similar interface modifications enhance activity across the superfamily.',
  edited_protein: {
    id: 'ABCC7',
    label: 'CFTR',
    description:
      'Chloride channel regulated by ATP binding and hydrolysis at nucleotide-binding domains.',
    mutations: [
      'F508S: replaces phenylalanine with serine to restore NBD1 surface stability',
      'R553Q: glutamine substitution to optimize NBD1-ICL4 interface contacts',
    ],
    confidence: 0.71,
  },
  graph: {
    nodes: [
      {
        id: 'P1',
        label: 'CFTR',
        type: 'protein',
        isEdited: true,
        notes:
          'ATP-gated chloride channel; mutations target NBD1 stability and ATP coupling.',
      },
      {
        id: 'E1',
        label: 'ATP',
        type: 'entity',
        isEdited: false,
        notes: 'Nucleotide substrate that drives channel gating.',
      },
      {
        id: 'P2',
        label: 'NBD1',
        type: 'protein',
        isEdited: false,
        notes: 'First nucleotide-binding domain; contains F508 position.',
      },
      {
        id: 'P3',
        label: 'NBD2',
        type: 'protein',
        isEdited: false,
        notes: 'Second nucleotide-binding domain; forms heterodimer with NBD1.',
      },
      {
        id: 'E2',
        label: 'Chloride',
        type: 'entity',
        isEdited: false,
        notes: 'Ion conducted through CFTR pore.',
      },
      {
        id: 'P4',
        label: 'PKA',
        type: 'protein',
        isEdited: false,
        notes:
          'Protein kinase A; phosphorylates CFTR regulatory domain to enable activation.',
      },
    ],
    edges: [
      {
        source: 'E1',
        target: 'P2',
        interaction: 'binds',
        mechanism:
          'ATP occupies NBD1 binding site to stabilize closed dimer conformation.',
      },
      {
        source: 'E1',
        target: 'P3',
        interaction: 'binds',
        mechanism:
          'ATP binding at NBD2 triggers hydrolysis and channel opening.',
      },
      {
        source: 'P2',
        target: 'P3',
        interaction: 'heterodimerizes',
        mechanism:
          'NBD1 and NBD2 form head-to-tail dimer with two ATP-binding sites at interface.',
      },
      {
        source: 'P2',
        target: 'P1',
        interaction: 'regulates',
        mechanism:
          'NBD1 conformational changes propagate to transmembrane domains to gate pore.',
      },
      {
        source: 'P3',
        target: 'P1',
        interaction: 'regulates',
        mechanism:
          'NBD2 ATP hydrolysis drives channel closing cycle.',
      },
      {
        source: 'P1',
        target: 'E2',
        interaction: 'transports',
        mechanism:
          'Chloride ions pass through CFTR transmembrane pore when channel is open.',
      },
      {
        source: 'P4',
        target: 'P1',
        interaction: 'activates',
        mechanism:
          'PKA phosphorylation of regulatory domain relieves autoinhibition of CFTR.',
      },
    ],
  },
}

const DEFAULT_HTML = `<h1>Untitled Notebook</h1><p><em>Start typing anywhere in this document…</em></p>`

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

const hydrateFloatingBlocks = (stored, fallbackIdPrefix, baseX = 80) => {
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
          x: typeof item.x === 'number' ? item.x : baseX,
          y: typeof item.y === 'number' ? item.y : 200 + index * 220,
        }
      }
      return {
        id: item || `${fallbackIdPrefix}-${index}`,
        x: baseX,
        y: 200 + index * 220,
      }
    })
  } catch (error) {
    console.error('Failed to parse floating blocks', error)
    return []
  }
}

const NotebookLayout = () => {
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
    const storedSequences = window.localStorage.getItem(SEQUENCE_BLOCKS_KEY)
    const storedProteins = window.localStorage.getItem(PROTEIN_BLOCKS_KEY)
    const storedTables = window.localStorage.getItem(TABLE_BLOCKS_KEY)
    const storedProtocols = window.localStorage.getItem(PROTOCOL_BLOCKS_KEY)

    setSequenceBlocks(hydrateFloatingBlocks(storedSequences, 'seq', 80))
    setProteinBlocks(hydrateFloatingBlocks(storedProteins, 'protein', 420))
    setTableBlocks(hydrateFloatingBlocks(storedTables, 'table', 80))
    setProtocolBlocks(hydrateFloatingBlocks(storedProtocols, 'protocol', 420))
    
    // Phase 4 - Load notebook title from localStorage
    const storedTitle = window.localStorage.getItem(NOTEBOOK_TITLE_KEY)
    if (storedTitle) {
      setNotebookTitle(storedTitle)
    }
  }, [])

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

  const collectSnapshot = () => {
    const documentHtml = editorRef.current?.innerHTML ?? DEFAULT_HTML
    return {
      documentHtml,
      notebookTitle, // Phase 4 - NEW DATA: Include notebook title for backend sync
      sequenceBlocks: sequenceBlocks.map(({ id, x, y }) => ({ id, x, y })),
      tableBlocks: tableBlocks.map(({ id, x, y }) => ({ id, x, y })),
      protocolBlocks: protocolBlocks.map(({ id, x, y }) => ({ id, x, y })),
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

  const addSequenceBlock = () => {
    const id = createBlockId('seq')
    const baseY = 220 + sequenceBlocks.length * 240
    setSequenceBlocks((prev) => [...prev, { id, x: 80, y: baseY }])
  }

  const addProteinBlock = () => {
    const id = createBlockId('protein')
    const baseY = 240 + proteinBlocks.length * 260
    setProteinBlocks((prev) => [...prev, { id, x: 420, y: baseY }])
  }

  const addTableBlock = () => {
    const id = createBlockId('table')
    const baseY = 260 + tableBlocks.length * 260
    setTableBlocks((prev) => [...prev, { id, x: 80, y: baseY }])
  }

  const addProtocolBlock = () => {
    const id = createBlockId('protocol')
    const baseY = 260 + protocolBlocks.length * 260
    setProtocolBlocks((prev) => [...prev, { id, x: 420, y: baseY }])
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

  const handleAnalyzeNotebook = async () => {
    // const response = await fetch(ANALYZE_ENDPOINT, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({}),
    // })
    // if (!response.ok) {
    //   throw new Error(`Analyze request failed: ${response.status}`)
    // }

    try {
      window.dispatchEvent(
        new CustomEvent('analysis:mock-result', {
          detail: MOCK_ANALYSIS_RESULT,
        }),
      )
    } catch (error) {
      console.error('Notebook analyze request failed', error)
    }
  }

  const handleFloatingDrag = (event, blockId, kind) => {
    event.preventDefault()
    const target = event.currentTarget
    const blocks =
      kind === 'sequence'
        ? sequenceBlocks
        : kind === 'protein'
        ? proteinBlocks
        : kind === 'table'
        ? tableBlocks
        : protocolBlocks
    const setBlocks =
      kind === 'sequence'
        ? setSequenceBlocks
        : kind === 'protein'
        ? setProteinBlocks
        : kind === 'table'
        ? setTableBlocks
        : setProtocolBlocks

    const block = blocks.find((item) => item.id === blockId)
    if (!block) {
      return
    }

    const startX = event.clientX
    const startY = event.clientY
    const originX = block.x ?? 80
    const originY = block.y ?? 200
    const pointerId = event.pointerId
    target.setPointerCapture?.(pointerId)

    const handlePointerMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY
      let nextX = originX + deltaX
      let nextY = originY + deltaY
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (canvasRect) {
        nextX = Math.max(16, Math.min(canvasRect.width - 360, nextX))
        nextY = Math.max(16, Math.min(canvasRect.height - 200, nextY))
      }
      setBlocks((prev) =>
        prev.map((item) =>
          item.id === blockId ? { ...item, x: nextX, y: nextY } : item,
        ),
      )
    }

    const handlePointerUp = () => {
      target.releasePointerCapture?.(pointerId)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

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
    <div className="min-h-screen bg-white text-slate-800">
      {/* Red Component Sidebar - Phase 3 */}
      <ComponentSidebar
        onAddSequence={addSequenceBlock}
        onAddProtein={addProteinBlock}
        onAddTable={addTableBlock}
        onAddProtocol={addProtocolBlock}
      />
      
      {/* Main content area with left margin for sidebar */}
      <div className="flex min-h-screen flex-col ml-60">
        {/* Phase 4 - New Clean Header */}
        <Header
          onSave={handleSaveNotebook}
          onAnalyze={handleAnalyzeNotebook}
          isSaving={isSyncing}
          lastSaved={lastSaved}
          notebookTitle={notebookTitle}
          onTitleChange={handleTitleChange}
        />

        {/* Phase 5 - Main content with infinite scroll support */}
        <main className="flex-1 overflow-auto scroll-smooth">
          {/* Text Formatting Toolbar - Phase 2 Step 2.1 */}
          <TextFormattingToolbar />
          
          {/* Phase 5 - Infinite scroll notebook area */}
          <div
            ref={canvasRef}
            className="relative min-h-screen w-full px-12 py-8 bg-white"
          >
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              className="w-full resize-none text-[17px] leading-relaxed text-slate-800 focus:outline-none focus-visible:ring-0 min-h-[200px]"
            />

            {sequenceBlocks.map((block) => (
              <div
                key={block.id}
                className="group absolute z-30 w-full max-w-[420px]"
                style={{
                  top: block.y ?? 200,
                  left: block.x ?? 80,
                }}
              >
                {/* Phase 6.1 - Simplified minimal styling */}
                <div className="rounded-md border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2 bg-gray-50">
                    <div>
                      <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Sequence Editor
                      </h2>
                      {/* Phase 6.1 - Storage key hidden from user but still used internally */}
                    </div>
                    {/* Phase 6.1 - Minimal action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onPointerDown={(event) =>
                          handleFloatingDrag(event, block.id, 'sequence')
                        }
                        className="p-1 text-gray-400 hover:text-gray-600 transition"
                        title="Drag to move"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
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
                  </div>
                  <div className="px-4 py-3">
                    <SequenceEditor
                      storageKey={`sequence-block-${block.id}`}
                      hideTitle
                      compact
                      onSequenceSaved={handleSequenceSaved}
                    />
                  </div>
                </div>
              </div>
            ))}

            {proteinBlocks.map((block) => (
              <div
                key={block.id}
                className="group absolute z-20 w-full max-w-[520px]"
                style={{
                  top: block.y ?? 240,
                  left: block.x ?? 420,
                }}
              >
                {/* Phase 6.1 - Simplified minimal styling */}
                <div className="rounded-md border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2 bg-gray-50">
                    <div>
                      <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Protein Viewer
                      </h2>
                      {/* Phase 6.1 - Storage key hidden from user but still used internally */}
                    </div>
                    {/* Phase 6.1 - Minimal action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onPointerDown={(event) =>
                          handleFloatingDrag(event, block.id, 'protein')
                        }
                        className="p-1 text-gray-400 hover:text-gray-600 transition"
                        title="Drag to move"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
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
            ))}

            {tableBlocks.map((block) => (
              <div
                key={block.id}
                className="group absolute z-10 w-full max-w-[640px]"
                style={{
                  top: block.y ?? 260,
                  left: block.x ?? 80,
                }}
              >
                {/* Phase 6.1 - Simplified minimal styling */}
                <div className="rounded-md border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2 bg-gray-50">
                    <div>
                      <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Data Table
                      </h2>
                      {/* Phase 6.1 - Storage key hidden from user but still used internally */}
                    </div>
                    {/* Phase 6.1 - Minimal action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onPointerDown={(event) =>
                          handleFloatingDrag(event, block.id, 'table')
                        }
                        className="p-1 text-gray-400 hover:text-gray-600 transition"
                        title="Drag to move"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
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
                  </div>
                  <div className="px-4 py-3">
                    <DataTable
                      storageKey={`table-block-${block.id}`}
                      compact
                    />
                  </div>
                </div>
              </div>
            ))}

            {protocolBlocks.map((block) => (
              <div
                key={block.id}
                className="group absolute z-10 w-full max-w-[480px]"
                style={{
                  top: block.y ?? 260,
                  left: block.x ?? 420,
                }}
              >
                {/* Phase 6.1 - Simplified minimal styling */}
                <div className="rounded-md border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2 bg-gray-50">
                    <div>
                      <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Protocol
                      </h2>
                      {/* Phase 6.1 - Storage key hidden from user but still used internally */}
                    </div>
                    {/* Phase 6.1 - Minimal action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onPointerDown={(event) =>
                          handleFloatingDrag(event, block.id, 'protocol')
                        }
                        className="p-1 text-gray-400 hover:text-gray-600 transition"
                        title="Drag to move"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
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
                  </div>
                  <div className="px-4 py-3">
                    <ProtocolUploader
                      storageKey={`protocol-block-${block.id}`}
                      compact
                    />
                  </div>
                </div>
              </div>
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
