export const DEMO_NOTEBOOK = {
  id: 'demo-notebook-3',
  name: 'Demo Notebook 3',
  documentHtml:
    '<h1 style="color:#991B1B; font-weight:800;">CFTR Rescue Study – Demo</h1>' +
    '<p style="color:#334155"><em>Prefilled example with detailed notes, a CFTR-focused sequence, denser data tables, and an expanded protocol.</em></p>' +
    '<h2 style="color:#DC2626; font-weight:700;">Overview</h2>' +
    '<p style="color:#0f172a">We evaluated functional rescue strategies for CFTR with emphasis on NBD1→NBD2 coupling. Observed improvements concentrate near the NBD interface (NBD1 around F508 and the ICL4 contact region). Downstream readouts show higher chloride conductance and improved viability under pathogen challenge when ATP coupling appears enhanced.</p>' +
    '<h3 style="color:#991B1B; font-weight:700; margin-top:0.75rem;">Key observations</h3>' +
    '<ul style="color:#0f172a; line-height:1.6; margin-left:1rem;">' +
      '<li>Viability under Pseudomonas challenge improves markedly compared with ΔF508 controls.</li>' +
      '<li>Short-circuit current recovers a substantial fraction of wild-type values, consistent with better ATP-driven gating.</li>' +
      '<li>Phosphorylation-dependent activation is intact, suggesting the regulatory domain remains accessible.</li>' +
    '</ul>' +
    '<p style="color:#0f172a; margin-top:0.5rem;">These findings converge on the hypothesis that stabilizing NBD1 and optimizing nucleotide coupling could yield robust functional gains without compromising trafficking.</p>',

  sequences: [
    {
      id: 'demo-seq-1',
      name: 'CFTR NBD1 Region – Experimental Insert',
      // Valid amino acid letters only
      sequence:
        'MQYVIFLLSLSLILQLLRGQADKKTNVFDTELKDLRKYVSNFQRSMTNDTWGLPSTLQEL' +
        'GKTLSGEMQRVLAVTSRGIRDSLFVVIPSQKTELGIVKLSHGHKQLIKVNPRSGQRNLIF' +
        'KGNLRNVLSRLSDKTKVIYFGEGNGYEVNGKKITLSYVQQLVSQQKVTLEDTKQLFENQL' +
        'NTLQNVKDFVFGVSIRGQRNLYLSPQQLLSQNVQKLSENQLVNRQKSVVQYDLRNGQKLS' +
        'EVQKLLENRVSLESGQNVVQLS',
    },
  ],

  tables: [
    // Kill-curve viability (replicate-level, denser data in a single table)
    {
      id: 'demo-table-1',
      columns: ['Condition', 'Replicate', 'Viability (%)', 'Notes'],
      rows: [
        { 'Condition': 'ΔF508',   'Replicate': '1', 'Viability (%)': '37.2', 'Notes': 'Baseline' },
        { 'Condition': 'ΔF508',   'Replicate': '2', 'Viability (%)': '39.1', 'Notes': '' },
        { 'Condition': 'ΔF508',   'Replicate': '3', 'Viability (%)': '35.6', 'Notes': '' },
        { 'Condition': 'ΔF508',   'Replicate': '4', 'Viability (%)': '41.3', 'Notes': '' },
        { 'Condition': 'ΔF508',   'Replicate': '5', 'Viability (%)': '39.0', 'Notes': '' },

        { 'Condition': 'Edited',  'Replicate': '1', 'Viability (%)': '60.1', 'Notes': 'PKA 10µM' },
        { 'Condition': 'Edited',  'Replicate': '2', 'Viability (%)': '63.4', 'Notes': '' },
        { 'Condition': 'Edited',  'Replicate': '3', 'Viability (%)': '64.5', 'Notes': '' },
        { 'Condition': 'Edited',  'Replicate': '4', 'Viability (%)': '59.8', 'Notes': '' },
        { 'Condition': 'Edited',  'Replicate': '5', 'Viability (%)': '63.0', 'Notes': '' },

        { 'Condition': 'WT Rescue','Replicate': '1', 'Viability (%)': '70.1', 'Notes': 'Reference' },
        { 'Condition': 'WT Rescue','Replicate': '2', 'Viability (%)': '72.3', 'Notes': '' },
        { 'Condition': 'WT Rescue','Replicate': '3', 'Viability (%)': '73.0', 'Notes': '' },
        { 'Condition': 'WT Rescue','Replicate': '4', 'Viability (%)': '71.0', 'Notes': '' },
        { 'Condition': 'WT Rescue','Replicate': '5', 'Viability (%)': '71.9', 'Notes': '' },
      ],
    },

    // Ussing chamber short-circuit current (replicates + PKA info) in one table
    {
      id: 'demo-table-2',
      columns: ['Group', 'Replicate', 'Current (µA/cm2)', 'PKA (µM)'],
      rows: [
        { 'Group': 'WT',     'Replicate': '1', 'Current (µA/cm2)': '43.1', 'PKA (µM)': '10' },
        { 'Group': 'WT',     'Replicate': '2', 'Current (µA/cm2)': '41.6', 'PKA (µM)': '10' },
        { 'Group': 'WT',     'Replicate': '3', 'Current (µA/cm2)': '44.0', 'PKA (µM)': '10' },
        { 'Group': 'WT',     'Replicate': '4', 'Current (µA/cm2)': '42.5', 'PKA (µM)': '10' },
        { 'Group': 'WT',     'Replicate': '5', 'Current (µA/cm2)': '41.9', 'PKA (µM)': '10' },
        { 'Group': 'WT',     'Replicate': '6', 'Current (µA/cm2)': '42.6', 'PKA (µM)': '10' },

        { 'Group': 'ΔF508',  'Replicate': '1', 'Current (µA/cm2)': '11.8', 'PKA (µM)': '10' },
        { 'Group': 'ΔF508',  'Replicate': '2', 'Current (µA/cm2)': '12.5', 'PKA (µM)': '10' },
        { 'Group': 'ΔF508',  'Replicate': '3', 'Current (µA/cm2)': '9.6',  'PKA (µM)': '10' },
        { 'Group': 'ΔF508',  'Replicate': '4', 'Current (µA/cm2)': '10.2', 'PKA (µM)': '10' },
        { 'Group': 'ΔF508',  'Replicate': '5', 'Current (µA/cm2)': '11.0', 'PKA (µM)': '10' },
        { 'Group': 'ΔF508',  'Replicate': '6', 'Current (µA/cm2)': '12.1', 'PKA (µM)': '10' },

        { 'Group': 'Edited', 'Replicate': '1', 'Current (µA/cm2)': '30.5', 'PKA (µM)': '10' },
        { 'Group': 'Edited', 'Replicate': '2', 'Current (µA/cm2)': '32.6', 'PKA (µM)': '10' },
        { 'Group': 'Edited', 'Replicate': '3', 'Current (µA/cm2)': '31.1', 'PKA (µM)': '10' },
        { 'Group': 'Edited', 'Replicate': '4', 'Current (µA/cm2)': '33.3', 'PKA (µM)': '10' },
        { 'Group': 'Edited', 'Replicate': '5', 'Current (µA/cm2)': '31.8', 'PKA (µM)': '10' },
        { 'Group': 'Edited', 'Replicate': '6', 'Current (µA/cm2)': '31.5', 'PKA (µM)': '10' },
      ],
    },
  ],

  protocols: [
    {
      id: 'demo-protocol-1',
      title: 'CFTR Functional Rescue – Extended Ussing Chamber Assay',
      description:
        'Assess CFTR-dependent chloride conductance in epithelial monolayers with PKA activation. Includes equilibrations, buffer controls, and ATP-coupling considerations to capture NBD1↔NBD2 dynamics.',
      steps: [
        'Culture epithelial monolayers on permeable supports until TEER ≥ 700 Ω·cm².',
        'Equilibrate tissues in Ussing chamber with prewarmed Krebs buffer at 25°C; monitor baseline for ≥ 5 min.',
        'Apply amiloride to apical side to suppress ENaC currents and isolate CFTR-dependent signal.',
        'Introduce forskolin/IBMX as needed to elevate cAMP prior to PKA addition (optional).',
        'Add PKA (10 µM) to activate CFTR regulatory domain; annotate time zero.',
        'Record short-circuit current at 1 Hz sampling for ≥ 10 min; note peak and steady-state plateaus.',
        'Wash and re-equilibrate; confirm recovery of baseline drift < 5%.',
        'Apply CFTRinh-172 to confirm current attribution to CFTR channels.',
        'Export traces in CSV format; annotate replicate IDs and conditions (ΔF508, Edited, WT).',
        'Compute group means, SD, and effect sizes relative to ΔF508 control.',
        'Document any oscillations or noise bursts coincident with temperature or buffer swaps.',
        'Archive raw and processed data with notebook metadata.',
      ],
      notes: 'Maintain low-resistance seals; ensure PKA exposure timing is consistent across replicates. Enhanced currents concurrent with PKA and stable baselines suggest improved ATP coupling at NBD interfaces.',
    },
  ],

  proteinBlocks: ['demo-prot-1'],
};
