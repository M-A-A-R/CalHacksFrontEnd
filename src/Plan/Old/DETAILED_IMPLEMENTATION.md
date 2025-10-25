# DETAILED STEP-BY-STEP IMPLEMENTATION PLAN

This document provides an extremely detailed, step-by-step guide for implementing the Bio Research Platform frontend.

---

## TABLE OF CONTENTS

1. [Phase 1: Project Setup](#phase-1-project-setup)
2. [Phase 2: Build Mock Data Layer](#phase-2-build-mock-data-layer)
3. [Phase 3: Build Input Components](#phase-3-build-input-components)
4. [Phase 4: Build AI Output Components](#phase-4-build-ai-output-components)
5. [Phase 5: Build Main App Layout](#phase-5-build-main-app-layout)
6. [Phase 6: Testing & Polish](#phase-6-testing--polish)

---

## PHASE 1: PROJECT SETUP

### Step 1.1: Initialize Package.json
Create `package.json` with all dependencies:

```bash
npm init -y
npm install react@18.2.0 react-dom@18.2.0
npm install -D vite@5.0.8 @vitejs/plugin-react@4.2.1
npm install -D tailwindcss@3.3.0 postcss@8.4.32 autoprefixer@10.4.16
npm install axios@1.6.0
npm install react-data-grid@7.0.0-beta.40
npm install chart.js@4.4.0 react-chartjs-2@5.2.0
```

### Step 1.2: Configure Vite
Create `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
})
```

### Step 1.3: Configure Tailwind CSS
Create `tailwind.config.js`:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bio-primary': '#3B82F6',
        'bio-secondary': '#10B981',
        'bio-dark': '#1F2937',
        'bio-light': '#F3F4F6',
      },
    },
  },
  plugins: [],
}
```

Create `postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Step 1.4: Create Base HTML
Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- 3Dmol.js for protein visualization -->
    <script src="https://3Dmol.csb.pitt.edu/build/3Dmol-min.js"></script>
    <title>Bio Research Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Step 1.5: Create Entry Point
Create `src/main.jsx`:

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Step 1.6: Create Base Styles
Create `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background-color: #F9FAFB;
}

/* Monospace font for sequences */
.sequence-font {
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.1em;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

### Step 1.7: Create Environment File
Create `.env`:

```
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK_DATA=true
```

### Step 1.8: Create Folder Structure
```bash
mkdir -p src/components/input
mkdir -p src/components/ai-output
mkdir -p src/services
mkdir -p src/mock-data
mkdir -p public
```

---

## PHASE 2: BUILD MOCK DATA LAYER

### Step 2.1: Create Mock Sequences
Create `src/mock-data/mockSequences.json`:

```json
{
  "sequences": [
    {
      "id": "seq_001",
      "name": "Hemoglobin Alpha Chain",
      "sequence": "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "id": "seq_002",
      "name": "Insulin A Chain",
      "sequence": "GIVEQCCTSICSLYQLENYCN",
      "timestamp": "2024-01-15T11:45:00Z"
    }
  ]
}
```

### Step 2.2: Create Mock Letta Insights
Create `src/mock-data/mockLettaInsights.json`:

```json
{
  "insights": "Analysis of the submitted sequences reveals several key findings:\n\n1. **Structural Stability**: The protein shows high alpha-helix propensity in regions 45-78 and 120-156, suggesting strong structural integrity.\n\n2. **Binding Affinity**: Multiple hydrophobic residues (L42, V89, F103) indicate potential membrane interaction sites with estimated binding affinity of 23 nM.\n\n3. **pH Optimization**: Based on the experimental data, optimal activity occurs at pH 7.4, with 23% increased efficiency compared to pH 6.8.\n\n4. **Mutation Opportunities**: The L156A substitution shows promise for enhanced thermal stability (+18°C melting point increase).",
  
  "suggestions": [
    "Test the L156A mutation for improved thermal stability",
    "Investigate the K78R substitution to enhance substrate binding affinity",
    "Consider F42W mutation for increased fluorescence tracking",
    "Explore double mutant L156A/K78R for synergistic effects"
  ],
  
  "confidence": 87,
  
  "novelSequences": [
    {
      "name": "Stability-Enhanced Variant",
      "sequence": "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTAAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR",
      "changes": "L156A mutation",
      "improvement": "+18% thermal stability, +15% half-life",
      "reasoning": "Alanine substitution reduces steric clashes in the hydrophobic core"
    },
    {
      "name": "Enhanced Binding Variant",
      "sequence": "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHRLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR",
      "changes": "K78R substitution",
      "improvement": "+32% substrate binding affinity",
      "reasoning": "Arginine provides additional hydrogen bonding capacity"
    }
  ],
  
  "webDataContext": {
    "clinicalTrials": 3,
    "recentPapers": 47,
    "patents": 12
  }
}
```

### Step 2.3: Create Mock Chart Data
Create `src/mock-data/mockChartData.json`:

```json
{
  "expressionLevels": {
    "type": "line",
    "data": {
      "labels": ["0h", "2h", "4h", "6h", "8h", "12h", "24h"],
      "datasets": [
        {
          "label": "Wild Type",
          "data": [0, 15, 35, 62, 85, 92, 88],
          "borderColor": "rgb(59, 130, 246)",
          "backgroundColor": "rgba(59, 130, 246, 0.1)",
          "tension": 0.4
        },
        {
          "label": "L156A Variant",
          "data": [0, 22, 48, 75, 98, 105, 102],
          "borderColor": "rgb(16, 185, 129)",
          "backgroundColor": "rgba(16, 185, 129, 0.1)",
          "tension": 0.4
        },
        {
          "label": "K78R Variant",
          "data": [0, 18, 42, 70, 95, 110, 108],
          "borderColor": "rgb(245, 158, 11)",
          "backgroundColor": "rgba(245, 158, 11, 0.1)",
          "tension": 0.4
        }
      ]
    },
    "options": {
      "responsive": true,
      "plugins": {
        "legend": {
          "position": "top"
        },
        "title": {
          "display": true,
          "text": "Protein Expression Over Time"
        }
      },
      "scales": {
        "y": {
          "beginAtZero": true,
          "title": {
            "display": true,
            "text": "Expression Level (AU)"
          }
        },
        "x": {
          "title": {
            "display": true,
            "text": "Time"
          }
        }
      }
    }
  },
  
  "bindingAffinity": {
    "type": "bar",
    "data": {
      "labels": ["Wild Type", "L156A", "K78R", "Double Mutant"],
      "datasets": [{
        "label": "Binding Affinity (Kd in nM)",
        "data": [45, 38, 31, 23],
        "backgroundColor": [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)"
        ],
        "borderColor": [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(245, 158, 11)",
          "rgb(239, 68, 68)"
        ],
        "borderWidth": 2
      }]
    },
    "options": {
      "responsive": true,
      "plugins": {
        "legend": {
          "display": false
        },
        "title": {
          "display": true,
          "text": "Binding Affinity Comparison (Lower is Better)"
        }
      },
      "scales": {
        "y": {
          "beginAtZero": true,
          "title": {
            "display": true,
            "text": "Kd (nM)"
          }
        }
      }
    }
  },
  
  "stabilityProfile": {
    "type": "line",
    "data": {
      "labels": [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
      "datasets": [
        {
          "label": "Wild Type",
          "data": [100, 100, 100, 98, 92, 78, 45, 12, 3, 0, 0],
          "borderColor": "rgb(59, 130, 246)",
          "tension": 0.4
        },
        {
          "label": "L156A Variant",
          "data": [100, 100, 100, 100, 98, 95, 85, 58, 25, 8, 0],
          "borderColor": "rgb(16, 185, 129)",
          "tension": 0.4
        }
      ]
    },
    "options": {
      "responsive": true,
      "plugins": {
        "title": {
          "display": true,
          "text": "Thermal Stability Profile"
        }
      },
      "scales": {
        "y": {
          "beginAtZero": true,
          "max": 100,
          "title": {
            "display": true,
            "text": "Activity Retention (%)"
          }
        },
        "x": {
          "title": {
            "display": true,
            "text": "Temperature (°C)"
          }
        }
      }
    }
  }
}
```

### Step 2.4: Create Mock Literature Papers
Create `src/mock-data/mockPapers.json`:

```json
{
  "papers": [
    {
      "id": "38234567",
      "title": "Deep Learning Approaches for Protein Structure Prediction: Recent Advances and Future Directions",
      "authors": ["Smith JA", "Johnson KL", "Williams MT", "Brown RS"],
      "year": 2024,
      "journal": "Nature Biotechnology",
      "abstract": "Recent advances in deep learning have revolutionized protein structure prediction, achieving near-experimental accuracy. We review the latest methods including AlphaFold2, ESMFold, and RoseTTAFold, discussing their applications in drug discovery and protein engineering. We also explore emerging techniques for predicting protein dynamics and protein-protein interactions...",
      "url": "https://pubmed.ncbi.nlm.nih.gov/38234567",
      "pmid": "38234567",
      "relevance": 0.95
    },
    {
      "id": "38123456",
      "title": "Rational Design of Thermostable Enzymes Through Computational Mutagenesis",
      "authors": ["Chen L", "Rodriguez M", "Patel S"],
      "year": 2024,
      "journal": "Science",
      "abstract": "We present a systematic computational approach for enhancing enzyme thermal stability through targeted mutagenesis. Using molecular dynamics simulations and machine learning, we identify key residues that contribute to protein stability. Our method successfully increased the melting temperature of three industrial enzymes by 15-20°C...",
      "url": "https://pubmed.ncbi.nlm.nih.gov/38123456",
      "pmid": "38123456",
      "relevance": 0.89
    },
    {
      "id": "38098765",
      "title": "High-Throughput Screening of Protein Variants Using Microfluidic Platforms",
      "authors": ["Zhang W", "Kumar A", "Thompson JR"],
      "year": 2024,
      "journal": "Cell",
      "abstract": "We developed a novel microfluidic platform capable of screening millions of protein variants in parallel. The system combines droplet-based microfluidics with high-sensitivity fluorescence detection, enabling rapid identification of improved protein variants. Applications in enzyme engineering and antibody development are demonstrated...",
      "url": "https://pubmed.ncbi.nlm.nih.gov/38098765",
      "pmid": "38098765",
      "relevance": 0.82
    },
    {
      "id": "37987654",
      "title": "Machine Learning Models for Predicting Protein-Ligand Binding Affinity",
      "authors": ["Anderson BC", "Lee SH", "Garcia FT"],
      "year": 2023,
      "journal": "Journal of Chemical Information and Modeling",
      "abstract": "Accurate prediction of protein-ligand binding affinity is crucial for drug discovery. We developed a novel machine learning framework that integrates structural information, physicochemical properties, and molecular dynamics features. Our model achieves R² = 0.87 on benchmark datasets, outperforming existing methods...",
      "url": "https://pubmed.ncbi.nlm.nih.gov/37987654",
      "pmid": "37987654",
      "relevance": 0.78
    },
    {
      "id": "37876543",
      "title": "CRISPR-Based Methods for Protein Engineering in Mammalian Cells",
      "authors": ["Wilson DK", "Martinez EL", "O'Brien PM"],
      "year": 2023,
      "journal": "Nature Methods",
      "abstract": "We describe new CRISPR-based approaches for precise protein engineering directly in mammalian cells. Our methods enable multiplexed mutations, domain swaps, and tag insertions with high efficiency. We demonstrate applications in producing therapeutic proteins with improved properties...",
      "url": "https://pubmed.ncbi.nlm.nih.gov/37876543",
      "pmid": "37876543",
      "relevance": 0.75
    }
  ]
}
```

### Step 2.5: Create Mock Web Data
Create `src/mock-data/mockWebData.json`:

```json
{
  "clinicalTrials": [
    {
      "nctId": "NCT05234567",
      "title": "Phase II Study of Engineered Protein Therapeutic for Metabolic Disorders",
      "status": "Recruiting",
      "phase": "Phase 2",
      "startDate": "2024-01-15",
      "sponsor": "BioPharma Innovations Inc.",
      "relevance": "Related enzyme engineering approach"
    },
    {
      "nctId": "NCT05123456",
      "title": "Safety and Efficacy of Novel Protein Variant in Cancer Treatment",
      "status": "Active, not recruiting",
      "phase": "Phase 3",
      "startDate": "2023-06-01",
      "sponsor": "OncoTherapeutics LLC",
      "relevance": "Uses similar mutation strategy"
    }
  ],
  
  "patents": [
    {
      "patentNumber": "US20240123456A1",
      "title": "Methods for Enhancing Protein Stability Through Targeted Mutations",
      "inventors": ["Smith, John A.", "Doe, Jane B."],
      "filingDate": "2023-11-15",
      "status": "Pending",
      "abstract": "The invention relates to computational methods for identifying stabilizing mutations in proteins...",
      "relevance": "Covers L156A type mutations"
    },
    {
      "patentNumber": "US11987654B2",
      "title": "Thermostable Enzyme Variants and Their Production",
      "inventors": ["Chen, Li", "Wang, Ming"],
      "filingDate": "2022-03-20",
      "status": "Granted",
      "abstract": "Novel enzyme variants with enhanced thermal stability achieved through rational design...",
      "relevance": "Similar protein family"
    }
  ],
  
  "marketData": {
    "competingProducts": 5,
    "marketSize": "$2.3B USD",
    "growthRate": "12.5% CAGR",
    "keyPlayers": [
      "Genentech",
      "Amgen",
      "Novo Nordisk",
      "Regeneron"
    ]
  },
  
  "relatedCompounds": [
    {
      "name": "XYZ-123",
      "type": "Protein therapeutic",
      "developer": "BioPharma Corp",
      "status": "Clinical Phase 2",
      "mechanism": "Enhanced stability variant"
    },
    {
      "name": "ABC-789",
      "type": "Enzyme replacement",
      "developer": "TherapyTech Inc",
      "status": "FDA Approved 2023",
      "mechanism": "Optimized binding affinity"
    }
  ]
}
```

### Step 2.6: Create API Service with Mock Fallback
Create `src/services/api.js`:

```javascript
import axios from 'axios';

// Import mock data
import mockSequences from '../mock-data/mockSequences.json';
import mockLettaInsights from '../mock-data/mockLettaInsights.json';
import mockChartData from '../mock-data/mockChartData.json';
import mockPapers from '../mock-data/mockPapers.json';
import mockWebData from '../mock-data/mockWebData.json';

// Configuration from environment variables
// VITE_API_URL: Backend server URL (default: http://localhost:3000)
// VITE_USE_MOCK_DATA: Whether to use mock data (true/false)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

console.log('API Configuration:', {
  baseURL: API_BASE_URL,
  useMock: USE_MOCK
});

// Create axios instance for real API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds (AI calls can be slow)
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// ====================
// HELPER FUNCTIONS
// ====================

/**
 * Simulates API delay for mock data
 * Makes the mock data feel more realistic
 */
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ====================
// SEQUENCES API
// ====================
export const sequencesAPI = {
  /**
   * Save a new sequence
   * @param {Object} sequenceData - { name: string, sequence: string, timestamp: string }
   * @returns {Promise} Response with saved sequence data
   */
  save: async (sequenceData) => {
    if (USE_MOCK) {
      console.log('Mock: Saving sequence', sequenceData);
      await mockDelay(500);
      
      // Generate unique ID
      const newSequence = {
        ...sequenceData,
        id: `seq_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
      // Store in localStorage for persistence
      const existing = JSON.parse(localStorage.getItem('sequences') || '[]');
      existing.push(newSequence);
      localStorage.setItem('sequences', JSON.stringify(existing));
      
      return { data: newSequence };
    }
    
    // Real API call
    return api.post('/api/sequences', sequenceData);
  },
  
  /**
   * Get all saved sequences
   * @returns {Promise} Array of sequences
   */
  getAll: async () => {
    if (USE_MOCK) {
      console.log('Mock: Getting all sequences');
      await mockDelay(300);
      
      // Try to get from localStorage first
      const stored = localStorage.getItem('sequences');
      if (stored) {
        return { data: JSON.parse(stored) };
      }
      
      // Return mock data
      return { data: mockSequences.sequences };
    }
    
    // Real API call
    return api.get('/api/sequences');
  },
  
  /**
   * Delete a sequence by ID
   * @param {string} id - Sequence ID
   * @returns {Promise} Success response
   */
  delete: async (id) => {
    if (USE_MOCK) {
      console.log('Mock: Deleting sequence', id);
      await mockDelay(300);
      
      const sequences = JSON.parse(localStorage.getItem('sequences') || '[]');
      const filtered = sequences.filter(seq => seq.id !== id);
      localStorage.setItem('sequences', JSON.stringify(filtered));
      
      return { data: { success: true } };
    }
    
    // Real API call
    return api.delete(`/api/sequences/${id}`);
  }
};

// ====================
// DATA TABLE API
// ====================
export const dataAPI = {
  /**
   * Save table data
   * @param {Array} tableData - Array of row objects
   * @returns {Promise} Success response
   */
  save: async (tableData) => {
    if (USE_MOCK) {
      console.log('Mock: Saving table data', tableData);
      await mockDelay(500);
      
      // Store in localStorage for persistence
      localStorage.setItem('tableData', JSON.stringify(tableData));
      
      return {
        data: {
          success: true,
          id: `data_${Date.now()}`,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    // Real API call
    return api.post('/api/data', { tableData });
  },
  
  /**
   * Get saved table data
   * @returns {Promise} Array of table rows
   */
  get: async () => {
    if (USE_MOCK) {
      console.log('Mock: Getting table data');
      await mockDelay(300);
      
      const saved = localStorage.getItem('tableData');
      if (saved) {
        return { data: JSON.parse(saved) };
      }
      
      // Return empty array if no saved data
      return { data: [] };
    }
    
    // Real API call
    return api.get('/api/data');
  }
};

// ====================
// PROTOCOL UPLOAD API
// ====================
export const protocolAPI = {
  /**
   * Upload a protocol file
   * @param {File} file - File object to upload
   * @returns {Promise} Upload confirmation with file details
   */
  upload: async (file) => {
    if (USE_MOCK) {
      console.log('Mock: Uploading protocol', file.name);
      await mockDelay(1000); // Simulate upload time
      
      const fileData = {
        filename: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        id: `protocol_${Date.now()}`
      };
      
      // Store in localStorage
      const protocols = JSON.parse(localStorage.getItem('protocols') || '[]');
      protocols.push(fileData);
      localStorage.setItem('protocols', JSON.stringify(protocols));
      
      return { data: fileData };
    }
    
    // Real API call with FormData
    const formData = new FormData();
    formData.append('protocol', file);
    
    return api.post('/api/protocols', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  /**
   * Get list of uploaded protocols
   * @returns {Promise} Array of protocol metadata
   */
  getAll: async () => {
    if (USE_MOCK) {
      console.log('Mock: Getting all protocols');
      await mockDelay(300);
      
      const protocols = localStorage.getItem('protocols');
      return { data: protocols ? JSON.parse(protocols) : [] };
    }
    
    // Real API call
    return api.get('/api/protocols');
  },
  
  /**
   * Download a protocol file
   * @param {string} id - Protocol ID
   * @returns {Promise} File blob
   */
  download: async (id) => {
    if (USE_MOCK) {
      console.log('Mock: Downloading protocol', id);
      await mockDelay(500);
      
      // Can't actually download in mock mode
      alert('Download functionality requires backend connection');
      return { data: null };
    }
    
    // Real API call
    return api.get(`/api/protocols/${id}/download`, {
      responseType: 'blob'
    });
  }
};

// ====================
// AI ANALYSIS APIs
// ====================
export const aiAPI = {
  /**
   * Analyze all data with Letta AI
   * Sends sequences, table data, and protocols to Letta for comprehensive analysis
   * Letta receives web data from Bright Data to provide contextual insights
   * 
   * @param {Object} allData - { sequences: [], tableData: [], protocolText: string }
   * @returns {Promise} AI insights and suggestions
   */
  analyzeLetta: async (allData) => {
    if (USE_MOCK) {
      console.log('Mock: Analyzing with Letta AI', allData);
      // Simulate AI processing time (Letta + Bright Data integration)
      await mockDelay(2500);
      
      return { data: mockLettaInsights };
    }
    
    // Real API call
    // Backend will:
    // 1. Receive researcher data
    // 2. Trigger Bright Data web scraping
    // 3. Send all data (researcher + web) to Letta
    // 4. Return Letta's analysis
    return api.post('/api/ai/letta/analyze', allData);
  },
  
  /**
   * Predict protein structure using ESMFold
   * @param {string} sequence - Amino acid sequence
   * @param {string} name - Protein name
   * @returns {Promise} PDB file data and prediction metadata
   */
  predictProtein: async (sequence, name) => {
    if (USE_MOCK) {
      console.log('Mock: Predicting protein structure for', name);
      // Simulate ESMFold prediction time (15-30 seconds typically)
      await mockDelay(3000);
      
      return {
        data: {
          pdbData: '... Sample PDB file content would be here ...',
          confidence: 0.92,
          predictionTime: 18.3,
          method: 'ESMFold',
          sequence: sequence,
          name: name
        }
      };
    }
    
    // Real API call
    // Backend calls ESMFold API: https://api.esmatlas.com/foldSequence/v1/pdb/
    return api.post('/api/ai/protein/predict', { sequence, name });
  },
  
  /**
   * Search scientific literature using PubMed
   * @param {string} query - Search query
   * @returns {Promise} Array of relevant papers
   */
  searchLiterature: async (query) => {
    if (USE_MOCK) {
      console.log('Mock: Searching literature for', query);
      await mockDelay(1000);
      
      // Filter mock papers based on query (simple keyword matching)
      const filtered = mockPapers.papers.filter(paper =>
        paper.title.toLowerCase().includes(query.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(query.toLowerCase())
      );
      
      return { data: { papers: filtered.length > 0 ? filtered : mockPapers.papers } };
    }
    
    // Real API call
    // Backend calls PubMed E-utilities API
    return api.post('/api/ai/literature/search', { query });
  },
  
  /**
   * Get chart/graph data for visualizations
   * @returns {Promise} Chart.js compatible data
   */
  getChartData: async () => {
    if (USE_MOCK) {
      console.log('Mock: Getting chart data');
      await mockDelay(500);
      
      return { data: mockChartData };
    }
    
    // Real API call
    return api.get('/api/ai/charts');
  },
  
  /**
   * Get web data findings from Bright Data
   * @returns {Promise} Clinical trials, patents, market data
   */
  getWebData: async () => {
    if (USE_MOCK) {
      console.log('Mock: Getting web data');
      await mockDelay(800);
      
      return { data: mockWebData };
    }
    
    // Real API call
    // Backend scrapes data using Bright Data
    return api.get('/api/ai/webdata');
  }
};

export default api;
```

---

## PHASE 3: BUILD INPUT COMPONENTS

(Content is too long - continues in Part 2 of this document)

Let me know if you'd like me to:
1. Continue writing this detailed implementation (it will be very long)
2. Or if you'd prefer I start implementing the code directly instead of writing more documentation

