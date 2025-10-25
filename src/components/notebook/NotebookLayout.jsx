import React, { useEffect, useRef, useState } from 'react'
import SequenceEditor from '../input/SequenceEditor.jsx'
import ProteinViewer from '../input/ProteinViewer.jsx'
import DataTable from '../input/DataTable.jsx'
import ProtocolUploader from '../input/ProtocolUploader.jsx'

const DOCUMENT_KEY = 'labNotebookDocument'
const SEQUENCE_BLOCKS_KEY = 'labNotebookSequenceBlocks'
const PROTEIN_BLOCKS_KEY = 'labNotebookProteinBlocks'
const TABLE_BLOCKS_KEY = 'labNotebookTableBlocks'
const PROTOCOL_BLOCKS_KEY = 'labNotebookProtocolBlocks'
const SAVE_DEBOUNCE_MS = 600
const SAVE_ENDPOINT = 'http://localhost:8000/api/notebook/save'

const DEFAULT_HTML = `<h1>Untitled Notebook</h1><p><em>Start typing anywhere in this document…</em></p>`

const htmlToLines = (html) => {
  if (!html) {
    return []
  }
  const temp = document.createElement('div')
  temp.innerHTML = html
  const text = temp.innerText || temp.textContent || ''
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

const summarizeTableRow = (row, columns) => {
  return columns
    .map((column) => {
      const value = row[column] ?? ''
      return `${column}: ${value || '—'}`
    })
    .join('; ')
}

const buildReadableReport = (changes, snapshot, savedAt) => {
  const lines = []
  lines.push(`Notebook Save @ ${new Date(savedAt).toLocaleString()}`)

  if (changes.documentHtml) {
    const noteLines = htmlToLines(snapshot.documentHtml)
    lines.push('')
    lines.push('Notes:')
    if (noteLines.length === 0) {
      lines.push('- (no note content)')
    } else {
      noteLines.forEach((note, index) => {
        lines.push(`${index + 1}. ${note}`)
      })
    }
  }

  if (changes.sequences) {
    const sequenceIds = Object.keys(changes.sequences)
    if (sequenceIds.length > 0) {
      lines.push('')
      lines.push('Sequences:')
      sequenceIds.forEach((id, index) => {
        const data = snapshot.sequences?.[id]
        if (!data) {
          lines.push(`${index + 1}. ${id}: (removed)`)
          return
        }
        const length = data.sequence?.length ?? 0
        lines.push(
          `${index + 1}. ${data.name || id} — ${length} residues (last saved ${
            data.savedAt ? new Date(data.savedAt).toLocaleString() : 'unknown'
          })`,
        )
      })
    }
  }

  if (changes.tables) {
    const tableIds = Object.keys(changes.tables)
    if (tableIds.length > 0) {
      lines.push('')
      lines.push('Tables:')
      tableIds.forEach((id, tableIndex) => {
        const data = snapshot.tables?.[id]
        if (!data) {
          lines.push(`${tableIndex + 1}. ${id}: (removed)`)
          return
        }
        lines.push(`${tableIndex + 1}. ${id}:`)
        const { columns = [], rows = [] } = data
        if (rows.length === 0) {
          lines.push('   - (no rows)')
        } else {
          rows.forEach((row) => {
            lines.push(
              `   - Row ${row.id}: ${summarizeTableRow(row, columns)}`,
            )
          })
        }
      })
    }
  }

  if (changes.protocols) {
    const protocolIds = Object.keys(changes.protocols)
    if (protocolIds.length > 0) {
      lines.push('')
      lines.push('Protocols:')
      protocolIds.forEach((id, protocolIndex) => {
        const data = snapshot.protocols?.[id]
        if (!data) {
          lines.push(`${protocolIndex + 1}. ${id}: (removed)`)
          return
        }
        lines.push(
          `${protocolIndex + 1}. ${data.title || id} — ${
            data.description ? data.description : 'No overview provided'
          }`,
        )
        if (Array.isArray(data.steps) && data.steps.length > 0) {
          data.steps.forEach((step, stepIndex) => {
            const formattedStep = step?.trim()
            if (formattedStep) {
              lines.push(`   Step ${stepIndex + 1}: ${formattedStep}`)
            }
          })
        }
        if (data.notes) {
          lines.push(`   Notes: ${data.notes}`)
        }
      })
    }
  }

  if (
    changes.sequenceBlocks ||
    changes.tableBlocks ||
    changes.protocolBlocks
  ) {
    lines.push('')
    lines.push('Layout Updates:')
    if (changes.sequenceBlocks) {
      lines.push('- Sequence block positions changed.')
    }
    if (changes.tableBlocks) {
      lines.push('- Table block positions changed.')
    }
    if (changes.protocolBlocks) {
      lines.push('- Protocol block positions changed.')
    }
  }

  if (lines.length === 1) {
    lines.push('')
    lines.push('No detectable changes.')
  }

  return lines.join('\n')
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
    Object.entries(current).forEach(([key, value]) => {
      if (!snapshotsEqual(value, previous[key])) {
        delta[key] = value
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
      const report = buildReadableReport(changes, snapshot, savedAt)
      const payload = {
        savedAt,
        report,
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
    setLastSaved(null)
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h1 className="text-lg font-semibold text-slate-700">Lab Notebook</h1>
          <div className="flex items-center gap-4 text-sm">
            <button
              type="button"
              onClick={handleSaveNotebook}
              disabled={isSyncing}
              className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-500 transition hover:border-bio-primary hover:text-bio-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSyncing ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleResetNotebook}
              className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-500 transition hover:border-red-300 hover:text-red-500"
            >
              Reset Notebook
            </button>
            <span className="text-sm text-slate-400">
              {isSaving
                ? 'Saving…'
                : lastSaved
                ? `Saved ${new Date(lastSaved).toLocaleTimeString()}`
                : 'Not saved yet'}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div
            ref={canvasRef}
            className="relative min-h-[calc(100vh-72px)] w-full"
          >
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              className="w-full resize-none px-16 py-12 text-[17px] leading-relaxed text-slate-800 focus:outline-none focus-visible:ring-0"
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
                <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-500/10 backdrop-blur">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Sequence Editor
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Key:{' '}
                        <code className="font-mono text-xs text-slate-500">{`sequence-block-${block.id}`}</code>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onPointerDown={(event) =>
                          handleFloatingDrag(event, block.id, 'sequence')
                        }
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-bio-primary hover:text-bio-primary"
                      >
                        Drag
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSequenceBlock(block.id)}
                        className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <SequenceEditor
                      storageKey={`sequence-block-${block.id}`}
                      hideTitle
                      compact
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
                <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-500/10 backdrop-blur">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Protein Viewer
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Key:{' '}
                        <code className="font-mono text-xs text-slate-500">{`protein-block-${block.id}`}</code>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onPointerDown={(event) =>
                          handleFloatingDrag(event, block.id, 'protein')
                        }
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-bio-primary hover:text-bio-primary"
                      >
                        Drag
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProteinBlock(block.id)}
                        className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Remove
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
                <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-500/10 backdrop-blur">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Data Table
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Key:{' '}
                        <code className="font-mono text-xs text-slate-500">{`table-block-${block.id}`}</code>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onPointerDown={(event) =>
                          handleFloatingDrag(event, block.id, 'table')
                        }
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-bio-primary hover:text-bio-primary"
                      >
                        Drag
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTableBlock(block.id)}
                        className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Remove
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
                <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-500/10 backdrop-blur">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Protocol
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Key:{' '}
                        <code className="font-mono text-xs text-slate-500">{`protocol-block-${block.id}`}</code>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onPointerDown={(event) =>
                          handleFloatingDrag(event, block.id, 'protocol')
                        }
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-bio-primary hover:text-bio-primary"
                      >
                        Drag
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProtocolBlock(block.id)}
                        className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Remove
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

        <footer className="border-t border-slate-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-500">
              Need tools? Drop them into your notebook:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addSequenceBlock}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-bio-primary hover:text-bio-primary"
              >
                + Sequence Editor
              </button>
              <button
                type="button"
                onClick={addProteinBlock}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-bio-primary hover:text-bio-primary"
              >
                + Protein Viewer
              </button>
              <button
                type="button"
                onClick={addTableBlock}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-bio-primary hover:text-bio-primary"
              >
                + Data Table
              </button>
              <button
                type="button"
                onClick={addProtocolBlock}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-bio-primary hover:text-bio-primary"
              >
                + Protocol Upload
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default NotebookLayout
