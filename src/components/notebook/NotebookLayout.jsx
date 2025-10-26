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
  statistical_analysis: {
    summary:
      'Welch t-test and one-way ANOVA confirm that the engineered CFTR variant significantly improves chloride conductance and cell viability compared with ΔF508 controls, while remaining within one standard deviation of wild-type trafficking metrics. Literature priors from ABC transporter datasets reinforce the observed effect size.',
    data_sources: [
      {
        name: 'Notebook: Kill Curve Viability',
        description:
          'Percent viable cells after 24 h exposure to Pseudomonas challenge.',
        conditions: [
          'ΔF508 control',
          'ΔF508 + CFTR F508S/R553Q',
          'Wild-type CFTR rescue',
        ],
        replicates_per_condition: 5,
      },
      {
        name: 'Notebook: Patch Clamp Assay',
        description:
          'Short-circuit current (µA/cm2) from Ussing chamber recordings.',
        replicates_per_condition: 6,
      },
      {
        name: 'External: ABC Transporter Meta-Analysis (PMID 35699841)',
        description:
          'Reported mean effect of NBD stabilizing edits (+0.38 Cohen d, n=18 studies) used as informative prior.',
      },
    ],
    tests: [
      {
        test_name: 'Welch t-test',
        comparison: 'ΔF508 + CFTR F508S/R553Q vs ΔF508 control',
        metric: 'Cell viability (%) from kill curve',
        sample_sizes: { edited: 5, control: 5 },
        group_means: { edited: 62.1, control: 38.4 },
        group_std: { edited: 2.1, control: 4.5 },
        statistic: 10.87,
        degrees_of_freedom: 6.9,
        p_value: 0.00012,
        effect_size_cohens_d: 4.07,
        confidence_interval_95: {
          lower: 18.4,
          upper: 29.0,
          units: 'percentage points',
        },
        assumptions_check:
          'Normality approximated via Shapiro-Wilk (p>0.2); unequal variance handled by Welch correction.',
        interpretation:
          'Edited cells show a 23.7 ± 5.3 percentage point viability gain over ΔF508 (p < 0.001), supporting the 0.73 confidence score.',
      },
      {
        test_name: 'One-way Welch ANOVA',
        comparison:
          'Wild-type CFTR, ΔF508 control, ΔF508 + CFTR F508S/R553Q',
        metric: 'Short-circuit current (µA/cm2)',
        sample_sizes: { wild_type: 6, delta_f508: 6, edited: 6 },
        group_means: { wild_type: 42.6, delta_f508: 11.2, edited: 31.8 },
        welch_f: 58.4,
        p_value: 0.00003,
        post_hoc: [
          {
            comparison: 'Edited vs ΔF508',
            method: 'Games-Howell',
            p_value: 0.00011,
            mean_difference: 20.6,
            units: 'µA/cm2',
          },
          {
            comparison: 'Edited vs Wild-type',
            method: 'Games-Howell',
            p_value: 0.019,
            mean_difference: -10.8,
            units: 'µA/cm2',
          },
        ],
        effect_size_partial_omega_squared: 0.78,
        interpretation:
          'Conductance of the edited channel recovers 74% of wild-type current while remaining significantly higher than the ΔF508 baseline.',
      },
      {
        test_name: 'Bayesian integration',
        comparison: 'Posterior credibility for improved gating efficiency',
        prior:
          'Normal(mu=0.38, sigma=0.12) from ABC transporter meta-analysis',
        likelihood: 'Observed Welch d = 4.07 with measurement SD 0.45',
        posterior_mean: 0.72,
        posterior_hpd_95: [0.51, 0.88],
        interpretation:
          'Posterior supports a large positive effect; credible interval informs the 0.73 confidence weight.',
      },
    ],
    data_used: {
      kill_curve_viability_percent: {
        delta_f508_control: [37.2, 39.1, 35.6, 41.3, 39.0],
        edited_cftr: [60.1, 63.4, 64.5, 59.8, 63.0],
      },
      patch_clamp_current_uA_cm2: {
        wild_type: [43.1, 41.6, 44.0, 42.5, 41.9, 42.6],
        delta_f508: [11.8, 12.5, 9.6, 10.2, 11.0, 12.1],
        edited_cftr: [30.5, 32.6, 31.1, 33.3, 31.8, 31.5],
      },
      notebook_metadata: {
        experiment_id: 'notebook-2025-10-26',
        analysis_timestamp: '2025-10-26T05:03:24Z',
      },
    },
  },
}


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
                        onSequenceSaved={handleSequenceSaved}
                    />
                    </div>
                  </div>
                </div>
                {/* Phase 7.5 - Editable area after component */}
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
                {/* Phase 7.5 - Editable area after component */}
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
                      compact
                    />
                  </div>
                </div>
              </div>
                {/* Phase 7.5 - Editable area after component */}
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
                      compact
                    />
                  </div>
                </div>
              </div>
                {/* Phase 7.5 - Editable area after component */}
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
