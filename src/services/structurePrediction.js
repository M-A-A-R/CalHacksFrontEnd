const DEFAULT_ENDPOINT = import.meta.env.VITE_STRUCTURE_API_URL?.trim()
  ? import.meta.env.VITE_STRUCTURE_API_URL.trim()
  : 'https://esmfold.sequence.bio/api/predict'

const FALLBACK_PDB_URL =
  'https://files.rcsb.org/download/1HHO.pdb'

const normalizeSequence = (sequence) =>
  sequence.replace(/\s/g, '').toUpperCase()

const fetchFallbackStructure = async () => {
  const response = await fetch(FALLBACK_PDB_URL)
  if (!response.ok) {
    throw new Error(
      'Prediction failed and fallback structure could not be retrieved.',
    )
  }
  const pdb = await response.text()
  return {
    pdb,
    metadata: {
      source: 'fallback',
      label: 'Hemoglobin fallback structure',
    },
  }
}

export const predictStructure = async (sequence) => {
  const normalized = normalizeSequence(sequence)

  if (!normalized.length) {
    throw new Error('Amino acid sequence is required for prediction.')
  }

  try {
    const response = await fetch(DEFAULT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sequence: normalized }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Prediction request failed (${response.status}). ${errorText || ''}`,
      )
    }

    const data = await response.json()
    if (!data || !data.pdb) {
      throw new Error('Prediction did not return structure data.')
    }

    return {
      pdb: data.pdb,
      metadata: {
        source: 'prediction',
        modelConfidence: data.ptm || data.plddt || null,
        approxRuntimeSec: data.runtime || null,
      },
    }
  } catch (error) {
    console.warn(
      'Prediction request failed, attempting to load fallback structure.',
      error,
    )
    return fetchFallbackStructure()
  }
}

export default predictStructure
