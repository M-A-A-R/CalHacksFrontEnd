# 📓 NOTEBOOK SELECTION SYSTEM - IMPLEMENTATION PLAN

## 🎯 Goal
Create a user interface where researchers can choose to open:
1. **Blank Notebook** - Empty starting point
2. **Pre-filled Notebooks** - Multiple demo/template notebooks (e.g., GFP experiment, CFTR analysis, etc.)

---

## 🎨 UI/UX Design

### **Selection Screen (Before Opening Notebook)**

```
┌─────────────────────────────────────────────────────────────────┐
│                    🧬 Bio Research Notebook                     │
│                                                                 │
│                  Choose Your Starting Point                     │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │                │  │                │  │                │   │
│  │  📝 Blank      │  │  🧬 GFP Demo   │  │  🔬 CFTR Demo  │   │
│  │  Notebook      │  │                │  │                │   │
│  │                │  │                │  │                │   │
│  │  Start fresh   │  │  Mutation      │  │  Protein       │   │
│  │  with empty    │  │  analysis with │  │  engineering   │   │
│  │  components    │  │  full dataset  │  │  experiment    │   │
│  │                │  │                │  │                │   │
│  │  [Open]        │  │  [Open]        │  │  [Open]        │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Features:**
- ✅ **Card-based selection** - Each notebook type is a clickable card
- ✅ **Preview information** - Brief description of what's included
- ✅ **Visual icons** - Different emoji/icon for each type
- ✅ **Hover effects** - Cards highlight on hover
- ✅ **Expandable** - Easy to add more templates in the future

---

## 📁 File Structure

### **New Files to Create:**

```
src/
├── components/
│   └── notebook/
│       ├── NotebookLayout.jsx          (EXISTING - minor changes)
│       └── NotebookSelector.jsx        (NEW - selection modal)
├── data/
│   └── notebookTemplates.js           (NEW - all template data)
└── App.jsx                            (EXISTING - add selection logic)
```

---

## 🗂️ Data Structure

### **notebookTemplates.js Structure:**

```javascript
// Each template has:
// - id: unique identifier
// - name: display name
// - description: what it contains
// - icon: emoji or icon
// - defaultHTML: rich text content
// - notebookTitle: notebook title
// - blocks: pre-filled components (sequences, tables, etc.)

export const NOTEBOOK_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Notebook',
    description: 'Start fresh with empty components',
    icon: '📝',
    defaultHTML: '<h1>...</h1>',  // Simple default
    notebookTitle: 'Untitled Notebook',
    blocks: {
      sequences: [],
      tables: [{ /* one empty table */ }],
      proteins: [],
      protocols: []
    }
  },
  {
    id: 'gfp_demo',
    name: 'GFP Mutation Analysis',
    description: 'S65A vs Wild-Type comparison with full dataset',
    icon: '🧬',
    defaultHTML: '<h1>GFP Mutation Analysis</h1>...',  // Full GFP content
    notebookTitle: 'GFP Mutation Analysis - S65A vs Wild-Type',
    blocks: {
      sequences: [{ name: 'Wild-Type GFP', sequence: 'MSK...' }],
      tables: [
        { /* Fluorescence data */ },
        { /* Photobleaching data */ },
        { /* pH stability data */ }
      ],
      proteins: [],
      protocols: []
    }
  },
  {
    id: 'cftr_demo',
    name: 'CFTR Protein Engineering',
    description: 'F508S/R553Q mutation analysis',
    icon: '🔬',
    defaultHTML: '<h1>CFTR Engineering</h1>...',
    notebookTitle: 'CFTR Engineering - F508S/R553Q',
    blocks: {
      sequences: [{ name: 'CFTR Mutant', sequence: '...' }],
      tables: [{ /* viability data */ }],
      proteins: [],
      protocols: []
    }
  }
]
```

---

## 🔧 Implementation Steps

### **Phase 1: Create Template Data Structure** ✅ Step 1

**File:** `src/data/notebookTemplates.js`

**What to do:**
1. Create a new folder: `src/data/`
2. Create file: `notebookTemplates.js`
3. Export `NOTEBOOK_TEMPLATES` array with:
   - Blank notebook template
   - GFP demo template (move existing GFP data here)
   - CFTR demo template (optional, can add later)
4. Each template contains ALL the data needed to populate the notebook

**Data to include for each template:**
- `id` (unique key)
- `name` (display name)
- `description` (2-3 sentence summary)
- `icon` (emoji)
- `defaultHTML` (the rich text content)
- `notebookTitle` (title for the notebook header)
- `blocks` object with:
  - `sequences[]` - Array of sequence data objects
  - `tables[]` - Array of table data objects
  - `proteins[]` - Array of protein viewer data
  - `protocols[]` - Array of protocol data

---

### **Phase 2: Create Notebook Selector Component** ✅ Step 2

**File:** `src/components/notebook/NotebookSelector.jsx`

**What to do:**
1. Create a new React component: `NotebookSelector`
2. Props:
   - `onSelectTemplate(templateId)` - Callback when user selects a template
3. UI Elements:
   - Container with centered layout
   - Header: "Choose Your Starting Point"
   - Grid of template cards (3 columns on desktop, 1 on mobile)
   - Each card shows:
     - Icon (large emoji)
     - Template name (bold)
     - Description (smaller text)
     - "Open" button (red theme)
4. Styling:
   - Use existing red theme (`notebook-red`, etc.)
   - Cards with hover effect (scale up slightly, add shadow)
   - Responsive grid (Tailwind CSS: `grid grid-cols-1 md:grid-cols-3`)

**Component Structure:**
```jsx
const NotebookSelector = ({ onSelectTemplate }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        <header>
          <h1>🧬 Bio Research Notebook</h1>
          <p>Choose Your Starting Point</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {NOTEBOOK_TEMPLATES.map(template => (
            <TemplateCard 
              key={template.id}
              template={template}
              onSelect={() => onSelectTemplate(template.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

### **Phase 3: Update App.jsx to Show Selector** ✅ Step 3

**File:** `src/App.jsx`

**What to do:**
1. Add new state: `selectedTemplate` (null initially)
2. Before opening notebook, show `NotebookSelector`
3. When user selects a template:
   - Store `selectedTemplate` in state
   - Make POST request to backend (with template data)
   - Open notebook
4. Pass selected template data to `NotebookLayout`

**State Flow:**
```
Initial State:
  isNotebookOpen = false
  selectedTemplate = null
  
User clicks "Open Notebook" button:
  → Show NotebookSelector
  
User selects template:
  → selectedTemplate = 'gfp_demo' (or 'blank', etc.)
  → POST to backend with template data
  → isNotebookOpen = true
  → Render NotebookLayout with template
```

**Code Structure:**
```jsx
function App() {
  const [isNotebookOpen, setIsNotebookOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showSelector, setShowSelector] = useState(false)
  
  const handleOpenNotebook = () => {
    setShowSelector(true)  // Show template selector
  }
  
  const handleSelectTemplate = async (templateId) => {
    setSelectedTemplate(templateId)
    // POST to backend with template data
    // ...
    setIsNotebookOpen(true)
    setShowSelector(false)
  }
  
  if (showSelector) {
    return <NotebookSelector onSelectTemplate={handleSelectTemplate} />
  }
  
  if (!isNotebookOpen) {
    return <button onClick={handleOpenNotebook}>Open Bio Notebook</button>
  }
  
  return <NotebookLayout selectedTemplate={selectedTemplate} />
}
```

---

### **Phase 4: Update NotebookLayout to Load Templates** ✅ Step 4

**File:** `src/components/notebook/NotebookLayout.jsx`

**What to do:**
1. Add new prop: `selectedTemplate` (template ID string)
2. In the `useEffect` for first load:
   - Check if `selectedTemplate` is provided
   - If yes, load that template's data
   - If no, use default blank template
3. Replace the existing `isFirstLoad` logic with template loading logic

**Logic Flow:**
```javascript
useEffect(() => {
  // Check localStorage
  const isFirstLoad = /* check if empty */
  
  if (isFirstLoad && selectedTemplate) {
    // Load the selected template
    const template = NOTEBOOK_TEMPLATES.find(t => t.id === selectedTemplate)
    
    if (template) {
      // Populate document HTML
      editorRef.current.innerHTML = template.defaultHTML
      
      // Set notebook title
      setNotebookTitle(template.notebookTitle)
      
      // Create and populate blocks (sequences, tables, etc.)
      populateBlocks(template.blocks)
    }
  } else if (!isFirstLoad) {
    // Load existing data from localStorage (existing logic)
  }
}, [selectedTemplate])
```

**Helper Function:**
```javascript
const populateBlocks = (blocksData) => {
  // For each sequence in template
  blocksData.sequences.forEach(seqData => {
    const id = createBlockId('seq')
    // Save to localStorage
    // Add to sequenceBlocks state
  })
  
  // Same for tables, proteins, protocols
  // ...
}
```

---

### **Phase 5: Persist Template Choice** ✅ Step 5

**What to do:**
1. When user selects a template, save to localStorage:
   - Key: `selectedNotebookTemplate`
   - Value: template ID
2. On app reload, check this key:
   - If exists, auto-load that template
   - If doesn't exist, show selector again

**Purpose:** Prevents re-selecting template on every page reload

---

### **Phase 6: Add "New Notebook" Feature** ✅ Step 6

**File:** `src/components/ui/Header.jsx`

**What to do:**
1. Add a dropdown menu next to "Save" button
2. Menu items:
   - "New Notebook..." → Clears localStorage, shows template selector again
   - "Reset Current Notebook" → Clears data but keeps current template
3. Confirmation dialog: "This will clear all unsaved data. Continue?"

**UI:**
```
[Save ▼] [Analyze]
  │
  └─> New Notebook...
      Reset Current Notebook
```

---

## 🎨 Styling Guidelines

### **NotebookSelector Component:**

```css
/* Container */
- Background: bg-gray-50
- Centered: flex items-center justify-center
- Full height: min-h-screen

/* Header */
- Title: text-3xl font-bold text-notebook-red
- Subtitle: text-gray-600

/* Template Cards */
- Background: bg-white
- Border: border border-gray-200
- Shadow: shadow-md
- Rounded: rounded-lg
- Padding: p-6
- Hover: transform scale-105, shadow-xl

/* Card Content */
- Icon: text-6xl (large emoji)
- Name: text-xl font-semibold text-gray-800
- Description: text-sm text-gray-600
- Button: bg-notebook-red text-white hover:bg-notebook-red-hover
```

---

## 📊 Template Data Examples

### **Blank Template:**
```javascript
{
  id: 'blank',
  name: 'Blank Notebook',
  description: 'Start with empty components and build your experiment',
  icon: '📝',
  defaultHTML: `
    <h1>🧬 Bio Research Notebook</h1>
    <p>Document your experiments, analyze sequences, and track protocols</p>
    <p><strong>Get started:</strong> Use the sidebar to add components!</p>
  `,
  notebookTitle: 'Untitled Notebook',
  blocks: {
    sequences: [],
    tables: [],
    proteins: [],
    protocols: []
  }
}
```

### **GFP Demo Template:**
```javascript
{
  id: 'gfp_demo',
  name: 'GFP Mutation Analysis',
  description: 'Complete GFP S65A vs Wild-Type experiment with 3 data tables and full sequence',
  icon: '🧬',
  defaultHTML: `
    <h1>🧬 GFP Mutation Analysis</h1>
    <p><strong>Project:</strong> GFP Brightness Enhancement</p>
    <p><strong>Goal:</strong> Test if S65A mutation improves GFP brightness</p>
    <!-- Full GFP content here -->
  `,
  notebookTitle: 'GFP Mutation Analysis - S65A vs Wild-Type',
  blocks: {
    sequences: [
      {
        name: 'Wild-Type GFP (238aa)',
        sequence: 'MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGK...',
        savedAt: new Date().toISOString()
      }
    ],
    tables: [
      {
        columns: ['Sample', 'Bio Rep', 'Tech Rep', ...],
        rows: [
          { id: 1, 'Sample': 'WT-1', ... },
          // All 18 rows
        ]
      },
      // Table 2 and 3
    ],
    proteins: [],
    protocols: []
  }
}
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         App.jsx                             │
│                                                             │
│  1. User clicks "Open Bio Notebook"                        │
│     → showSelector = true                                   │
│                                                             │
│  2. NotebookSelector renders                               │
│     → User clicks "GFP Demo" card                          │
│     → onSelectTemplate('gfp_demo')                         │
│                                                             │
│  3. App.jsx receives template ID                           │
│     → selectedTemplate = 'gfp_demo'                        │
│     → Fetch template from notebookTemplates.js             │
│     → POST to backend with template data                    │
│     → isNotebookOpen = true                                │
│                                                             │
│  4. NotebookLayout renders with selectedTemplate prop      │
│     → Loads template data into localStorage                │
│     → Populates editorRef with defaultHTML                 │
│     → Creates sequence/table blocks with template data     │
│     → Sets notebook title                                   │
│                                                             │
│  5. Notebook is now open with pre-filled data!             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Plan

### **Test 1: Blank Notebook**
1. Clear localStorage
2. Click "Open Bio Notebook"
3. Select "Blank Notebook"
4. ✅ Should see: Empty components, default title, basic placeholder text

### **Test 2: GFP Demo Notebook**
1. Clear localStorage
2. Click "Open Bio Notebook"
3. Select "GFP Demo"
4. ✅ Should see: Full GFP content, sequence editor with 238aa sequence, 3 data tables, specific title

### **Test 3: CFTR Demo Notebook**
1. Clear localStorage
2. Click "Open Bio Notebook"
3. Select "CFTR Demo"
4. ✅ Should see: CFTR-specific content and data

### **Test 4: Template Persistence**
1. Select GFP Demo
2. Edit some data
3. Refresh page
4. ✅ Should see: Edits preserved, still in GFP template

### **Test 5: New Notebook Feature**
1. Open GFP Demo
2. Click dropdown → "New Notebook..."
3. Select "Blank Notebook"
4. ✅ Should see: Fresh blank notebook, GFP data cleared

---

## ⚙️ Configuration Options

### **Easy Customization:**

**To add a new template:**
1. Add new object to `NOTEBOOK_TEMPLATES` array in `notebookTemplates.js`
2. Define `id`, `name`, `description`, `icon`, `defaultHTML`, `notebookTitle`, `blocks`
3. Done! It will automatically appear in the selector

**To modify existing templates:**
1. Edit the template object in `notebookTemplates.js`
2. Update `defaultHTML` for text content
3. Update `blocks` for component data
4. Changes apply to new notebooks (existing notebooks keep their data)

---

## 🚨 Edge Cases to Handle

1. **User closes selector without choosing:**
   - Show selector again when they click "Open Notebook"
   
2. **User has existing data in localStorage:**
   - Don't overwrite! Only load template on true first load
   
3. **Template not found:**
   - Fallback to blank template
   - Log error to console
   
4. **User clicks "New Notebook" with unsaved changes:**
   - Show confirmation dialog: "Unsaved changes will be lost. Continue?"
   - If yes → Clear localStorage → Show selector
   - If no → Cancel action

---

## 📋 Implementation Checklist

### **Phase 1: Data Structure**
- [ ] Create `src/data/` folder
- [ ] Create `notebookTemplates.js`
- [ ] Define `NOTEBOOK_TEMPLATES` array
- [ ] Add blank template
- [ ] Add GFP demo template (move existing data)
- [ ] Add CFTR demo template (optional)

### **Phase 2: Selector UI**
- [ ] Create `NotebookSelector.jsx` component
- [ ] Import `NOTEBOOK_TEMPLATES`
- [ ] Build card grid layout
- [ ] Add hover effects
- [ ] Style with red theme
- [ ] Make responsive (mobile + desktop)

### **Phase 3: App Integration**
- [ ] Update `App.jsx` state management
- [ ] Add `showSelector` state
- [ ] Add `selectedTemplate` state
- [ ] Modify `handleOpenNotebook` to show selector
- [ ] Add `handleSelectTemplate` function
- [ ] Conditional rendering logic

### **Phase 4: NotebookLayout Updates**
- [ ] Add `selectedTemplate` prop
- [ ] Create `populateBlocks` helper function
- [ ] Update `useEffect` to load template on first load
- [ ] Populate document HTML from template
- [ ] Populate blocks (sequences, tables, etc.) from template
- [ ] Set notebook title from template

### **Phase 5: Persistence**
- [ ] Save selected template ID to localStorage
- [ ] Load template ID on app reload
- [ ] Auto-select template if one was previously chosen

### **Phase 6: "New Notebook" Feature**
- [ ] Add dropdown to Header component
- [ ] Add "New Notebook..." menu item
- [ ] Add confirmation dialog
- [ ] Clear localStorage on confirm
- [ ] Show template selector again

### **Phase 7: Testing**
- [ ] Test blank notebook
- [ ] Test GFP demo notebook
- [ ] Test CFTR demo notebook (if added)
- [ ] Test template persistence
- [ ] Test "New Notebook" feature
- [ ] Test edge cases (no selection, existing data, etc.)

---

## 🎯 Final Result

**User Experience:**

1. **First Time:**
   - Click "Open Bio Notebook" → See beautiful template selector
   - Choose "GFP Demo" → Instant notebook with full data
   - Start analyzing immediately!

2. **Return Visit:**
   - Page loads → Notebook opens with saved data
   - Can edit, add more data, analyze

3. **Want to Start Fresh:**
   - Click dropdown → "New Notebook..."
   - Choose new template → Fresh start!

**Developer Experience:**

- ✅ **Clean separation of concerns** - Templates in one file, UI in another
- ✅ **Easy to extend** - Add new templates by editing one file
- ✅ **Maintainable** - Template data is structured and documented
- ✅ **Flexible** - Can add unlimited templates without changing code logic

---

## 📈 Future Enhancements (Post-Demo)

1. **Template Categories** - Group templates by topic (Protein, DNA, Microscopy, etc.)
2. **Search/Filter** - Search templates by name or description
3. **Template Preview** - Hover to see thumbnail preview of notebook
4. **Custom Templates** - Let users save their notebooks as reusable templates
5. **Import/Export** - Share templates as JSON files
6. **Template Marketplace** - Download community-created templates

---

## ✅ Success Criteria

**The system is successful if:**
- ✅ User can easily choose between blank or pre-filled notebooks
- ✅ Template selection is visually appealing and intuitive
- ✅ Pre-filled templates load completely and correctly
- ✅ User can switch templates without breaking existing data
- ✅ Adding new templates is straightforward (just edit one file)
- ✅ Works seamlessly with existing save/load functionality

---

**Let's build this step-by-step! Ready to start with Phase 1?** 🚀

