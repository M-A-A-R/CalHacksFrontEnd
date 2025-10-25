import React, { useEffect, useMemo, useRef, useState } from 'react'
import { predictStructure } from '../../services/structurePrediction.js'

const SEQUENCE_STORAGE_KEY = 'sequenceEditorData'
const PREDICTION_STORAGE_KEY = 'proteinViewerPrediction'
const AVAILABLE_STYLES = ['cartoon', 'stick', 'sphere', 'surface']
const DEFAULT_STYLE = 'cartoon'

const ProteinViewer = () => {
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
      case 'stick':
        viewer.setStyle({}, { stick: { radius: 0.2 } })
        break
      case 'sphere':
        viewer.setStyle({}, { spheres: { scale: 0.4 } })
        break
      case 'surface':
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } })
        viewer.addSurface($3Dmol.SurfaceType.MS, { opacity: 0.8 })
        break
      case 'cartoon':
      default:
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } })
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
      const stored = window.localStorage.getItem(SEQUENCE_STORAGE_KEY)
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
  }, [])

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
        PREDICTION_STORAGE_KEY,
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
  }, [sequenceRecord])

  useEffect(() => {
    if (modelLoadedRef.current) {
      applyStyle(viewStyle)
    }
  }, [viewStyle])

  const handlePredictStructure = async () => {
    if (!sequenceRecord?.sequence) {
      setError('Save a sequence first before running a structure prediction.')
      return
    }

    setIsPredicting(true)
    setStatus(
      'Sending sequence to AlphaFold/ESMFold service. This may take up to a minute for long sequences.',
    )
    setError('')

    try {
      const prediction = await predictStructure(sequenceRecord.sequence)
      const meta = {
        sequence: sequenceRecord.sequence,
        name: sequenceRecord.name,
        pdb: prediction.pdb,
        metadata: prediction.metadata,
        predictedAt: new Date().toISOString(),
      }

      setPredictionMeta(meta)
      window.localStorage.setItem(
        PREDICTION_STORAGE_KEY,
        JSON.stringify(meta),
      )
      loadStructureIntoViewer(prediction.pdb)
      setStatus(
        prediction.metadata?.source === 'fallback'
          ? 'Fallback structure loaded (prediction service unavailable).'
          : 'Structure predicted successfully!',
      )
    } catch (predictionError) {
      console.error('Prediction failed', predictionError)
      setError(
        predictionError?.message ||
          'Prediction failed. Try again with a shorter sequence or later.',
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
    window.localStorage.removeItem(PREDICTION_STORAGE_KEY)
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow-md">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-bio-dark">
          AlphaFold Protein Preview
        </h2>
        <p className="text-sm text-gray-500">
          Predict folding geometry for your saved sequence using AlphaFold-compatible
          services (ESMFold fallback).
        </p>
      </header>

      <section className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        {sequenceRecord ? (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800">
                {sequenceRecord.name || 'Untitled Sequence'}
              </span>
              <span className="text-xs text-gray-500">
                {sequenceLength} amino acids
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Last saved: {sequenceRecord.savedAt
                ? new Date(sequenceRecord.savedAt).toLocaleString()
                : 'unknown'}
            </div>
            <button
              type="button"
              onClick={handlePredictStructure}
              disabled={isPredicting}
              className="mt-2 w-full rounded-md bg-bio-secondary px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPredicting ? 'Predicting structure...' : 'Predict Structure'}
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            Save a sequence in the editor to enable structure prediction.
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        {AVAILABLE_STYLES.map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => setViewStyle(style)}
            className={`rounded-md px-3 py-2 text-sm font-medium capitalize transition ${
              viewStyle === style
                ? 'bg-bio-primary text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            disabled={!modelLoadedRef.current}
          >
            {style}
          </button>
        ))}
        <button
          type="button"
          onClick={handleClearPrediction}
          className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!predictionMeta}
        >
          Clear Structure
        </button>
      </div>

      <div className="relative h-96 rounded-lg border border-gray-200 bg-gray-50">
        <div ref={containerRef} className="h-full w-full" />
        {isPredicting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/85 text-sm text-gray-700">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-bio-primary" />
            <span>Crunching structure...</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/90 p-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {status && (
        <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
          {status}
        </div>
      )}

      {predictionMeta && (
        <footer className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">
              Prediction Summary
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
          {predictionMeta.metadata?.source === 'fallback' && (
            <div className="text-amber-600">
              Prediction service unavailable; displaying fallback PDB (
              {predictionMeta.metadata.label}).
            </div>
          )}
        </footer>
      )}
    </div>
  )
}

export default ProteinViewer
