const SAMPLE_DIRECTORY = '/pdb-library'

const PDB_SAMPLE_FILES = [
  '1CRN.pdb',
  '1UBQ.pdb',
  '1HHO.pdb',
  '1LYZ.pdb',
  '1AKE.pdb',
  '1EMA.pdb',
  '1FHG.pdb',
  '1GFL.pdb',
  '1QYS.pdb',
  '2DN2.pdb',
  '2MNR.pdb',
  '2PLV.pdb',
  '2PTC.pdb',
  '3AID.pdb',
  '3NIR.pdb',
  '4HHB.pdb',
  '4YAZ.pdb',
  '5XNL.pdb',
  '6LU7.pdb',
  '7PIV.pdb',
]

const normalizeSequence = (sequence) =>
  sequence.replace(/\s/g, '').toUpperCase()

const pickRandomSampleFile = () =>
  PDB_SAMPLE_FILES[Math.floor(Math.random() * PDB_SAMPLE_FILES.length)]

const fetchSampleStructure = async (fileName) => {
  const pdbId = fileName.replace('.pdb', '')
  const response = await fetch(`${SAMPLE_DIRECTORY}/${fileName}`)
  if (!response.ok) {
    throw new Error(`Failed to load sample structure: ${fileName}`)
  }
  const pdb = await response.text()
  return {
    pdb,
    metadata: {
      source: 'library',
      sampleFile: fileName,
      pdbId,
    },
  }
}

export const predictStructure = async (sequence) => {
  const normalized = normalizeSequence(sequence)

  if (!normalized.length) {
    throw new Error('Amino acid sequence is required for visualization.')
  }

  const fileName = pickRandomSampleFile()
  return fetchSampleStructure(fileName)
}

export default predictStructure
