# PART 7: SIMPLIFIED IMPLEMENTATION PLAN (Hackathon Edition)

**FOCUS: Build Input Components First, Everything Else Later**

---

## Phase 1: Project Setup (30 minutes)

### Step 1.1: Initial Setup
- [ ] Fix package.json dependencies
- [ ] Run `npm install --legacy-peer-deps`
- [ ] Create vite.config.js, tailwind.config.js, postcss.config.js
- [ ] Create index.html with 3Dmol.js CDN
- [ ] Create src/main.jsx and src/index.css
- [ ] Create .env file
- [ ] Test `npm run dev` works

### Step 1.2: Folder Structure
- [ ] Create folders: src/components/input, src/components/ai-output, src/services, src/mock-data
- [ ] Verify structure is correct

---

## Phase 2: Input Components (FOCUS - Build These Now!)

### Step 2.1: Sequence Editor Component (45 mins)
- [ ] Create `src/components/input/SequenceEditor.jsx`
- [ ] Add state: sequence, name, isValid, isSaving, savedMessage
- [ ] Create VALID_AMINO_ACIDS constant (ACDEFGHIKLMNPQRSTVWY)
- [ ] Implement validateSequence() function
  - [ ] Remove whitespace
  - [ ] Check each character is valid
  - [ ] Return true/false
- [ ] Implement handleSequenceChange()
  - [ ] Convert to uppercase
  - [ ] Validate in real-time
  - [ ] Update isValid state
- [ ] Implement handleSave()
  - [ ] Check name and sequence not empty
  - [ ] Save to localStorage
  - [ ] Show success message
  - [ ] Clear form after 2 seconds
- [ ] Build UI:
  - [ ] Header: "Amino Acid Sequence Editor"
  - [ ] Name input field with label
  - [ ] Sequence textarea (sequence-font class, 8 rows)
  - [ ] Character counter below textarea
  - [ ] Validation error message (red, show only if invalid)
  - [ ] Save button (disabled when invalid or empty)
  - [ ] Success message (green, show after save)
- [ ] Style with Tailwind (bg-white, rounded-lg, shadow-md, p-6)
- [ ] Test component standalone

### Step 2.2: Data Table Component (1 hour)
- [ ] Create `src/components/input/DataTable.jsx`
- [ ] Add state: rows (array), isSaving, lastSaved
- [ ] Initialize rows with one empty row: {id, protein, concentration, activity, ph, temp, notes}
- [ ] Implement updateCell(rowIndex, field, value)
  - [ ] Update specific cell
  - [ ] Auto-save to localStorage
- [ ] Implement addRow()
  - [ ] Create new row with incremented ID
  - [ ] Append to rows array
  - [ ] Save to localStorage
- [ ] Implement removeRow()
  - [ ] Remove last row (keep at least 1)
  - [ ] Save to localStorage
- [ ] Implement exportToCSV()
  - [ ] Create CSV string from rows
  - [ ] Create Blob and download
- [ ] Implement loadData()
  - [ ] Get from localStorage on mount
  - [ ] Fall back to one empty row if nothing saved
- [ ] Build UI:
  - [ ] Header: "Experimental Data Table"
  - [ ] Button row: Add Row, Remove Row, Export CSV, Clear All
  - [ ] HTML table:
    - [ ] Headers: ID, Protein Name, Concentration (µM), Activity (%), pH, Temperature (°C), Notes
    - [ ] Each cell is an input field (except ID)
    - [ ] ID column is read-only, centered
  - [ ] Row count display: "X rows"
  - [ ] Save status: "Saving..." or "Last saved: [time]"
- [ ] Style with Tailwind (table with borders, inputs with padding)
- [ ] Test all operations: add, remove, edit, export, load

### Step 2.3: Protein Viewer Component (1 hour)
- [ ] Create `src/components/input/ProteinViewer.jsx`
- [ ] Add state: viewer, selectedSample, viewStyle, isLoading
- [ ] Define samples object:
  ```javascript
  {
    sample1: { name: 'Hemoglobin', pdbId: '1HHO', description: 'Oxygen-transport protein' },
    sample2: { name: 'Lysozyme', pdbId: '1LYZ', description: 'Antibacterial enzyme' },
    sample3: { name: 'Insulin', pdbId: '1MSO', description: 'Hormone protein' }
  }
  ```
- [ ] Implement useEffect to load 3Dmol.js
  - [ ] Load script from CDN
  - [ ] Call initializeViewer when loaded
- [ ] Implement initializeViewer()
  - [ ] Create $3Dmol.createViewer() instance
  - [ ] Store in viewer state
  - [ ] Load first sample
- [ ] Implement loadStructure(sampleKey)
  - [ ] Clear viewer
  - [ ] Show loading spinner
  - [ ] Fetch PDB from RCSB using pdbId
  - [ ] Add model to viewer
  - [ ] Apply current viewStyle
  - [ ] Zoom to fit
  - [ ] Hide loading spinner
- [ ] Implement applyStyle(style)
  - [ ] Switch case for: cartoon, sphere, stick, surface
  - [ ] Apply style and render
- [ ] Implement handleSampleChange(newSample)
  - [ ] Update selectedSample state
  - [ ] Load new structure
- [ ] Implement handleStyleChange(newStyle)
  - [ ] Update viewStyle state
  - [ ] Apply new style
- [ ] Implement resetView()
  - [ ] Re-center and zoom
- [ ] Build UI:
  - [ ] Header: "Protein Structure Viewer"
  - [ ] Controls row:
    - [ ] Sample dropdown (select with 3 options)
    - [ ] Style buttons: Cartoon, Sphere, Stick, Surface (active style highlighted)
    - [ ] Reset View button
  - [ ] Sample description box (blue background)
  - [ ] 3D viewer container (500px height, border)
  - [ ] Loading overlay (spinner + "Loading structure...")
  - [ ] Instructions: "Left click: rotate, Right click: pan, Scroll: zoom"
- [ ] Style with Tailwind
- [ ] Test loading all 3 samples
- [ ] Test all 4 view styles

### Step 2.4: Protocol Upload Component (30 mins)
- [ ] Create `src/components/input/ProtocolUpload.jsx`
- [ ] Add state: dragActive, uploading, protocols (array)
- [ ] Implement handleDragEnter/Leave/Over()
  - [ ] Set dragActive true/false
  - [ ] Prevent default behavior
- [ ] Implement handleDrop(e)
  - [ ] Prevent default
  - [ ] Get files from e.dataTransfer.files
  - [ ] Call handleUpload for each file
- [ ] Implement handleFileInput(e)
  - [ ] Get files from e.target.files
  - [ ] Call handleUpload for each file
- [ ] Implement handleUpload(file)
  - [ ] Validate file type (PDF, DOC, DOCX, TXT)
  - [ ] Show error if invalid type
  - [ ] Create file metadata: {id, filename, size, type, uploadDate}
  - [ ] Add to protocols array
  - [ ] Save to localStorage
  - [ ] Show success message
- [ ] Implement deleteProtocol(id)
  - [ ] Remove from protocols array
  - [ ] Save to localStorage
- [ ] Implement loadProtocols()
  - [ ] Get from localStorage on mount
  - [ ] Set protocols state
- [ ] Implement formatFileSize(bytes)
  - [ ] Convert bytes to KB/MB
- [ ] Build UI:
  - [ ] Header: "Protocol Upload"
  - [ ] Drag-drop zone:
    - [ ] Dashed border (blue when dragging over)
    - [ ] Icon (upload icon)
    - [ ] Text: "Drag & drop files here"
    - [ ] "or" text
    - [ ] "Browse Files" button
  - [ ] Accepted formats text: "Accepts: PDF, DOC, DOCX, TXT"
  - [ ] Uploaded files list:
    - [ ] Each file shows: icon, filename, size, date, delete button
    - [ ] Empty state: "No files uploaded yet"
- [ ] Style with Tailwind
- [ ] Test drag-drop upload
- [ ] Test button upload
- [ ] Test file list and delete

### Step 2.5: Create Simple App to Test Components (30 mins)
- [ ] Create basic `src/App.jsx`
- [ ] Import all 4 input components
- [ ] Create simple layout:
  - [ ] Header with title "Bio Research Platform"
  - [ ] Grid with 4 components (2x2)
  - [ ] Footer
- [ ] Style with Tailwind
- [ ] Test all 4 components render and work
- [ ] Verify data persists in localStorage

---

## Phase 3: Mock Data & API Service (LATER - After Inputs Work)

### Step 3.1: Create Mock Data Files
- [ ] Create mockSequences.json
- [ ] Create mockLettaInsights.json
- [ ] Create mockChartData.json
- [ ] Create mockPapers.json
- [ ] Create mockWebData.json

### Step 3.2: Build API Service
- [ ] Create src/services/api.js
- [ ] Add sequencesAPI, dataAPI, protocolAPI, aiAPI
- [ ] Test with mock data

---

## Phase 4: Main App Layout (LATER - After API Service)

### Step 4.1: Build Full App.jsx
- [ ] Add tab navigation (Input / Results)
- [ ] Add "Analyze with AI" button
- [ ] Connect to API service
- [ ] Build results view structure

---

## Phase 5: AI Output Components (LATER - After App Layout)

### Step 5.1-5.8: Build All AI Components
- [ ] ExecutiveSummary.jsx
- [ ] LiteratureReview.jsx
- [ ] NovelSequences.jsx
- [ ] DataVisualizations.jsx
- [ ] WebDataFindings.jsx
- [ ] ActionItems.jsx
- [ ] PredictedStructure.jsx
- [ ] AIResultsDashboard.jsx

---

## Phase 6: Integration & Testing (LATER - Final Steps)

### Step 6.1: Connect Everything
- [ ] Implement handleAnalyze() in App.jsx
- [ ] Test full workflow
- [ ] Add loading states

### Step 6.2: Polish & Demo Prep
- [ ] Fix bugs
- [ ] Prepare demo data
- [ ] Practice walkthrough
- [ ] Create documentation

---

## CURRENT FOCUS: Phase 2 Only

**Right now, build these 4 components:**
1. SequenceEditor.jsx
2. DataTable.jsx
3. ProteinViewer.jsx
4. ProtocolUpload.jsx

**Each component should:**
- Work standalone
- Save data to localStorage
- Have clean, professional UI
- Be fully functional

**Don't worry about:**
- API integration (later)
- AI features (later)
- Mock data (later)
- Full app layout (later)

---

## Quick Reference: Component Requirements

### SequenceEditor
- Validates amino acids only
- Character counter
- Save to localStorage
- Shows success message

### DataTable
- Add/remove rows
- Editable cells
- Export to CSV
- Auto-save to localStorage

### ProteinViewer
- Load 3 sample proteins
- 4 view styles
- Rotate/zoom controls
- Professional 3D display

### ProtocolUpload
- Drag-drop files
- Validate file types
- Show file list
- Delete files
- Save list to localStorage
