# EXTREMELY DETAILED IMPLEMENTATION STEPS

This document tells you EXACTLY what to build, line by line, for every component.

---

## QUICK START COMMANDS

```bash
# 1. Fix dependencies and install
npm install --legacy-peer-deps

# 2. Create all folders
mkdir -p src/components/input src/components/ai-output src/services src/mock-data

# 3. Start dev server (after creating files below)
npm run dev
```

---

## FILES TO CREATE (IN ORDER)

### FILE 1: vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true }
})
```

### FILE 2: tailwind.config.js
```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'bio-primary': '#3B82F6',
        'bio-secondary': '#10B981',
      }
    }
  }
}
```

### FILE 3: postcss.config.js
```javascript
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} }
}
```

### FILE 4: index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://3Dmol.csb.pitt.edu/build/3Dmol-min.js"></script>
    <title>Bio Research Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### FILE 5: src/main.jsx
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
```

### FILE 6: src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body { margin: 0; background: #F9FAFB; font-family: system-ui; }
.sequence-font { font-family: 'Courier New', monospace; letter-spacing: 0.1em; }
```

### FILE 7: .env
```
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK_DATA=true
```

---

## MOCK DATA FILES (Copy these exactly)

### src/mock-data/mockSequences.json
```json
{
  "sequences": [
    {
      "id": "seq_001",
      "name": "Hemoglobin Alpha",
      "sequence": "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHF"
    }
  ]
}
```

### src/mock-data/mockLettaInsights.json
```json
{
  "insights": "Analysis shows high stability at pH 7.4 with 87% improved binding affinity. The sequence exhibits strong alpha-helix propensity in regions 20-45.",
  "suggestions": [
    "Test L156A mutation for +18% thermal stability",
    "Try K78R substitution for +32% substrate binding",
    "Consider F42W mutation for fluorescence tracking"
  ],
  "confidence": 87,
  "novelSequences": [
    {
      "name": "Stability-Enhanced Variant",
      "sequence": "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHG",
      "changes": "F47G mutation",
      "improvement": "+23% binding affinity"
    }
  ]
}
```

### src/mock-data/mockChartData.json
```json
{
  "expressionData": {
    "labels": ["0h", "2h", "4h", "6h", "8h", "12h"],
    "datasets": [{
      "label": "Wild Type",
      "data": [0, 15, 35, 62, 85, 92],
      "borderColor": "#3B82F6",
      "tension": 0.4
    }, {
      "label": "Variant A",
      "data": [0, 22, 48, 75, 98, 105],
      "borderColor": "#10B981",
      "tension": 0.4
    }]
  }
}
```

### src/mock-data/mockPapers.json
```json
{
  "papers": [
    {
      "title": "Deep Learning for Protein Structure Prediction",
      "authors": ["Smith J", "Johnson A"],
      "year": 2024,
      "abstract": "Recent advances in deep learning have revolutionized protein structure prediction...",
      "url": "https://pubmed.ncbi.nlm.nih.gov/38234567"
    },
    {
      "title": "Rational Design of Thermostable Enzymes",
      "authors": ["Chen L", "Rodriguez M"],
      "year": 2024,
      "abstract": "We present a systematic approach for enhancing enzyme thermal stability...",
      "url": "https://pubmed.ncbi.nlm.nih.gov/38123456"
    }
  ]
}
```

### src/mock-data/mockWebData.json
```json
{
  "clinicalTrials": [
    {
      "nctId": "NCT05234567",
      "title": "Engineered Protein Therapeutic Phase II Study",
      "phase": "Phase 2",
      "status": "Recruiting"
    }
  ],
  "patents": [
    {
      "number": "US20240123456",
      "title": "Methods for Protein Stability Enhancement",
      "status": "Pending",
      "filingDate": "2023-11-15"
    }
  ]
}
```

---

## API SERVICE (THIS IS CRITICAL)

### src/services/api.js

```javascript
import axios from 'axios';

// Import all mock data
import mockSequences from '../mock-data/mockSequences.json';
import mockLettaInsights from '../mock-data/mockLettaInsights.json';
import mockChartData from '../mock-data/mockChartData.json';
import mockPapers from '../mock-data/mockPapers.json';
import mockWebData from '../mock-data/mockWebData.json';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

console.log('API Mode:', USE_MOCK ? 'MOCK' : 'REAL');

// Create axios instance for real API
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

// Helper: Simulate network delay for mock data
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ==================
// SEQUENCES API
// ==================
export const sequencesAPI = {
  save: async (sequenceData) => {
    if (USE_MOCK) {
      await mockDelay(500);
      const saved = {
        ...sequenceData,
        id: `seq_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('sequences') || '[]');
      existing.push(saved);
      localStorage.setItem('sequences', JSON.stringify(existing));
      
      return { data: saved };
    }
    return api.post('/api/sequences', sequenceData);
  },
  
  getAll: async () => {
    if (USE_MOCK) {
      await mockDelay(300);
      const stored = localStorage.getItem('sequences');
      return { data: stored ? JSON.parse(stored) : mockSequences.sequences };
    }
    return api.get('/api/sequences');
  }
};

// ==================
// DATA TABLE API
// ==================
export const dataAPI = {
  save: async (tableData) => {
    if (USE_MOCK) {
      await mockDelay(500);
      localStorage.setItem('tableData', JSON.stringify(tableData));
      return { data: { success: true, timestamp: new Date().toISOString() } };
    }
    return api.post('/api/data', { tableData });
  },
  
  get: async () => {
    if (USE_MOCK) {
      await mockDelay(300);
      const saved = localStorage.getItem('tableData');
      return { data: saved ? JSON.parse(saved) : [] };
    }
    return api.get('/api/data');
  }
};

// ==================
// PROTOCOL API
// ==================
export const protocolAPI = {
  upload: async (file) => {
    if (USE_MOCK) {
      await mockDelay(1000);
      const fileData = {
        id: `protocol_${Date.now()}`,
        filename: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString()
      };
      
      // Save to localStorage
      const protocols = JSON.parse(localStorage.getItem('protocols') || '[]');
      protocols.push(fileData);
      localStorage.setItem('protocols', JSON.stringify(protocols));
      
      return { data: fileData };
    }
    
    const formData = new FormData();
    formData.append('protocol', file);
    return api.post('/api/protocols', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  getAll: async () => {
    if (USE_MOCK) {
      await mockDelay(300);
      const protocols = localStorage.getItem('protocols');
      return { data: protocols ? JSON.parse(protocols) : [] };
    }
    return api.get('/api/protocols');
  }
};

// ==================
// AI ANALYSIS API
// ==================
export const aiAPI = {
  // Letta analyzes all researcher data + web data from Bright Data
  analyzeLetta: async (allData) => {
    if (USE_MOCK) {
      console.log('Mock: Analyzing with Letta AI', allData);
      await mockDelay(2500); // Simulate AI processing time
      return { data: mockLettaInsights };
    }
    // Real: Backend calls Letta after getting Bright Data results
    return api.post('/api/ai/letta/analyze', allData);
  },
  
  // ESMFold predicts protein structure
  predictProtein: async (sequence, name) => {
    if (USE_MOCK) {
      console.log('Mock: Predicting protein structure');
      await mockDelay(3000); // ESMFold takes 15-30 seconds normally
      return {
        data: {
          pdbData: 'MOCK_PDB_DATA',
          confidence: 0.92,
          predictionTime: 18.3,
          method: 'ESMFold'
        }
      };
    }
    return api.post('/api/ai/protein/predict', { sequence, name });
  },
  
  // PubMed literature search
  searchLiterature: async (query) => {
    if (USE_MOCK) {
      console.log('Mock: Searching PubMed for', query);
      await mockDelay(1000);
      return { data: mockPapers };
    }
    return api.post('/api/ai/literature/search', { query });
  },
  
  // Get chart/graph data
  getChartData: async () => {
    if (USE_MOCK) {
      await mockDelay(500);
      return { data: mockChartData };
    }
    return api.get('/api/ai/charts');
  },
  
  // Get web data from Bright Data
  getWebData: async () => {
    if (USE_MOCK) {
      await mockDelay(800);
      return { data: mockWebData };
    }
    return api.get('/api/ai/webdata');
  }
};

export default api;
```

---

## NOW BUILD THE COMPONENTS

See COMPONENTS_DETAILED.md for the exact code for every single component.

Or continue implementing based on this structure!

