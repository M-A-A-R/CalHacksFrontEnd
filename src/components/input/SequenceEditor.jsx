import React, { useEffect, useMemo, useState } from 'react'

const VALID_AMINO_ACIDS = 'ACDEFGHIKLMNPQRSTVWY'

const AMINO_ACID_CATEGORY_MAP = {
  A: 'hydrophobic',
  C: 'polar',
  D: 'acidic',
  E: 'acidic',
  F: 'hydrophobic',
  G: 'special',
  H: 'basic',
  I: 'hydrophobic',
  K: 'basic',
  L: 'hydrophobic',
  M: 'hydrophobic',
  N: 'polar',
  P: 'special',
  Q: 'polar',
  R: 'basic',
  S: 'polar',
  T: 'polar',
  V: 'hydrophobic',
  W: 'hydrophobic',
  Y: 'hydrophobic',
}

const CATEGORY_META = {
  hydrophobic: {
    label: 'Hydrophobic / Nonpolar',
    className: 'bg-amber-100 text-amber-900 border border-amber-300 shadow',
  },
  polar: {
    label: 'Polar / Uncharged',
    className: 'bg-sky-100 text-sky-900 border border-sky-300 shadow',
  },
  acidic: {
    label: 'Acidic (Negative)',
    className: 'bg-rose-100 text-rose-900 border border-rose-300 shadow',
  },
  basic: {
    label: 'Basic (Positive)',
    className: 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow',
  },
  special: {
    label: 'Special Cases',
    className: 'bg-violet-100 text-violet-900 border border-violet-300 shadow',
  },
}

const getCategoryForResidue = (residue) =>
  CATEGORY_META[AMINO_ACID_CATEGORY_MAP[residue]] ? AMINO_ACID_CATEGORY_MAP[residue] : null

/**
 * PART B: VISUAL SEQUENCE OUTPUT
 * Generates beautiful colored HTML for amino acid sequences
 * Colors are based on biochemical properties (hydrophobic, polar, acidic, basic, special)
 */
const generateColoredSequenceHTML = (name, sequence) => {
  // Calculate amino acid property statistics
  const stats = { hydrophobic: 0, polar: 0, acidic: 0, basic: 0, special: 0 }
  for (const aa of sequence) {
    const category = AMINO_ACID_CATEGORY_MAP[aa]
    if (category) stats[category]++
  }

  // Generate colored amino acid spans (grouped by 10s, line break every 60)
  let htmlSequence = ''
  for (let i = 0; i < sequence.length; i++) {
    const aa = sequence[i]
    const category = AMINO_ACID_CATEGORY_MAP[aa] || 'special'
    const meta = CATEGORY_META[category]
    
    // Create colored letter with tooltip
    htmlSequence += `<span class="inline-block px-1 py-0.5 mx-0.5 rounded text-xs font-mono font-semibold ${meta.className}" title="${meta.label}">${aa}</span>`
    
    // Add space every 10 amino acids for readability
    if ((i + 1) % 10 === 0 && i !== sequence.length - 1) {
      htmlSequence += ' '
    }
    
    // Add line break every 60 amino acids (standard bioinformatics format)
    if ((i + 1) % 60 === 0 && i !== sequence.length - 1) {
      htmlSequence += '<br>'
    }
  }

  // Calculate percentages for stats
  const total = sequence.length
  const percentages = Object.keys(stats).map(key => ({
    label: CATEGORY_META[key].label,
    count: stats[key],
    percent: ((stats[key] / total) * 100).toFixed(1)
  })).filter(s => s.count > 0)

  // Get current timestamp
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  // Build the complete HTML block
  return `
    <div class="my-4 p-4 border-2 border-notebook-red rounded-lg bg-white shadow-md">
      <div class="flex items-center justify-between mb-3 pb-2 border-b-2 border-gray-200">
        <h3 class="text-lg font-bold text-notebook-red">📊 ${name}</h3>
        <span class="text-xs text-gray-500">${sequence.length} amino acids • Saved ${timeString}</span>
      </div>
      
      <div class="mb-3 p-3 bg-gray-50 rounded font-mono text-sm leading-relaxed">
        ${htmlSequence}
      </div>
      
      <div class="text-xs text-gray-600">
        <strong>Composition:</strong>
        ${percentages.map(s => `${s.label}: ${s.count} (${s.percent}%)`).join(' • ')}
      </div>
    </div>
  `
}

const SequenceEditor = ({
  storageKey = 'sequenceEditorData',
  title = 'Amino Acid Sequence Editor',
  description = 'Only standard amino acids are accepted.',
  hideTitle = false,
  compact = false,
  className = '',
  onSequenceSaved = null, // NEW: Callback to insert visual output into notebook
}) => {
  const [name, setName] = useState('')
  const [sequence, setSequence] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  const cleanedSequence = useMemo(
    () => sequence.replace(/\s/g, ''),
    [sequence],
  )

  const groupedSequence = useMemo(() => {
    if (!cleanedSequence.length) {
      return []
    }
    const groups = []
    for (let i = 0; i < cleanedSequence.length; i += 10) {
      groups.push(cleanedSequence.slice(i, i + 10))
    }
    return groups
  }, [cleanedSequence])

  const uniqueCategories = useMemo(() => {
    const found = new Set()
    cleanedSequence.split('').forEach((residue) => {
      const category = getCategoryForResidue(residue)
      if (category) {
        found.add(category)
      }
    })
    return Array.from(found)
  }, [cleanedSequence])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        setName(parsed.name || '')
        setSequence((parsed.sequence || '').toUpperCase())
      }
    } catch (error) {
      console.error('Failed to load stored sequence data', error)
    }
  }, [storageKey])

  useEffect(() => {
    if (!savedMessage) {
      return
    }

    const timeout = window.setTimeout(() => setSavedMessage(''), 2000)
    return () => window.clearTimeout(timeout)
  }, [savedMessage])

  const validateSequence = (value) => {
    const normalized = value.replace(/\s/g, '').toUpperCase()
    if (!normalized.length) {
      return false
    }

    for (let i = 0; i < normalized.length; i += 1) {
      if (!VALID_AMINO_ACIDS.includes(normalized[i])) {
        return false
      }
    }

    return true
  }

  const handleSequenceChange = (event) => {
    const { value } = event.target
    const normalized = value.toUpperCase()

    setSequence(normalized)
    setIsValid(normalized.length === 0 ? false : validateSequence(normalized))
  }

  const handleSave = () => {
    if (!name.trim() || !cleanedSequence.length || !isValid) {
      setIsValid(validateSequence(sequence))
      return
    }

    setIsSaving(true)
    const payload = {
      name: name.trim(),
      sequence: cleanedSequence,
      savedAt: new Date().toISOString(),
    }

    try {
      // PART 1: Save to localStorage (DATA SAFEGUARD - DO NOT CHANGE!)
      window.localStorage.setItem(storageKey, JSON.stringify(payload))
      window.dispatchEvent(new CustomEvent('sequence:saved', { detail: payload }))
      
      // PART 2 (NEW): Generate colored visual output and insert into notebook
      if (onSequenceSaved) {
        const visualHTML = generateColoredSequenceHTML(payload.name, payload.sequence)
        onSequenceSaved(visualHTML)
      }
      
      setSavedMessage('Sequence saved successfully!')
      setName('')
      setSequence('')
      setIsValid(false)
    } catch (error) {
      console.error('Failed to save sequence data', error)
    } finally {
      setIsSaving(false)
    }
  }


  const rows = compact ? 4 : 8
  // Phase 6.2 - NO DOUBLE BOX! Compact mode = no border (wrapper has it), standalone = has border
  const rootClasses = compact
    ? `flex w-full flex-col gap-2 ${className}` // No border/shadow in compact mode - wrapper already has it!
    : `flex w-full max-w-3xl flex-col gap-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm ${className}`


  return (
    <div className={rootClasses}>
      {!hideTitle && (
        <header className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-slate-800">
            {title}
          </h2>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {description}
          </p>
        </header>
      )}

      <label className={`flex flex-col ${compact ? 'gap-1' : 'gap-2'}`}>
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Sequence Name
        </span>
        {/* Phase 6.2 - Colorful styling with red accents */}
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g., Sample Hemoglobin Variant"
          className="border-b-2 border-gray-200 bg-red-50/30 px-2 py-2 text-sm text-gray-800 placeholder:text-gray-400 transition focus:border-notebook-red focus:bg-red-50 focus:outline-none"
        />
      </label>

      <label className={`flex flex-col ${compact ? 'gap-1' : 'gap-2'}`}>
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Amino Acid Sequence
        </span>
        {/* Phase 6.2 - Colorful styling with red accents */}
        <textarea
          rows={rows}
          value={sequence}
          onChange={handleSequenceChange}
          placeholder="Paste or type your sequence"
          className="sequence-font border-2 border-gray-200 rounded-md bg-red-50/30 px-3 py-2 text-sm tracking-[0.08em] text-gray-800 placeholder:text-gray-400 transition focus:border-notebook-red focus:bg-red-50 focus:outline-none"
        />
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{cleanedSequence.length} characters</span>
          {!isValid && sequence.length > 0 && (
            <span className="text-red-500">
              Invalid characters detected. Use ACDEFGHIKLMNPQRSTVWY only.
            </span>
          )}
        </div>
      </label>

      {cleanedSequence.length > 0 && !compact && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Sequence Visualization
          </h3>
          <p className="mt-2 text-xs text-slate-500">
            Each residue is color-coded by biochemical class to surface motifs and
            anomalies at a glance.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {cleanedSequence.split('').map((residue, index) => {
              const category = getCategoryForResidue(residue)
              const meta = category ? CATEGORY_META[category] : null
              return (
                <div
                  key={`${residue}-${index}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-semibold shadow-sm transition ${
                    meta
                      ? `${meta.className}`
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                  title={
                    meta ? `${residue} -> ${meta.label}` : `${residue} -> Unknown`
                  }
                >
                  {residue}
                </div>
              )
            })}
          </div>

          {uniqueCategories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              {uniqueCategories.map((category) => (
                <div
                  key={category}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 shadow-sm ${CATEGORY_META[category].className}`}
                >
                  <span className="font-bold uppercase">
                    {category.substring(0, 3)}
                  </span>
                  <span className="text-[11px] font-medium">
                    {CATEGORY_META[category].label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {groupedSequence.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Indexed Blocks (10 residues)
              </h4>
              <div className="mt-2 grid gap-2 font-mono text-xs text-slate-700 sm:grid-cols-2">
                {groupedSequence.map((chunk, index) => (
                  <div
                    key={`${chunk}-${index}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <span>{chunk}</span>
                    <span className="text-[11px] text-slate-500">
                      {index * 10 + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <div className="flex items-center gap-3">
        {/* Phase 6.2 - Prominent red button with better sizing */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !name.trim() || !cleanedSequence.length || !isValid}
          className="bg-notebook-red text-white px-4 py-2 text-sm font-semibold rounded-md shadow-sm transition hover:bg-notebook-red-hover hover:shadow disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm"
        >
          {isSaving ? 'Saving…' : 'Save Sequence'}
        </button>
        {savedMessage && (
          <span className="text-sm font-medium text-emerald-600">
            {savedMessage}
          </span>
        )}
      </div>
    </div>
  )
}

export default SequenceEditor

