import React, { useEffect, useMemo, useRef, useState } from 'react'
import { predictStructure } from '../../services/structurePrediction.js'

const AVAILABLE_STYLES = ['stick', 'cartoon', 'sphere', 'surface']
const DEFAULT_STYLE = 'stick'
const SIMULATED_DELAY_MS = 30000

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

const ProteinViewer = ({
  sequenceStorageKey = 'sequenceEditorData',
  predictionStorageKey = 'proteinViewerPrediction',
  compact = false,
  className = '',
}) => {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const modelLoadedRef = useRef(false)
  const [sequenceRecord, setSequenceRecord] = useState(null)
  const [viewStyle, setViewStyle] = useState(DEFAULT_STYLE)
  const [isPredicting, setIsPredicting] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [predictionMeta, setPredictionMeta] = useState(null)

  const sequenceLength = useMemo(
    () => sequenceRecord?.sequence?.length ?? 0,
    [sequenceRecord],
  )

  const ensureViewer = () => {
    if (!containerRef.current || viewerRef.current) {
      return
    }

    if (!window.$3Dmol) {
      setError(
        '3D viewer script has not loaded yet. Refresh the page if the problem persists.',
      )
      return
    }

    viewerRef.current = window.$3Dmol.createViewer(containerRef.current, {
      backgroundColor: '#ffffff',
    })
    viewerRef.current.render()
  }

  const applyStyle = (style) => {
    const viewer = viewerRef.current
    if (!viewer || !modelLoadedRef.current) {
      return
    }

    viewer.setStyle({}, {})
    viewer.removeAllSurfaces()

    switch (style) {
      case 'surface':
        viewer.setStyle({}, { stick: { radius: 0.2 } })
        viewer.addSurface($3Dmol.SurfaceType.MS, { opacity: 0.75 })
        break
      case 'sphere':
        viewer.setStyle({}, { spheres: { scale: 0.45 } })
        break
      case 'cartoon':
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } })
        break
      case 'stick':
      default:
        viewer.setStyle({}, { stick: { radius: 0.2 }, spheres: { scale: 0.35 } })
        break
    }

    viewer.render()
  }

  const loadStructureIntoViewer = (pdbString) => {
    ensureViewer()
    const viewer = viewerRef.current
    if (!viewer) {
      return
    }

    viewer.clear()
    viewer.addModel(pdbString, 'pdb')
    modelLoadedRef.current = true
    applyStyle(viewStyle)
    viewer.zoomTo()
    viewer.render()
  }

  const hydrateSequence = () => {
    try {
      const stored = window.localStorage.getItem(sequenceStorageKey)
      if (!stored) {
        setSequenceRecord(null)
        return
      }
      const parsed = JSON.parse(stored)
      if (parsed?.sequence) {
        setSequenceRecord(parsed)
      } else {
        setSequenceRecord(null)
      }
    } catch (storageError) {
      console.warn('Failed to parse stored sequence', storageError)
      setSequenceRecord(null)
    }
  }

  useEffect(() => {
    hydrateSequence()

    const handleSequenceSaved = (event) => {
      setSequenceRecord(event.detail)
      setStatus('')
      setError('')
    }

    window.addEventListener('sequence:saved', handleSequenceSaved)
    return () => {
      window.removeEventListener('sequence:saved', handleSequenceSaved)
    }
  }, [sequenceStorageKey])

  useEffect(() => {
    ensureViewer()
  }, [])

  useEffect(() => {
    if (!sequenceRecord) {
      setPredictionMeta(null)
      return
    }

    try {
      const storedPrediction = window.localStorage.getItem(
        predictionStorageKey,
      )
      if (!storedPrediction) {
        setPredictionMeta(null)
        return
      }
      const parsed = JSON.parse(storedPrediction)
      if (parsed?.sequence === sequenceRecord.sequence && parsed?.pdb) {
        setPredictionMeta(parsed)
        loadStructureIntoViewer(parsed.pdb)
      } else {
        setPredictionMeta(null)
      }
    } catch (storageError) {
      console.warn('Failed to parse stored prediction', storageError)
      setPredictionMeta(null)
    }
  }, [predictionStorageKey, sequenceRecord])

  useEffect(() => {
    if (modelLoadedRef.current) {
      applyStyle(viewStyle)
    }
  }, [viewStyle])

  const handlePredictStructure = async () => {
    if (!sequenceRecord?.sequence) {
      setError('Save a sequence first before loading a sample structure.')
      return
    }

    setIsPredicting(true)
    setStatus('Queuing structure prediction (~30 seconds)...')
    setError('')

    try {
      const firstDelay = Math.round(SIMULATED_DELAY_MS * 0.6)
      await wait(firstDelay)
      setStatus('Running folding iterations and scoring residue contacts...')
      await wait(SIMULATED_DELAY_MS - firstDelay)

      const prediction = await predictStructure(sequenceRecord.sequence)
      const meta = {
        sequence: sequenceRecord.sequence,
        name: sequenceRecord.name,
        pdb: prediction.pdb,
        metadata: prediction.metadata,
        predictedAt: new Date().toISOString(),
      }

      setPredictionMeta(meta)
      window.localStorage.setItem(predictionStorageKey, JSON.stringify(meta))
      loadStructureIntoViewer(prediction.pdb)
      setStatus(
        prediction.metadata?.source === 'library'
          ? `Loaded sample structure (PDB ${prediction.metadata.pdbId})`
          : 'Structure loaded successfully.',
      )
    } catch (predictionError) {
      console.error('Prediction failed', predictionError)
      setError(
        predictionError?.message ||
          'Unable to load a sample structure. Please try again.',
      )
      setStatus('')
    } finally {
      setIsPredicting(false)
    }
  }

  const handleClearPrediction = () => {
    setPredictionMeta(null)
    modelLoadedRef.current = false
    if (viewerRef.current) {
      viewerRef.current.clear()
      viewerRef.current.render()
    }
    window.localStorage.removeItem(predictionStorageKey)
  }

  const viewerHeightClass = compact ? 'h-56' : 'h-80'
  const wrapperClasses = compact
    ? `flex w-[420px] max-w-full flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-md ${className}`
    : `flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-lg ${className}`
  const styleButtonBase = compact
    ? 'rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium capitalize transition'
    : 'rounded-md border border-slate-200 px-3 py-2 text-sm font-medium capitalize transition'
  const styleButtonActive = 'bg-bio-primary text-white'
  const styleButtonInactive = 'text-slate-600 hover:bg-slate-100'
  const predictButtonClass = compact
    ? 'mt-2 w-full rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40'
    : 'mt-2 w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className={wrapperClasses}>
      {!compact && (
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-slate-800">
            AlphaFold Protein Preview
          </h2>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Load curated sample structures for your saved sequence
          </p>
        </header>
      )}

      <section
        className={`rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm`}
      >
        {sequenceRecord ? (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-800">
                {sequenceRecord.name || 'Untitled Sequence'}
              </span>
              <span className="text-xs text-slate-500">
                {sequenceLength} amino acids
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Last saved:{' '}
              {sequenceRecord.savedAt
                ? new Date(sequenceRecord.savedAt).toLocaleString()
                : 'unknown'}
            </div>
            <button
              type="button"
              onClick={handlePredictStructure}
              disabled={isPredicting}
              className={predictButtonClass}
            >
              {isPredicting ? 'Loading sample...' : 'Predict Structure'}
            </button>
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            Save a sequence in the editor to enable structure visualization.
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        {AVAILABLE_STYLES.map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => setViewStyle(style)}
            className={`${styleButtonBase} ${
              viewStyle === style ? styleButtonActive : styleButtonInactive
            }`}
            disabled={!modelLoadedRef.current}
          >
            {style}
          </button>
        ))}
        <button
          type="button"
          onClick={handleClearPrediction}
          className={`rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 ${
            compact ? 'text-xs px-2.5 py-1.5' : ''
          }`}
          disabled={!predictionMeta}
        >
          Clear Structure
        </button>
      </div>

      <div
        className={`relative ${viewerHeightClass} rounded-xl border border-slate-200 bg-slate-50`}
      >
        <div
          ref={containerRef}
          className="h-full w-full rounded-xl border border-white/40 bg-white"
        />
        {isPredicting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/85 text-sm text-slate-600">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-bio-primary" />
            <span>Simulating prediction (~30s)...</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/90 p-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {status && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-center text-xs font-medium text-blue-600 shadow-sm">
          {status}
        </div>
      )}

      {predictionMeta && (
        <footer className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-700 uppercase tracking-wide">
              Structure Summary
            </span>
            <span>
              {predictionMeta.predictedAt
                ? new Date(predictionMeta.predictedAt).toLocaleString()
                : ''}
            </span>
          </div>
          {predictionMeta.metadata?.modelConfidence && (
            <div>
              Model confidence: {predictionMeta.metadata.modelConfidence}
            </div>
          )}
          {predictionMeta.metadata?.source === 'library' && (
            <div className="text-sm font-medium text-blue-600">
              Displaying sample PDB: {predictionMeta.metadata.pdbId}
            </div>
          )}
        </footer>
      )}
    </div>
  )
}

export default ProteinViewer
