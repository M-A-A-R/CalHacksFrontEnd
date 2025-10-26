const GFP_SEQUENCE = (
  'MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWPTL' +
  'VTTFSYGVQCFSRYPDHMKQHDFFKSAMPEGYVQERTIFFKDDGNYKTRAEVKFEGDTLV' +
  'NRIELKGIDFKEDGNILGHKLEYNYNSHNVYIMADKQKNGIKVNFKIRHNIEDGSVQLAD' +
  'HYQQNTPIGDGPVLLPDNHYLSTQSALSKDPNEKRDHMVLLEFVTAAGITHGMDELYK'
);

export const EXAMPLE_NOTEBOOKS = [
  {
    id: 'cftr-demo',
    name: 'CFTR Rescue (Demo)',
    documentHtml:
      '<h1 style="color:#991B1B; font-weight:800;">CFTR Rescue – Example Notebook</h1>' +
      '<p><em>Prefilled with notes, a sequence block, data table, and protocol.</em></p>' +
      '<h2 style="color:#DC2626; font-weight:700;">Notes</h2>' +
      '<p>Engineered CFTR variant with edits near NBD1/NBD2 interface. See interaction graph in the Analysis tab and results in Statistics.</p>',
    sequences: [
      { id: 'seq-demo-1', name: 'CFTR Segment', sequence: 'MSSWQVSWDTKSS' },
    ],
    tables: [
      {
        id: 'table-demo-1',
        columns: ['Sample', 'Expression (mg/L)', 'Fluorescence (RFU)'],
        rows: [
          { 'Sample': 'WT', 'Expression (mg/L)': '12.2', 'Fluorescence (RFU)': '100.0' },
          { 'Sample': 'Edited', 'Expression (mg/L)': '11.4', 'Fluorescence (RFU)': '114.3' },
        ],
      },
    ],
    protocols: [
      {
        id: 'protocol-demo-1',
        title: 'Cell Culture & Transfection',
        description: 'HEK293 cells, Lipofectamine-based CFTR transfection.',
        steps: ['Seed cells at 2e5/well', 'Transfect with CFTR plasmid', 'Incubate 48 h', 'Record currents'],
        notes: 'Use low-passage cells for consistency.',
      },
    ],
    proteinBlocks: ['prot-demo-1'],
  },
  {
    id: 'viability-demo',
    name: 'Viability Assay (Demo)',
    documentHtml:
      '<h1 style="color:#991B1B; font-weight:800;">Kill Curve – Example Notebook</h1>' +
      '<p><em>Notebook shows mock viability results across conditions.</em></p>',
    sequences: [
      { id: 'seq-demo-2', name: 'Reporter Peptide', sequence: 'ACDEFGHIKLMNPQRSTVWY' },
    ],
    tables: [
      {
        id: 'table-demo-2',
        columns: ['Condition', 'Replicates', 'Viability (%)'],
        rows: [
          { 'Condition': 'ΔF508', 'Replicates': '5', 'Viability (%)': '38.4' },
          { 'Condition': 'Edited', 'Replicates': '5', 'Viability (%)': '62.1' },
          { 'Condition': 'WT Rescue', 'Replicates': '5', 'Viability (%)': '71.5' },
        ],
      },
    ],
    protocols: [],
    proteinBlocks: ['prot-demo-2'],
  },
  {
    id: 'patchclamp-demo',
    name: 'Patch Clamp (Demo)',
    documentHtml:
      '<h1 style="color:#991B1B; font-weight:800;">Patch Clamp Demo</h1>' +
      '<p><em>Example notebook scaffold focused on conductance recovery and intervals.</em></p>',
    sequences: [
      { id: 'seq-demo-3', name: 'GFP (WT)', sequence: GFP_SEQUENCE },
    ],
    tables: [
      {
        id: 'table-demo-3',
        columns: ['Group', 'Current (µA/cm2)'],
        rows: [
          { 'Group': 'WT', 'Current (µA/cm2)': '42.6' },
          { 'Group': 'ΔF508', 'Current (µA/cm2)': '11.2' },
          { 'Group': 'Edited', 'Current (µA/cm2)': '31.8' },
        ],
      },
    ],
    protocols: [
      {
        id: 'protocol-demo-3',
        title: 'Ussing Chamber Recording',
        description: 'Short-circuit current at 25°C with PKA activation.',
        steps: ['Mount monolayer', 'Perfuse buffers', 'Add PKA', 'Record responses'],
        notes: 'Stabilize baseline before stimulation.',
      },
    ],
    proteinBlocks: ['prot-demo-3'],
  },
];

