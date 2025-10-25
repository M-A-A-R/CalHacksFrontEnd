# PART 7: DETAILED IMPLEMENTATION PLAN (Step-by-Step with Checkboxes)

Copy this entire content to replace Part 7 in Plan_doc

---

## Phase 1: Project Foundation & Setup

### Step 1.1: Initial Project Configuration
- [ ] Update package.json with correct dependencies (React 18.2.0, remove problematic versions)
- [ ] Run `npm install --legacy-peer-deps` to resolve dependency conflicts
- [ ] Verify all packages installed correctly
- [ ] Test that `npm run dev` command is available

### Step 1.2: Build Configuration Files
- [ ] Create `vite.config.js` with React plugin and port 5173
- [ ] Create `tailwind.config.js` with custom bio-themed colors
- [ ] Create `postcss.config.js` with Tailwind and Autoprefixer
- [ ] Test that build system recognizes Tailwind classes

### Step 1.3: HTML and Entry Point Setup
- [ ] Create `index.html` with 3Dmol.js CDN script
- [ ] Create `src/main.jsx` as React entry point
- [ ] Create `src/index.css` with Tailwind directives and sequence-font class
- [ ] Test that app renders "Hello World" successfully

### Step 1.4: Environment and Folder Structure
- [ ] Create `.env` file with VITE_API_URL and VITE_USE_MOCK_DATA=true
- [ ] Create folder: `src/components/input/`
- [ ] Create folder: `src/components/ai-output/`
- [ ] Create folder: `src/services/`
- [ ] Create folder: `src/mock-data/`
- [ ] Create folder: `public/`
- [ ] Verify folder structure matches plan

---

## Phase 2: Mock Data Layer

### Step 2.1: Create Sequence Mock Data
- [ ] Create `src/mock-data/mockSequences.json`
- [ ] Add 2-3 sample protein sequences with id, name, sequence, timestamp
- [ ] Validate JSON structure is correct
- [ ] Test importing in JavaScript

### Step 2.2: Create Letta AI Mock Data
- [ ] Create `src/mock-data/mockLettaInsights.json`
- [ ] Add insights text (realistic AI analysis)
- [ ] Add suggestions array (3-4 mutation recommendations)
- [ ] Add novelSequences array (2-3 AI-generated variants with improvements)
- [ ] Add confidence score (0-100)
- [ ] Validate JSON structure

### Step 2.3: Create Chart Mock Data
- [ ] Create `src/mock-data/mockChartData.json`
- [ ] Add expressionData (line chart with 2 datasets)
- [ ] Add bindingAffinity (bar chart with 4 data points)
- [ ] Add stabilityProfile (line chart for thermal stability)
- [ ] Ensure data format is compatible with Chart.js
- [ ] Validate JSON structure

### Step 2.4: Create Papers Mock Data
- [ ] Create `src/mock-data/mockPapers.json`
- [ ] Add 5 sample research papers with realistic titles
- [ ] Include: title, authors, year, journal, abstract, url, pmid
- [ ] Make abstracts realistic (2-3 sentences about protein research)
- [ ] Validate JSON structure

### Step 2.5: Create Web Data Mock
- [ ] Create `src/mock-data/mockWebData.json`
- [ ] Add clinicalTrials array (2-3 trials with NCT IDs, phase, status)
- [ ] Add patents array (2-3 patents with numbers, titles, status)
- [ ] Add marketData object (competitors, market size, growth rate)
- [ ] Add relatedCompounds array (2-3 competing therapeutics)
- [ ] Validate JSON structure

---

## Phase 3: API Service Layer

### Step 3.1: Create API Service Foundation
- [ ] Create `src/services/api.js`
- [ ] Import axios and all mock data files
- [ ] Set up API_BASE_URL from environment variable
- [ ] Set up USE_MOCK flag from environment variable
- [ ] Create axios instance with baseURL, headers, 30s timeout
- [ ] Add console.log to show if using MOCK or REAL mode

### Step 3.2: Implement Helper Functions
- [ ] Create mockDelay function (simulates API latency)
- [ ] Add error logging interceptors to axios
- [ ] Test that delays work correctly

### Step 3.3: Implement Sequences API
- [ ] Create sequencesAPI.save() function
  - [ ] Check USE_MOCK flag
  - [ ] If mock: add delay, generate ID, save to localStorage, return data
  - [ ] If real: call api.post('/api/sequences')
- [ ] Create sequencesAPI.getAll() function
  - [ ] Check USE_MOCK flag
  - [ ] If mock: get from localStorage or return mockSequences
  - [ ] If real: call api.get('/api/sequences')
- [ ] Test both functions with mock data

### Step 3.4: Implement Data Table API
- [ ] Create dataAPI.save() function with localStorage persistence
- [ ] Create dataAPI.get() function with fallback to empty array
- [ ] Test saving and loading table data

### Step 3.5: Implement Protocol API
- [ ] Create protocolAPI.upload() function
  - [ ] Handle File object
  - [ ] Store metadata in localStorage (filename, size, date)
  - [ ] Mock: return file metadata
  - [ ] Real: use FormData and multipart upload
- [ ] Create protocolAPI.getAll() function
- [ ] Test file upload simulation

### Step 3.6: Implement AI APIs
- [ ] Create aiAPI.analyzeLetta() - 2.5s delay, return mockLettaInsights
- [ ] Create aiAPI.predictProtein() - 3s delay, return mock PDB data
- [ ] Create aiAPI.searchLiterature() - 1s delay, return mockPapers
- [ ] Create aiAPI.getChartData() - 0.5s delay, return mockChartData
- [ ] Create aiAPI.getWebData() - 0.8s delay, return mockWebData
- [ ] Add console.logs for debugging each API call
- [ ] Test all API functions return correct mock data

---

## Phase 4: Input Components

### Step 4.1: Sequence Editor Component
- [ ] Create `src/components/input/SequenceEditor.jsx`
- [ ] Set up component state:
  - [ ] sequence (string)
  - [ ] name (string)
  - [ ] isValid (boolean)
  - [ ] isSaving (boolean)
  - [ ] savedMessage (string)
- [ ] Define VALID_AMINO_ACIDS constant
- [ ] Implement validateSequence() function
  - [ ] Remove whitespace
  - [ ] Check each character is in VALID_AMINO_ACIDS
  - [ ] Return true/false
- [ ] Implement handleSequenceChange()
  - [ ] Convert to uppercase
  - [ ] Validate in real-time
  - [ ] Update isValid state
- [ ] Implement handleSave()
  - [ ] Validate name and sequence not empty
  - [ ] Call sequencesAPI.save()
  - [ ] Show success message
  - [ ] Clear form after 2 seconds
- [ ] Build UI:
  - [ ] Header with title
  - [ ] Name input field
  - [ ] Sequence textarea with sequence-font class
  - [ ] Character counter
  - [ ] Validation error message (red, conditional)
  - [ ] Save button (disabled when invalid)
  - [ ] Success message (green, conditional)
- [ ] Style with Tailwind classes
- [ ] Test component in isolation

### Step 4.2: Data Table Component
- [ ] Create `src/components/input/DataTable.jsx`
- [ ] Set up component state:
  - [ ] rows (array of objects)
  - [ ] isSaving (boolean)
  - [ ] lastSaved (string timestamp)
- [ ] Define initial columns: ID, Protein, Concentration, Activity, pH, Temp, Notes
- [ ] Implement loadData() - fetch from dataAPI on mount
- [ ] Implement saveData() - call dataAPI.save()
- [ ] Implement updateCell() - update specific row/field, auto-save
- [ ] Implement addRow() - append empty row, save
- [ ] Implement removeRow() - remove last row, save
- [ ] Implement exportToCSV()
  - [ ] Generate CSV string from rows
  - [ ] Create Blob and download link
  - [ ] Trigger download
- [ ] Build UI:
  - [ ] Header with title
  - [ ] Button row: Add, Remove, Export CSV, Clear
  - [ ] HTML table with headers
  - [ ] Editable input cells for each column
  - [ ] Row count display
  - [ ] Save status indicator
- [ ] Use react-data-grid if time permits, otherwise HTML table
- [ ] Style with Tailwind
- [ ] Test all CRUD operations

### Step 4.3: Protein Viewer Component
- [ ] Create `src/components/input/ProteinViewer.jsx`
- [ ] Set up component state:
  - [ ] viewer (3Dmol viewer instance)
  - [ ] selectedSample (string)
  - [ ] viewStyle (cartoon/sphere/stick/surface)
  - [ ] isLoading (boolean)
- [ ] Define samples object with 3 sample proteins (name, pdbId, description)
- [ ] Implement useEffect to load 3Dmol.js from CDN
- [ ] Implement initializeViewer()
  - [ ] Create $3Dmol.createViewer() instance
  - [ ] Store in state
- [ ] Implement loadStructure()
  - [ ] Clear viewer
  - [ ] Fetch PDB from RCSB or use provided pdbData
  - [ ] Add model to viewer
  - [ ] Apply style and render
- [ ] Implement applyStyle() for different visualization modes
- [ ] Implement handleSampleChange() - switch between samples
- [ ] Implement handleStyleChange() - change visualization style
- [ ] Implement resetView() - re-center and zoom
- [ ] Build UI:
  - [ ] Header with title
  - [ ] Sample dropdown (if no custom PDB provided)
  - [ ] Style buttons (4 options)
  - [ ] Reset view button
  - [ ] Sample description box
  - [ ] 3D viewer container (500px height)
  - [ ] Loading spinner overlay
  - [ ] Control instructions
- [ ] Style with Tailwind
- [ ] Test loading and switching between samples
- [ ] Test all view styles

### Step 4.4: Protocol Upload Component
- [ ] Create `src/components/input/ProtocolUpload.jsx`
- [ ] Set up component state:
  - [ ] dragActive (boolean)
  - [ ] uploading (boolean)
  - [ ] protocols (array of uploaded files)
- [ ] Implement handleDrag events (enter, leave, over) for visual feedback
- [ ] Implement handleDrop()
  - [ ] Prevent default
  - [ ] Get files from dataTransfer
  - [ ] Call handleUpload
- [ ] Implement handleFileInput() for button upload
- [ ] Implement handleUpload()
  - [ ] Validate file type (PDF, DOC, DOCX, TXT)
  - [ ] Call protocolAPI.upload() for each file
  - [ ] Add to protocols array
  - [ ] Show success message
- [ ] Implement deleteProtocol() - remove from list
- [ ] Build UI:
  - [ ] Header with title
  - [ ] Drag-drop zone (dashed border, hover effect)
  - [ ] File input button
  - [ ] Accepted formats text
  - [ ] Uploaded files list:
    - [ ] File name
    - [ ] File size (formatted)
    - [ ] Upload date
    - [ ] Delete button
  - [ ] Upload progress indicator
- [ ] Style with Tailwind
- [ ] Test drag-drop upload
- [ ] Test button upload
- [ ] Test file list display

---

## Phase 5: AI Output Components

### Step 5.1: Executive Summary Component
- [ ] Create `src/components/ai-output/ExecutiveSummary.jsx`
- [ ] Accept `data` prop with insights, suggestions, confidence
- [ ] Build UI:
  - [ ] Large card with shadow
  - [ ] Title: "AI Analysis Summary"
  - [ ] Insights text (multi-line, formatted)
  - [ ] Confidence badge (colored based on score)
  - [ ] Key suggestions as bullet list
  - [ ] Processing time indicator
- [ ] Style with Tailwind
- [ ] Test with mock data

### Step 5.2: Literature Review Component
- [ ] Create `src/components/ai-output/LiteratureReview.jsx`
- [ ] Accept `papers` prop
- [ ] Build UI:
  - [ ] Search input (filter papers)
  - [ ] Grid layout (3 columns)
  - [ ] Paper cards with:
    - [ ] Title (clickable link)
    - [ ] Authors list
    - [ ] Year and journal
    - [ ] Abstract preview (truncated to 200 chars)
    - [ ] PMID
    - [ ] Relevance score badge
  - [ ] "View Full Abstract" expand functionality
- [ ] Implement search filtering
- [ ] Style with Tailwind
- [ ] Test with mock papers

### Step 5.3: Predicted Structure Component
- [ ] Create `src/components/ai-output/PredictedStructure.jsx`
- [ ] Reuse ProteinViewer component
- [ ] Accept `pdbData` and `metadata` props
- [ ] Build UI:
  - [ ] Protein viewer (embedded)
  - [ ] Confidence score display
  - [ ] Prediction method (ESMFold)
  - [ ] Prediction time
  - [ ] Download PDB button
  - [ ] Comparison toggle (original vs predicted)
- [ ] Implement side-by-side view if original structure exists
- [ ] Style with Tailwind
- [ ] Test with mock PDB data

### Step 5.4: Novel Sequences Component
- [ ] Create `src/components/ai-output/NovelSequences.jsx`
- [ ] Accept `sequences` prop
- [ ] Build UI:
  - [ ] List of sequence cards
  - [ ] Each card shows:
    - [ ] Sequence name
    - [ ] Actual sequence (monospace, colored)
    - [ ] Mutations highlighted (different color)
    - [ ] Predicted improvement percentage
    - [ ] AI reasoning text
    - [ ] "Predict Structure" button
- [ ] Implement mutation highlighting (compare to original)
- [ ] Handle "Predict Structure" button click
- [ ] Style with Tailwind
- [ ] Test with mock sequences

### Step 5.5: Data Visualizations Component
- [ ] Create `src/components/ai-output/DataVisualizations.jsx`
- [ ] Install and import Chart.js and react-chartjs-2
- [ ] Accept `chartData` prop
- [ ] Build UI:
  - [ ] Grid layout (2 columns)
  - [ ] Line chart: Expression over time
  - [ ] Bar chart: Binding affinity comparison
  - [ ] Line chart: Thermal stability profile
  - [ ] Chart titles and axis labels
- [ ] Configure Chart.js options for responsive design
- [ ] Style with Tailwind
- [ ] Test all 3 charts render correctly

### Step 5.6: Web Data Findings Component
- [ ] Create `src/components/ai-output/WebDataFindings.jsx`
- [ ] Accept `webData` prop
- [ ] Build UI:
  - [ ] 4 sections (tabs or accordion):
    - [ ] Clinical Trials table (NCT ID, title, phase, status badges)
    - [ ] Patents list (number, title, filing date, status)
    - [ ] Market Data cards (competitors, size, growth)
    - [ ] Related Compounds table (name, developer, status, mechanism)
  - [ ] Status badges (color-coded)
  - [ ] External links for trials and patents
- [ ] Style with Tailwind
- [ ] Test all sections display correctly

### Step 5.7: Action Items Component
- [ ] Create `src/components/ai-output/ActionItems.jsx`
- [ ] Accept `actionItems` prop
- [ ] Build UI:
  - [ ] Numbered priority list (1, 2, 3...)
  - [ ] Each item shows:
    - [ ] Priority badge (color: high=red, medium=orange, low=green)
    - [ ] Action description
    - [ ] Rationale text
    - [ ] Checkbox (mark complete)
  - [ ] Completion tracking
- [ ] Implement checkbox state management
- [ ] Style with Tailwind
- [ ] Test action list display

### Step 5.8: AI Results Dashboard Container
- [ ] Create `src/components/ai-output/AIResultsDashboard.jsx`
- [ ] Accept `results` prop with all AI data
- [ ] Build UI:
  - [ ] Header with "AI Analysis Results"
  - [ ] Loading state (spinner, "Analyzing...")
  - [ ] Error state (if analysis fails)
  - [ ] Tab navigation or sections for 7 components:
    1. [ ] Executive Summary
    2. [ ] Literature Review
    3. [ ] Predicted Structure
    4. [ ] Novel Sequences
    5. [ ] Data Visualizations
    6. [ ] Web Data Findings
    7. [ ] Action Items
  - [ ] "Analyze Again" button
  - [ ] Export report button (stretch goal)
- [ ] Implement tab switching
- [ ] Pass correct data to each child component
- [ ] Style with Tailwind
- [ ] Test dashboard with all mock data

---

## Phase 6: Main Application

### Step 6.1: Create App.jsx Structure
- [ ] Create `src/App.jsx`
- [ ] Set up app-level state:
  - [ ] activeTab ('input' or 'results')
  - [ ] isAnalyzing (boolean)
  - [ ] aiResults (object)
  - [ ] allInputData (object: sequences, tableData, protocols)
- [ ] Import all input components
- [ ] Import AIResultsDashboard
- [ ] Import API service

### Step 6.2: Build App Header
- [ ] Create header component/section:
  - [ ] App title: "Bio Research Platform"
  - [ ] Logo (bio/DNA icon)
  - [ ] Navigation buttons:
    - [ ] "Input Data" tab
    - [ ] "AI Results" tab
  - [ ] Active tab indicator
- [ ] Style with Tailwind (sticky header, bg-bio-primary)
- [ ] Test navigation switches view

### Step 6.3: Build Input View
- [ ] Create input view container
- [ ] Arrange 4 input components in grid (2x2)
  - [ ] SequenceEditor (top-left)
  - [ ] DataTable (top-right)
  - [ ] ProteinViewer (bottom-left)
  - [ ] ProtocolUpload (bottom-right)
- [ ] Add "Analyze with AI" button (large, centered, bottom)
- [ ] Style with Tailwind (responsive grid)
- [ ] Test layout on different screen sizes

### Step 6.4: Implement AI Analysis Function
- [ ] Create handleAnalyze() function:
  - [ ] Collect all input data (sequences from API, table data, protocols)
  - [ ] Validate at least some data exists
  - [ ] Set isAnalyzing to true
  - [ ] Call aiAPI.analyzeLetta(allData)
  - [ ] Call aiAPI.getChartData()
  - [ ] Call aiAPI.getWebData()
  - [ ] Combine all results into aiResults state
  - [ ] Set isAnalyzing to false
  - [ ] Switch to 'results' tab
  - [ ] Handle errors gracefully
- [ ] Test analysis workflow end-to-end

### Step 6.5: Build Results View
- [ ] Create results view container
- [ ] Render AIResultsDashboard with aiResults
- [ ] Add "Back to Input" button
- [ ] Show loading spinner when isAnalyzing is true
- [ ] Style with Tailwind
- [ ] Test switching between input and results

### Step 6.6: Build App Footer
- [ ] Create footer component:
  - [ ] Copyright text
  - [ ] Links (GitHub, docs)
  - [ ] Version number
- [ ] Style with Tailwind
- [ ] Test footer displays correctly

### Step 6.7: Global Styles and Polish
- [ ] Add global loading spinner component
- [ ] Add toast notifications for success/error
- [ ] Implement responsive design breakpoints
- [ ] Add smooth transitions between views
- [ ] Test on mobile devices
- [ ] Fix any visual bugs

---

## Phase 7: Testing & Validation

### Step 7.1: Component-Level Testing
- [ ] Test SequenceEditor: enter valid/invalid sequences
- [ ] Test DataTable: add/remove/edit rows, export CSV
- [ ] Test ProteinViewer: load samples, change styles
- [ ] Test ProtocolUpload: drag-drop and button upload
- [ ] Fix any bugs found

### Step 7.2: API Integration Testing
- [ ] Test all API calls work with mock data
- [ ] Verify localStorage persistence
- [ ] Test API error handling
- [ ] Verify correct delays are applied
- [ ] Check console logs show correct mode (MOCK/REAL)

### Step 7.3: AI Workflow Testing
- [ ] Input data in all 4 components
- [ ] Click "Analyze with AI"
- [ ] Verify loading state shows
- [ ] Verify all 7 AI output sections populate
- [ ] Verify data matches mock data
- [ ] Test "Back to Input" button
- [ ] Test "Analyze Again" functionality

### Step 7.4: UI/UX Testing
- [ ] Test responsive design on mobile (375px)
- [ ] Test responsive design on tablet (768px)
- [ ] Test responsive design on desktop (1920px)
- [ ] Verify all buttons have hover states
- [ ] Verify loading spinners are visible
- [ ] Check color contrast for accessibility
- [ ] Test keyboard navigation

### Step 7.5: Edge Case Testing
- [ ] Test with no input data (should show error)
- [ ] Test with very long sequences (100+ amino acids)
- [ ] Test with large data tables (20+ rows)
- [ ] Test uploading multiple protocols
- [ ] Test browser refresh (data persistence)
- [ ] Clear localStorage and test fresh state

---

## Phase 8: Demo Preparation

### Step 8.1: Prepare Demo Data
- [ ] Create impressive sample sequence (real protein)
- [ ] Pre-populate data table with realistic experimental data
- [ ] Have sample protocol PDF ready
- [ ] Prepare talking points for each feature
- [ ] Practice 5-minute walkthrough

### Step 8.2: Performance Optimization
- [ ] Minimize bundle size
- [ ] Optimize images and assets
- [ ] Test loading speed
- [ ] Add service worker (if time permits)

### Step 8.3: Documentation
- [ ] Create README.md with setup instructions
- [ ] Document API endpoints for backend partner
- [ ] Create .env.example file
- [ ] Add inline code comments
- [ ] Document known issues/limitations

### Step 8.4: Final Polish
- [ ] Fix any remaining visual bugs
- [ ] Ensure consistent styling across all components
- [ ] Add favicon
- [ ] Test one more time end-to-end
- [ ] Deploy to Vercel/Netlify (optional)

---

## Success Criteria

### Core Functionality
- [ ] Users can enter amino acid sequences with validation
- [ ] Users can input experimental data in editable table
- [ ] Users can view 3D protein structures
- [ ] Users can upload protocol files
- [ ] "Analyze with AI" button triggers analysis
- [ ] All 7 AI output sections display with mock data
- [ ] Navigation between input and results works smoothly

### Technical Requirements
- [ ] Frontend works 100% with mock data (no backend needed)
- [ ] localStorage persists data between sessions
- [ ] All components are responsive (mobile/tablet/desktop)
- [ ] No console errors in browser
- [ ] Loading states show during async operations
- [ ] Error messages display when appropriate

### UI/UX Quality
- [ ] Professional, clean design
- [ ] Consistent color scheme (bio-themed blues/greens)
- [ ] Smooth transitions and animations
- [ ] Clear labels and instructions
- [ ] Intuitive navigation
- [ ] Fast perceived performance

### Demo Readiness
- [ ] Can complete full workflow in under 3 minutes
- [ ] Sample data is impressive and realistic
- [ ] No crashes or freezes during demo
- [ ] All features are explainable in simple terms
- [ ] Judges say "Wow, this looks amazing!"

