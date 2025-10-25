import React, { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'sequenceEditorData'
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

const SequenceEditor = () => {
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
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setName(parsed.name || '')
        setSequence((parsed.sequence || '').toUpperCase())
      }
    } catch (error) {
      console.error('Failed to load stored sequence data', error)
    }
  }, [])

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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      window.dispatchEvent(new CustomEvent('sequence:saved', { detail: payload }))
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
      <header>
        <h2 className="text-2xl font-semibold text-bio-dark">
          Amino Acid Sequence Editor
        </h2>
        <p className="text-sm text-gray-500">
          Only standard amino acids (ACDEFGHIKLMNPQRSTVWY) are accepted.
        </p>
      </header>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">Sequence Name</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g., Sample Hemoglobin Variant"
          className="rounded-md border border-gray-300 px-3 py-2 focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">
          Amino Acid Sequence
        </span>
        <textarea
          rows={8}
          value={sequence}
          onChange={handleSequenceChange}
          placeholder="Paste or type your sequence"
          className="sequence-font rounded-md border border-gray-300 px-3 py-2 focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary"
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

      {cleanedSequence.length > 0 && (
        <section className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Sequence Visualization
          </h3>
          <p className="mt-2 text-xs text-gray-500">
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
                  className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm font-semibold shadow-sm transition ${
                    meta
                      ? `${meta.className}`
                      : 'border-gray-200 bg-white text-gray-700'
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
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Indexed Blocks (10 residues)
              </h4>
              <div className="mt-2 grid gap-2 font-mono text-sm text-gray-800 sm:grid-cols-2">
                {groupedSequence.map((chunk, index) => (
                  <div
                    key={`${chunk}-${index}`}
                    className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 shadow-sm"
                  >
                    <span>{chunk}</span>
                    <span className="text-xs text-gray-400">
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
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !name.trim() || !cleanedSequence.length || !isValid}
          className="rounded-md bg-bio-primary px-4 py-2 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Sequence'}
        </button>
        {savedMessage && (
          <span className="text-sm font-medium text-green-600">
            {savedMessage}
          </span>
        )}
      </div>
    </div>
  )
}

export default SequenceEditor
