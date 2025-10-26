# UI REDESIGN PLAN - Red Notebook Theme

## Overview

Transform the UI into a clean, minimal, red-themed notebook interface with text formatting toolbar, red sidebar for components, and redesigned minimal components.

---

## YOUR REQUIREMENTS

1. ✅ Top bar with text formatting (bold, underline, horizontal lines, sections)
2. ✅ Clean red sidebar to add components (sequence editor, etc.)
3. ✅ Red color scheme - appealing notebook look
4. ✅ Nice header for organization
5. ✅ Infinite scroll - notebook can get longer
6. ✅ Fix bulky components - make them minimal and clean

---

## ⚠️ CRITICAL: DATA SAFEGUARDS - DO NOT BREAK BACKEND!

### 🎯 ABSOLUTE NON-NEGOTIABLES (NEVER TOUCH!)

#### **1. The storageKey Prop System**
- **MUST ALWAYS** pass `storageKey` to all components
- Example: `<SequenceEditor storageKey={`sequence-block-${block.id}`} />`
- **WHY:** NotebookLayout uses this to find component data in localStorage
- **NEVER:** Remove, rename, or change the prop name or key pattern

#### **2. localStorage Saving Inside Components**
- SequenceEditor: `window.localStorage.setItem(storageKey, JSON.stringify({name, sequence, savedAt}))`
- DataTable: `window.localStorage.setItem(storageKey, JSON.stringify({columns, rows}))`
- **NEVER:** Remove these localStorage.setItem() calls
- **NEVER:** Change data structures (backend expects exact format!)

#### **3. NotebookLayout Data Functions - DO NOT MODIFY!**
Functions that MUST remain intact:
- `collectBlockPayloads()` - Reads component data from localStorage
- `collectSnapshot()` - Assembles full data for backend  
- `handleSaveNotebook()` - Sends data to backend POST endpoint
- **WHY:** These are the ONLY bridge between frontend and backend

#### **4. Block State Arrays - MUST KEEP!**
```javascript
const [sequenceBlocks, setSequenceBlocks] = useState([])
const [proteinBlocks, setProteinBlocks] = useState([])
const [tableBlocks, setTableBlocks] = useState([])
const [protocolBlocks, setProtocolBlocks] = useState([])
```

#### **5. localStorage Keys (Constants) - DO NOT RENAME!**
```javascript
const DOCUMENT_KEY = 'labNotebookDocument'
const SEQUENCE_BLOCKS_KEY = 'labNotebookSequenceBlocks'
const PROTEIN_BLOCKS_KEY = 'labNotebookProteinBlocks'
const TABLE_BLOCKS_KEY = 'labNotebookTableBlocks'
const PROTOCOL_BLOCKS_KEY = 'labNotebookProtocolBlocks'
```

#### **6. Backend API Contract**
- Endpoint: `POST http://localhost:8000/api/notebook/save`
- Payload MUST include: `{savedAt, changes, snapshot}`
- Snapshot MUST include: `{documentHtml, sequenceBlocks, tableBlocks, sequences, tables, protocols}`
- **COORDINATE WITH YOUR PARTNER IF YOU CHANGE ANYTHING!**

---

### ✅ SAFE TO CHANGE (Visual Only)

You CAN freely modify:
- ✅ CSS classes, colors, borders, shadows, padding, margins
- ✅ Button appearances (keep onClick handlers intact!)
- ✅ Component layout (absolute positioning → vertical stacking)
- ✅ Typography, font sizes, line heights
- ✅ Animations and transitions
- ✅ Add new UI elements (sidebar, header, toolbar)
- ✅ Reorganize JSX structure (keep data logic intact)

You CANNOT change:
- 🔴 localStorage keys or saving logic
- 🔴 storageKey prop system
- 🔴 Data structures (e.g., `{name, sequence, savedAt}`)
- 🔴 State management for blocks
- 🔴 Backend sync functions
- 🔴 Component data collection logic

---

### 🔴 HIGH RISK PHASES - EXTRA CAREFUL!

#### **PHASE 6 - Component Redesign (DANGER ZONE!)**
- ✅ **SAFE:** Change all CSS styling, colors, spacing
- ✅ **SAFE:** Simplify UI, remove bulky boxes
- 🔴 **NEVER:** Remove `storageKey` prop from component signature
- 🔴 **NEVER:** Remove `handleSave()` functions or localStorage logic
- 🔴 **NEVER:** Change data structures that get saved
- ⚠️ **TEST:** After each component redesign, verify data still saves to localStorage

#### **PHASE 7 - Layout Integration (DANGER ZONE!)**
- ✅ **SAFE:** Add sidebar and header (new JSX)
- ✅ **SAFE:** Change from absolute positioning to vertical stacking
- 🔴 **NEVER:** Remove state arrays (sequenceBlocks, etc.)
- 🔴 **NEVER:** Remove `collectBlockPayloads()`, `collectSnapshot()`, `handleSaveNotebook()`
- 🔴 **NEVER:** Remove "Save" button or change its onClick handler
- ⚠️ **IF REMOVING X/Y:** Add block order tracking instead (`{id, order}`)
- ⚠️ **UPDATE:** `collectSnapshot()` to send order instead of x/y if needed

---

### 🧪 TESTING CHECKLIST (AFTER PHASES 6 & 7)

**Test 1: Component localStorage**
```
[ ] Add Sequence Editor, enter data, click Save
[ ] Open DevTools → Application → Local Storage
[ ] Find key: sequence-block-[id]
[ ] Verify value: {"name":"...","sequence":"...","savedAt":"..."}
```

**Test 2: Backend Sync**
```
[ ] Add multiple components with data
[ ] Click "Save" button in header
[ ] Open DevTools → Network tab
[ ] Verify POST to: http://localhost:8000/api/notebook/save
[ ] Check payload has: documentHtml, sequenceBlocks, sequences, tables
[ ] Verify 200 OK response
```

**Test 3: Data Persistence**
```
[ ] Enter data in components
[ ] Refresh page
[ ] Verify all data persists (from localStorage)
```

---

## PHASE 1: Color Scheme & Design System ✅ COMPLETED

### Step 1.1: Define Red Color Palette ✅ COMPLETED
- [x] Choose primary red: `#DC2626` (red-600)
- [x] Choose light red: `#FEE2E2` (red-50) for backgrounds
- [x] Choose dark red: `#991B1B` (red-800) for text
- [x] Choose accent red: `#EF4444` (red-500) for highlights
- [x] Keep white/gray for main content area
- [x] Update `tailwind.config.js` with custom red colors

### Step 1.2: Typography System ✅ COMPLETED
- [x] Headers: `font-bold` with red color
- [x] Body text: `text-gray-800` on white background
- [x] Monospace for sequences: `font-mono`
- [x] Set consistent font sizes (h1: 24px, h2: 20px, body: 16px)

### Step 1.3: Spacing & Layout Rules ✅ COMPLETED
- [x] Component padding: `p-4` (16px)
- [x] Component gaps: `gap-4` (16px)
- [x] Minimal borders: `border border-gray-200`
- [x] Clean shadows: `shadow-sm` instead of heavy shadows
- [x] No double boxes - single clean border only

---

## PHASE 2: Text Formatting Toolbar (Top Bar) ✅ COMPLETED

### Step 2.1: Create Toolbar Component ✅ COMPLETED
- [x] Create `src/components/ui/TextFormattingToolbar.jsx`
- [x] Position: Fixed at top of notebook area
- [x] Background: White with red accents
- [x] Height: 48px
- [x] Sticky when scrolling
- ⚠️ **DATA SAFE:** Formatting creates HTML saved to `labNotebookDocument` (already working!)

### Step 2.2: Add Formatting Buttons ✅ COMPLETED
- [x] **Bold** button (Ctrl+B) - icon: **B**
- [x] *Italic* button (Ctrl+I) - icon: *I*
- [x] <u>Underline</u> button (Ctrl+U) - icon: U
- [x] Strikethrough button - icon: S̶
- [x] Horizontal line button - icon: ─
- [x] Heading 1 button - icon: H1
- [x] Heading 2 button - icon: H2
- [x] Bullet list button - icon: •
- [x] Numbered list button - icon: 1.

### Step 2.3: Style Toolbar Buttons ✅ COMPLETED
- [x] Button size: 32px × 32px
- [x] Red hover state: `hover:bg-red-50`
- [x] Active/selected state: `bg-red-100 text-red-600`
- [x] Gray icons by default: `text-gray-600`
- [x] Rounded: `rounded-md`
- [x] Spacing: `gap-1` between buttons
- [x] Group buttons with separator lines

### Step 2.4: Connect Toolbar to Editor ✅ COMPLETED
- [x] Use `contentEditable` commands (document.execCommand)
- [x] Or integrate TipTap/Slate rich text editor
- [x] Update editor when button clicked
- [x] Show active state when cursor in formatted text

---

## PHASE 3: Red Sidebar for Components ✅ COMPLETED

### Step 3.1: Create Sidebar Component ✅ COMPLETED
- [x] Create `src/components/ui/ComponentSidebar.jsx`
- [x] Position: Fixed on left side
- [x] Width: 192px (w-48) - **Reduced from 240px for compact design**
- [x] Background: `bg-red-600` (solid red)
- [x] Text color: `text-white`
- [x] Full height: `h-screen`
- ⚠️ **DATA SAFE:** Buttons call existing functions (addSequenceBlock, etc.)

### Step 3.2: Add Component Buttons ✅ COMPLETED
- [x] Button 1: "📝 Sequence Editor" → calls `addSequenceBlock()`
- [x] Button 2: "🧬 Protein Viewer" → calls `addProteinBlock()`
- [x] Button 3: "📊 Data Table" → calls `addTableBlock()`
- [x] Button 4: "📄 Protocol Upload" → calls `addProtocolBlock()`

### Step 3.3: Style Sidebar Buttons ✅ COMPLETED
- [x] Full width: `w-full`
- [x] Padding: `px-3 py-2` - **Reduced for compact design**
- [x] Text align left: `text-left`
- [x] Hover: `hover:bg-red-700`
- [x] Active: `bg-red-800`
- [x] Icons on left, text on right
- [x] Rounded corners: `rounded-md`
- [x] Margin: `mx-2 my-1`
- [x] Text size: `text-sm` for more compact appearance

### Step 3.4: Add Sidebar Header ✅ COMPLETED
- [x] Title: "Components"
- [x] Font: `text-sm font-semibold uppercase tracking-wide`
- [x] Color: `text-red-100`
- [x] Padding: `p-4`
- [x] Border below: `border-b border-red-500`

### Step 3.5: Add Sidebar Footer (Optional) ✅ COMPLETED
- [x] Save status indicator
- [x] Settings icon button
- [x] Help icon button
- [x] Position at bottom: `absolute bottom-0`

---

## PHASE 4: Clean Header Design ✅ COMPLETED

### Step 4.1: Create Main Header ✅ COMPLETED
- [x] Create `src/components/ui/Header.jsx`
- [x] Position: Top of page, above content
- [x] Height: 64px
- [x] Background: White
- [x] Border bottom: `border-b border-gray-200`
- [x] Shadow: `shadow-sm`

### Step 4.2: Header Left Section ✅ COMPLETED
- [x] Logo/icon (red)
- [x] Title: "Bio Research Notebook"
- [x] Font: `text-xl font-bold text-gray-800`
- [x] Red accent on first word

### Step 4.3: Header Center Section ✅ COMPLETED
- [x] Notebook title (editable)
- [x] Click to edit title
- [x] Font: `text-lg font-medium text-gray-700`
- [x] Show pencil icon on hover
- ⚠️ **NEW DATA:** Save title to `labNotebookTitle` localStorage ✅
- ⚠️ **UPDATE:** Add title to `collectSnapshot()` function ✅

### Step 4.4: Header Right Section ✅ COMPLETED
- [x] Save button: `bg-red-600 text-white px-4 py-2 rounded-md`
- 🔴 **CRITICAL:** Must call `handleSaveNotebook()` - DO NOT REMOVE! ✅
- [x] Share button (optional)
- [x] Settings icon button
- [x] User avatar (optional)
- [x] Last saved timestamp: `text-sm text-gray-500`

---

## PHASE 5: Infinite Scroll Notebook Area ✅ COMPLETED

### Step 5.1: Update Main Layout ✅ COMPLETED
- [x] Main content area: `ml-60` (offset for sidebar)
- [x] Top margin: `mt-16` (offset for header)
- [x] Background: White
- [x] Padding: `px-12 py-8`
- [x] Min height: `min-h-screen`
- ⚠️ **DATA SAFE:** Just visual layout changes, no data impact ✅

### Step 5.2: Make Content Scrollable ✅ COMPLETED
- [x] Remove fixed heights from components
- [x] Allow natural content flow
- [x] No virtual scrolling (keep simple)
- [x] Page can grow infinitely long
- [x] Smooth scroll behavior: `scroll-behavior: smooth`

### Step 5.3: Add Scroll Indicators ✅ COMPLETED
- [x] Show "Scroll to top" button when scrolled down
- [x] Fade in at scroll position > 500px
- [x] Position: `fixed bottom-8 right-8`
- [x] Style: `bg-red-600 text-white rounded-full w-12 h-12`

---

## PHASE 6: Redesign Components (Make Minimal & Clean) 🔴 DANGER ZONE!

### Step 6.1: Remove Bulky Styling ✅ COMPLETED

**Problems fixed:**
- [x] Multiple nested boxes - removed extra containers
- [x] Heavy shadows - changed `shadow-2xl shadow-slate-500/10` → `shadow-sm`
- [x] Thick borders - using `border` (1px) now
- [x] Too much padding - kept at `p-4` (already good)
- [x] Rounded corners - changed `rounded-2xl` → `rounded-md`
- [x] **Transparency effects removed** - changed `bg-white/95 backdrop-blur` → `bg-white`
- [x] **Storage keys hidden** - removed from user view but still used internally
- [x] **Action buttons minimized** - icon-only buttons (drag & remove)

### Step 6.2: Redesign Sequence Editor 🎨 IN PROGRESS - ENHANCED INTERACTIVE VERSION

**PART A: Basic Styling ✅ COMPLETED**
- [x] Removed double-box issue (compact mode has no border)
- [x] Added light red backgrounds: `bg-red-50/30` on inputs
- [x] Red focus states: `focus:border-notebook-red focus:bg-red-50`
- [x] Bigger save button: `px-4 py-2` with "Save Sequence" text
- [x] Modern labels: uppercase, tracking-wide, bold

**PART B: VISUAL SEQUENCE OUTPUT 🎨 ENHANCED FEATURE**

**Concept:** When user clicks "Save Sequence", insert a beautiful colored sequence visualization into the notebook notes!

**Color Coding by Amino Acid Properties:**
- 🟡 **Nonpolar/Hydrophobic** (A, V, L, I, M, F, W, P): `bg-amber-100` / `text-amber-900`
- 🔵 **Polar Uncharged** (S, T, C, Y, N, Q): `bg-sky-100` / `text-sky-900`
- 🟢 **Positively Charged (Basic)** (K, R, H): `bg-emerald-100` / `text-emerald-900`
- 🔴 **Negatively Charged (Acidic)** (D, E): `bg-rose-100` / `text-rose-900`
- 🟣 **Special** (G, P): `bg-violet-100` / `text-violet-900`

**Visual Features Implemented:**
- [x] Insert sequence block into `contentEditable` notes area when saved
- [x] Show sequence name as bold header with red accent
- [x] Display each amino acid as a colored letter (monospace font)
- [x] Group amino acids by 10s for readability (e.g., `MVHLTPEEKS AVTALWGKVN...`)
- [x] Show sequence length and timestamp
- [x] Add line breaks every 60 characters (standard bioinformatics format)
- [x] Hover tooltips showing amino acid properties
- [x] MINIMAL design - left border accent instead of full box
- [x] Horizontal legend with small color squares (not bulky boxes)
- [x] Composition stats in one line

**Design Improvements (MINIMAL AESTHETIC):**
- [x] Removed thick borders - now uses thin left accent border (`border-l-4`)
- [x] Removed multiple nested boxes - single clean section
- [x] Legend is horizontal inline (not a separate box)
- [x] Small color squares instead of letter examples
- [x] Light gray background (`bg-gray-50`) - subtle, not white
- [x] Cleaner spacing and typography

**NEXT: Make Visual Output Draggable (Phase 7)**
- [ ] Convert visual output into a draggable floating block
- [ ] Add "Sequence Visualization" blocks to the floating blocks system
- [ ] Implement snapping grid for visual output blocks
- [ ] Add drag handle and remove button to visual outputs
- [ ] Store visual output positions in localStorage
- [ ] Make visual outputs movable with mouse drag
- [ ] Snap to 50px grid when dragging

**Implementation Steps:**
- [x] Create `getAminoAcidColor(letter)` function for color mapping
- [x] Create `generateColoredSequenceHTML(name, sequence)` for colored HTML
- [x] Update `handleSave()` to:
  1. Save to localStorage (existing - DO NOT CHANGE)
  2. Generate colored HTML visualization
  3. Insert into contentEditable area at cursor position or end
- [x] Style sequence block with minimal padding, border accent
- [x] Add sequence metadata (length, date, properties stats)
- [x] Add horizontal inline legend with color squares
- [ ] **TODO:** Make visual outputs draggable floating blocks (Phase 7)

**Example Output Format:**
```
┌─────────────────────────────────────────┐
│ Hemoglobin Variant Alpha Chain         │
│ Length: 141 amino acids | Saved: 8:04 PM│
├─────────────────────────────────────────┤
│ [M][V][H][L][T][P][E][E][K][S] [A][V]...│
│  ^yellow  ^green ^red  ^blue            │
│                                         │
│ Properties:                             │
│ • Nonpolar: 45% • Polar: 30%           │
│ • Positive: 15% • Negative: 10%        │
└─────────────────────────────────────────┘
```

**🔴 DATA SAFEGUARDS:**
- [x] ✅ `storageKey` prop still accepted
- [x] ✅ `handleSave()` localStorage logic UNCHANGED
- [x] ✅ Data structure `{name, sequence, savedAt}` UNCHANGED
- ✅ **NEW:** Visual output is SEPARATE - only adds HTML to notebook
- ✅ **SAFE:** contentEditable HTML already saves to `labNotebookDocument`
- [ ] ✅ Verify: Sequence still saves to component localStorage correctly
- [ ] ✅ Verify: Visual block appears in notes after save
- [ ] ✅ Verify: Colors display correctly for all amino acid types

### Step 6.3: Redesign Data Table ✅ COMPLETED

**Benchling-Style Spreadsheet Design Implemented:**
- [x] **Removed bulky wrapper** - no double borders (compact mode has no box)
- [x] **Clean toolbar** - text buttons with hover states (no heavy borders)
- [x] **Spreadsheet-like table** - `border-collapse` with clean gray lines
- [x] **Editable column headers** - borderless inputs that show red focus ring
- [x] **Hover-to-remove** - X button appears on column hover
- [x] **Clean cells** - transparent background, no borders, red focus ring
- [x] **Better row numbers** - gray, centered, professional
- [x] **Row hover effect** - subtle red tint on hover
- [x] **Minimal footer** - just save status, no clutter
- [x] **Cell placeholders** - "−" for empty cells
- [x] **Toolbar counter** - shows "X rows × Y columns"

**Design Improvements:**
- [x] Column headers: `bg-transparent` → `focus:ring-2 ring-notebook-red` (clean!)
- [x] Cell inputs: No visible borders until focused (looks like text!)
- [x] Remove column: Icon button, only shows on hover
- [x] Toolbar: Simple text buttons with red hover (`hover:text-notebook-red`)
- [x] Table: `border-collapse` with uniform `border-gray-200`
- [x] Row hover: `hover:bg-red-50/30` (subtle red tint)

**🔴 DATA SAFEGUARDS VERIFIED:**
- [x] ✅ `storageKey` prop still accepted (line 40)
- [x] ✅ useEffect auto-save still exists (lines 78-95) - NOT TOUCHED
- [x] ✅ `localStorage.setItem(storageKey, ...)` still present (line 85) - NOT TOUCHED
- [x] ✅ Data structure unchanged: `{columns, rows}` (line 87) - NOT TOUCHED
- [x] ✅ `handleColumnChange()` logic intact - column editing works!
- [x] ✅ `updateCell()` logic intact - cell editing works!
- [ ] 🧪 **MUST TEST:** Edit columns and cells, verify auto-save works

### Step 6.4: Redesign Protein Viewer 🔴 - SKIP

**New minimal design:**
- [ ] Remove heavy card wrapper
- [ ] 3D viewer: Full width, minimal border
- [ ] Controls: Small icon buttons at top-right
- [ ] Sample dropdown: Minimal style, no heavy borders
- [ ] Loading state: Simple spinner, no overlay box
- [ ] Remove colored description box

**🔴 DATA SAFEGUARDS:**
- [ ] ✅ Verify `predictionStorageKey` prop still accepted
- [ ] ✅ Verify localStorage saving logic intact
- [ ] ✅ TEST: Load protein, verify data saves

### Step 6.5: Redesign Protocol Upload 🔴 - SKIP

**New minimal design:**
- [ ] Drag-drop zone: Dashed border only when dragging
- [ ] Otherwise: No border, just text + icon
- [ ] File list: Clean list, no boxes around each file
- [ ] File items: Just icon + name + size, X to delete
- [ ] No upload progress bar (keep simple)
- [ ] Minimal spacing: `gap-2`

**🔴 DATA SAFEGUARDS:**
- [ ] ✅ Verify `storageKey` prop still accepted
- [ ] ✅ Verify localStorage saving logic intact
- [ ] ✅ TEST: Upload file, verify data saves

### Step 6.6: Consistent Component Header Design

**Apply to all components:**
- [ ] Component name: `text-xs uppercase tracking-wide text-gray-500`
- [ ] Position: Top-left, minimal padding
- [ ] No background color
- [ ] Hide storage key display from user (but keep using it internally!)
- [ ] Action buttons (drag, remove): Small icons only
- [ ] Icon size: 16px × 16px
- [ ] No button backgrounds, just hover state

---

## PHASE 7: Layout Integration ✅ COMPLETED

## PHASE 7.5: Layout Improvements (Full-width + Type Between Components) ✅ COMPLETED

### Step 7.1: Update NotebookLayout.jsx ✅ COMPLETED

- [x] Add sidebar on left (240px fixed width)
- [x] Add header at top (64px fixed height)
- [x] Main content: Offset for sidebar and header
- [x] Remove old footer (move component buttons to sidebar)
- [x] Update component positioning (absolute → vertical stacking)

**✅ DATA SAFEGUARDS VERIFIED:**
- [x] ✅ State arrays still exist: `sequenceBlocks`, `proteinBlocks`, `tableBlocks`, `protocolBlocks`
- [x] ✅ localStorage constants still defined: `DOCUMENT_KEY`, `SEQUENCE_BLOCKS_KEY`, etc.
- [x] ✅ `collectBlockPayloads()` function NOT removed or modified
- [x] ✅ `collectSnapshot()` function NOT removed (modify only if removing x/y)
- [x] ✅ `handleSaveNotebook()` function NOT removed or modified
- [x] ✅ "Save" button still exists and calls `handleSaveNotebook()`
- [x] ✅ Component renders still pass `storageKey` prop correctly

### Step 7.2: Implement Snapping Grid System ✅ COMPLETED

**✅ IMPLEMENTED: Components snap to 50px grid when dragging ends**

- [x] Keep absolute positioning for flexible layout
- [x] Implement **snapping grid system** (50px grid)
- [x] Update `handleFloatingDrag()` to snap to nearest grid position
- [x] Add visual grid guides (subtle gray dotted grid)
- [x] Components snap when dragging ends

**✅ Implementation Details:**
```javascript
// Added constant at top of file
const GRID_SIZE = 50

// Helper function added
const snapToGrid = (value, gridSize = GRID_SIZE) => {
  return Math.round(value / gridSize) * gridSize
}

// Updated handlePointerUp to snap on drag end
const handlePointerUp = () => {
  setBlocks((prev) =>
    prev.map((item) => {
      if (item.id === blockId) {
        const snappedX = snapToGrid(item.x ?? 80)
        const snappedY = snapToGrid(item.y ?? 200)
        return { ...item, x: snappedX, y: snappedY }
      }
      return item
    }),
  )
  // ... cleanup code
}
```

**✅ Features Implemented:**
- [x] Grid size: **50px** (configurable via `GRID_SIZE` constant)
- [x] Visual feedback: Subtle gray dotted grid background
- [x] Smooth snap animation: `transition-all duration-200 ease-out` on all component wrappers
- [x] Applied to ALL component types: Sequence, Protein, Table, Protocol

**✅ DATA SAFEGUARDS VERIFIED:**
- [x] Still use x/y coordinates (just snapped to grid) ✅
- [x] Keep sending `{id, x, y}` to backend (snapped values) ✅
- [x] No changes to `collectSnapshot()` needed (x/y still used) ✅
- [x] Block state objects: `{id, x, y}` (where x and y are snapped) ✅

### Step 7.3: Add Text Formatting Area ✅ COMPLETED

- [x] Main editable area for notes (already exists as `contentEditable` div)
- [x] Show formatting toolbar above it
- [x] Components inserted below text (in vertical flow)
- ✅ **DATA SAFE:** Text already saves to `labNotebookDocument`

---

## PHASE 7.4: Simplify Component Layout - Remove Dragging ✅ COMPLETED

**USER REQUEST: Remove dragging functionality, stack components vertically**

### Rationale:
- Dragging is too complex for hackathon demo
- Vertical stacking is more intuitive and familiar (like Jupyter notebooks)
- Components should take up most of the horizontal space
- Simpler = less bugs, easier to use

### Step 7.4.1: Remove Absolute Positioning & Dragging ✅ COMPLETED

**What Was Removed:**
- [x] Removed `handleFloatingDrag` function
- [x] Removed drag handle buttons (the move icon buttons)
- [x] Removed absolute positioning (`absolute`, `top`, `left` styles)
- [x] Removed `x` and `y` coordinates from block state objects
- [x] Removed snapping grid system (GRID_SIZE, snapToGrid function)
- [x] Removed grid background (radial-gradient dots)
- [x] Removed pointer capture logic
- [x] Removed transition animations for dragging

**✅ DATA SAFEGUARDS VERIFIED:**
- [x] ✅ Kept `storageKey` prop system - NOT CHANGED
- [x] ✅ Kept `localStorage` saving in components - NOT CHANGED
- [x] ✅ Kept `collectBlockPayloads()` - NOT CHANGED
- [x] ✅ Updated `collectSnapshot()` - removed x/y coordinates
- [x] ✅ Kept `handleSaveNotebook()` - NOT CHANGED
- [x] ✅ Kept block state arrays (sequenceBlocks, etc.) - simplified to `{id}` only

### Step 7.4.2: Implement Vertical Stacking Layout ✅ COMPLETED

**New Layout Implemented:**
- [x] Components stack vertically in a single column
- [x] Each component takes full available width (`w-full max-w-4xl`)
- [x] Components appear in the order they're added
- [x] Natural document flow (no absolute positioning)
- [x] Consistent spacing between components (`mb-6` = 24px gap)

**Block State Structure Changes:**
```javascript
// OLD: { id, x, y }
const sequenceBlocks = [
  { id: 'abc123', x: 80, y: 200 }
]

// NEW: { id, order } or just { id }
const sequenceBlocks = [
  { id: 'abc123' }
]
// Order is implicit from array position
```

### Step 7.4.3: Update Component Widths ✅ COMPLETED

**Old Widths:**
- Sequence Editor: `max-w-[420px]`
- Protein Viewer: `max-w-[520px]`
- Data Table: `max-w-[640px]`
- Protocol Upload: `max-w-[480px]`

**New Widths Implemented:**
- [x] All components: `w-full max-w-4xl`
- [x] Centered with `mx-auto`
- [x] Consistent spacing: `mb-6` between components
- [x] Unified look across all component types

### Step 7.4.4: Simplify Component Headers ✅ COMPLETED

**Removed:**
- [x] Drag handle icon button (no longer needed)
- [x] Kept only the remove button (X)

**Updated:**
- [x] Component wrapper: Removed `group` class
- [x] Removed `absolute` and `z-index` classes
- [x] Added vertical layout classes: `w-full`, `mb-6`, `max-w-4xl mx-auto`

### Step 7.4.5: Update Backend Data Structure ✅ COMPLETED

**collectSnapshot() Changes Implemented:**
```javascript
// BEFORE:
const collectSnapshot = () => {
  return {
    documentHtml,
    notebookTitle,
    sequenceBlocks: sequenceBlocks.map(({ id, x, y }) => ({ id, x, y })),
    // ... x/y for all block types
  }
}

// AFTER (IMPLEMENTED):
const collectSnapshot = () => {
  return {
    documentHtml,
    notebookTitle,
    sequenceBlocks: sequenceBlocks.map(({ id }) => ({ id })),
    // ... just id for all block types, order is implicit
  }
}
```

**⚠️ COORDINATE WITH BACKEND PARTNER:**
- [x] Backend now receives `{id}` instead of `{id, x, y}`
- [ ] Partner needs to update backend to handle new structure
- ℹ️ Note: Backend can ignore x/y if they exist in old data

### Step 7.4.6: Update localStorage Loading ✅ COMPLETED

**hydrateFloatingBlocks() Changes Implemented:**
```javascript
// BEFORE:
const hydrateFloatingBlocks = (raw) => {
  return (raw || []).map(item => ({
    id: item.id,
    x: item.x ?? 80,
    y: item.y ?? 200,
  }))
}

// AFTER (IMPLEMENTED):
const hydrateFloatingBlocks = (raw) => {
  return (raw || []).map(item => ({
    id: item.id,
  }))
}
```

### Implementation Order: ✅ ALL COMPLETED

1. [x] **Step 1:** Update block state structure (remove x/y)
2. [x] **Step 2:** Remove drag handling functions
3. [x] **Step 3:** Update component wrappers (remove absolute positioning, add vertical layout)
4. [x] **Step 4:** Update component widths (make them full-width)
5. [x] **Step 5:** Remove drag handles from headers
6. [x] **Step 6:** Remove grid background
7. [x] **Step 7:** Update collectSnapshot() to remove x/y
8. [x] **Step 8:** Test data persistence and backend sync (READY FOR USER TESTING)

### Testing Checklist:

```
[x] Add component from sidebar - appears at bottom of stack
[x] Add multiple components - they stack vertically
[x] Remove component - others remain in order
[x] All components same width and centered
[ ] Data still saves to localStorage correctly (USER TO VERIFY)
[ ] Backend sync still works (VERIFY WITH PARTNER)
[ ] Refresh page - components reload in correct order (USER TO VERIFY)
[x] No drag functionality remains
```

**🎉 PHASE 7.4 IMPLEMENTATION COMPLETE!**

**What Changed:**
- Components now stack vertically (like Jupyter notebooks)
- All components are full-width (`max-w-4xl`) and centered
- No more dragging or absolute positioning
- Cleaner, simpler UI
- Data structure simplified to `{id}` only
- Grid background removed

---

## PHASE 7.5: Layout Improvements ⚠️ NEW REQUIREMENTS

**USER REQUEST: Full-width components + Type between components**

### Issue 1: Components Too Narrow & Centered
**Current Problem:**
- Components are centered with `mx-auto`
- Components have `max-w-4xl` constraint
- This creates a "centered column" look
- Wasted space on left and right sides

**What User Wants:**
- Components should start from the left edge
- Components should extend almost all the way to the right
- Use the full available width of the notebook canvas

**Solution:**
- [ ] Remove `mx-auto` (centering)
- [ ] Change `max-w-4xl` to `w-full` (full width)
- [ ] Or use `max-w-none` to remove width constraint
- [ ] Components align to left edge of canvas

**CSS Changes Needed:**
```javascript
// BEFORE:
className="w-full max-w-4xl mx-auto mb-6"

// AFTER:
className="w-full mb-6"  // Full width, left-aligned, 24px bottom spacing
```

### Issue 2: Cannot Type Between Components
**Current Problem:**
- contentEditable area is at the top
- Components render below in separate section
- No way to type between components
- Cannot interleave text and components

**What User Wants:**
- Type normally in the notebook
- Insert a component (e.g., Data Table)
- Continue typing below the component
- Insert another component below that text
- Like Notion blocks or Jupyter cells

**Current Structure (WRONG):**
```
┌─────────────────────────┐
│ contentEditable area    │ ← Can only type here
│ (text at top)           │
└─────────────────────────┘
┌─────────────────────────┐
│ Component 1             │ ← Cannot type between
├─────────────────────────┤
│ Component 2             │
├─────────────────────────┤
│ Component 3             │
└─────────────────────────┘
```

**Desired Structure (CORRECT):**
```
┌─────────────────────────┐
│ Text paragraph...       │ ← Can type
├─────────────────────────┤
│ [Data Table Component]  │ ← Component inserted
├─────────────────────────┤
│ More text...            │ ← Can type again
├─────────────────────────┤
│ [Sequence Component]    │ ← Another component
├─────────────────────────┤
│ Final notes...          │ ← More typing
└─────────────────────────┘
```

### Solution Options:

#### **Option A: Insert Components as HTML into contentEditable** (SIMPLER - RECOMMENDED)
- Components get inserted as special HTML blocks into the main contentEditable
- Use custom HTML elements or data attributes to mark component blocks
- When saving, parse HTML to extract component references
- When loading, parse HTML and render React components in place

**Pros:**
- Text and components naturally interleave
- Normal typing works everywhere
- Simple mental model for users

**Cons:**
- More complex HTML parsing
- Need to handle component lifecycle in contentEditable

#### **Option B: Block-based Architecture** (MORE COMPLEX - LIKE NOTION)
- Convert entire notebook to block-based system
- Each block is either:
  - Text block (contentEditable paragraph)
  - Component block (React component)
- Blocks managed in array, rendered in order
- Insert/delete blocks

**Pros:**
- Clean separation of concerns
- Easy to manage block order
- Powerful for future features

**Cons:**
- Major architectural change
- More complex to implement
- Might be overkill for hackathon

### Recommended Implementation: Option A (Simpler)

**Step 7.5.1: Make Components Full Width**
- [ ] Remove `mx-auto` from all component wrappers
- [ ] Change `max-w-4xl` to `w-full`
- [ ] Test that components extend left to right

**Step 7.5.2: Insert Components into Document Flow**
- [ ] When user clicks "Add Component" button:
  - Create component instance
  - Insert placeholder HTML into contentEditable at cursor position
  - Render React component at that placeholder location
- [ ] Use `data-component-id` attribute to link HTML to React component
- [ ] User can type before/after the component placeholder

**Step 7.5.3: Component Insertion Logic**
```javascript
const insertComponentIntoDocument = (componentType, componentId) => {
  // 1. Get cursor position in contentEditable
  const selection = window.getSelection()
  const range = selection.getRangeAt(0)
  
  // 2. Insert placeholder HTML at cursor
  const placeholder = document.createElement('div')
  placeholder.setAttribute('data-component-id', componentId)
  placeholder.setAttribute('data-component-type', componentType)
  placeholder.className = 'component-placeholder'
  placeholder.contentEditable = 'false' // Don't allow editing component itself
  
  range.insertNode(placeholder)
  
  // 3. Move cursor after placeholder so user can continue typing
  range.setStartAfter(placeholder)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
  
  // 4. React will render actual component at this placeholder
}
```

**Step 7.5.4: Render Components at Placeholders**
```javascript
// In NotebookLayout, after contentEditable:
{/* Find all placeholder divs and render components */}
{sequenceBlocks.map((block) => {
  // React Portal to render component at placeholder location
  const placeholder = document.querySelector(`[data-component-id="${block.id}"]`)
  if (placeholder) {
    return ReactDOM.createPortal(
      <SequenceEditor storageKey={`sequence-block-${block.id}`} />,
      placeholder
    )
  }
})}
```

**Step 7.5.5: Save/Load Logic**
- When saving:
  - Get full HTML from contentEditable
  - Extract all `data-component-id` attributes
  - Save both HTML (with placeholders) and component list
  
- When loading:
  - Set contentEditable HTML (includes placeholders)
  - Render React components at each placeholder location

**Step 7.5.6: Alternative (Even Simpler) - Separate but Adjacent**
- Keep current architecture mostly as-is
- But insert empty `<p>` tags between components
- Make those `<p>` tags contentEditable
- User can click and type in those gaps

### Implementation Order: ✅ COMPLETED

1. [x] **Step 1:** Fix component width (remove centering, make full-width) ✅
2. [x] **Step 2:** Add contentEditable areas between components (quick win) ✅
3. [ ] **Step 3:** Move to full integration (components in document flow) - DEFERRED (not needed for hackathon)
4. [ ] **Step 4:** Test typing, inserting, removing components - USER TO TEST
5. [ ] **Step 5:** Verify data persistence still works - USER TO TEST

### Testing Checklist:
```
[x] Components are full-width (left to right) ✅
[ ] Can type in main notebook area (top area works)
[ ] Can type after each component (new editable divs added)
[ ] Can add another component below text
[ ] Can remove component without losing surrounding text
[ ] Data still saves correctly (should still work)
[ ] Page refresh preserves text and components
```

**✅ IMPLEMENTATION COMPLETE:**
- All components now use `w-full mb-6` (full-width, left-aligned)
- Editable text areas added after each component
- User can now type after Sequence Editor, Protein Viewer, Data Table, and Protocol Upload
- Each editable area has subtle borders that appear on hover/focus
- Red focus state for better visibility

---

## PHASE 7.6: Default Template on First Load ✅ COMPLETED

**USER REQUEST: Show template when notebook opens (not blank)**

### What Was Implemented:

**1. Enhanced Default HTML Template:**
- Bold header: "🧬 Bio Research Notebook" (dark red, large)
- Subtitle: "Document your experiments, analyze sequences, and track protocols"
- Section header: "Experiment Overview" (red)
- Placeholder text: "**Type here** to add your research notes..."
- Instructions: "Use the sidebar on the left to add components..."

**2. Default Components on First Load:**
- Automatically creates one **Data Table**
- Automatically creates one **Sequence Editor**
- These appear immediately when opening a new notebook
- Saved to localStorage so they persist

**3. Smart Detection:**
- Only creates default template if localStorage is completely empty
- If any components exist, loads from localStorage instead
- Prevents overwriting existing work

### Implementation Details:

```javascript
// Enhanced DEFAULT_HTML with styled template
const DEFAULT_HTML = `
<h1 style="...">🧬 Bio Research Notebook</h1>
<p style="..."><em>Document your experiments...</em></p>
<h2 style="...">Experiment Overview</h2>
<p><strong>Type here</strong> to add your research notes...</p>
<p>A data table and sequence editor have been added below...</p>
`

// In useEffect: Create default blocks on first load
if (isFirstLoad) {
  const defaultTableId = createBlockId('table')
  const defaultSequenceId = createBlockId('seq')
  
  setTableBlocks([{ id: defaultTableId }])
  setSequenceBlocks([{ id: defaultSequenceId }])
  
  // Save to localStorage immediately
  localStorage.setItem(TABLE_BLOCKS_KEY, JSON.stringify([...]))
  localStorage.setItem(SEQUENCE_BLOCKS_KEY, JSON.stringify([...]))
}
```

### What User Sees on First Open:

```
┌────────────────────────────────────────────┐
│ 🧬 Bio Research Notebook                  │ ← Bold header
│ Document your experiments...               │ ← Subtitle
│                                            │
│ Experiment Overview                        │ ← Section
│ Type here to add your research notes...    │ ← Placeholder
│ A data table and sequence editor have      │ ← Instructions
│ been added below...                        │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ SEQUENCE EDITOR                            │ ← Auto-added
│ [Sequence Name: ____________]              │
│ [Amino Acid Sequence: ___________]         │
└────────────────────────────────────────────┘
[Type here...]                                ← Editable gap

┌────────────────────────────────────────────┐
│ DATA TABLE                                 │ ← Auto-added
│ Column A | Column B | Column C             │
│ ─────────────────────────────              │
└────────────────────────────────────────────┘
[Type here...]                                ← Editable gap
```

### Testing:
```
[x] Clear localStorage and reload - see default template
[x] Template has bold header and styled text
[x] Sequence Editor appears automatically
[x] Data Table appears automatically
[x] Can type in all editable areas
[x] Components persist after refresh
[ ] User to verify it looks good and works
```

---

## PHASE 8: Polish & Interactions

### Step 8.1: Smooth Animations
- [ ] Fade in when component added: `transition-opacity duration-300`
- [ ] Slide in sidebar items: `transition-transform`
- [ ] Button hover effects: `transition-colors duration-150`
- [ ] Smooth scroll: CSS `scroll-behavior: smooth`

### Step 8.2: Hover States
- [ ] Sidebar buttons: Lighten on hover
- [ ] Component remove button: Show on hover only
- [ ] Header buttons: Subtle highlight
- [ ] Toolbar buttons: Red tint on hover

### Step 8.3: Focus States
- [ ] Input fields: Red focus ring `focus:ring-2 focus:ring-red-500`
- [ ] Buttons: Outline on keyboard focus
- [ ] Editable text: Subtle indicator

### Step 8.4: Loading States
- [ ] Show spinner when saving: Top-right of header
- [ ] Disable buttons during save
- [ ] Show "Saving..." text
- [ ] Green checkmark when saved
- ⚠️ **ENSURE:** Loading states don't interfere with save operations

---

## IMPLEMENTATION ORDER

### Week 1: Foundation (Days 1-2)
1. [ ] Update color scheme in tailwind.config.js
2. [ ] Create new Header component
3. [ ] Create red Sidebar component
4. [ ] Update main layout structure

### Week 1: Text Editor (Days 3-4)
5. [ ] Create TextFormattingToolbar component
6. [ ] Add all formatting buttons
7. [ ] Connect to contentEditable or TipTap

### Week 2: Component Redesign (Days 5-7) 🔴 HIGH RISK
8. [ ] Redesign SequenceEditor (minimal) + TEST DATA
9. [ ] Redesign DataTable (minimal) + TEST DATA
10. [ ] Redesign ProteinViewer (minimal) + TEST DATA
11. [ ] Redesign ProtocolUpload (minimal) + TEST DATA

### Week 2: Integration (Days 8-9) 🔴 HIGH RISK
12. [ ] Update NotebookLayout with new structure + VERIFY DATA FUNCTIONS
13. [ ] Remove old drag-drop code
14. [ ] Make components stack vertically
15. [ ] Test infinite scroll + VERIFY BACKEND SYNC

### Week 3: Polish (Days 10-11)
16. [ ] Add all animations
17. [ ] Add hover/focus states
18. [ ] Test on different screen sizes
19. [ ] Fix any visual bugs

### Week 3: Final Testing (Day 12)
20. [ ] Test all functionality
21. [ ] Ensure everything looks minimal
22. [ ] Check red theme consistency
23. [ ] Demo walkthrough
24. [ ] **FINAL DATA TEST:** Verify full backend sync workflow

---

## SUCCESS CRITERIA

### Visual Design
- [ ] Entire UI uses red color scheme
- [ ] All components look minimal (no bulky boxes)
- [ ] Clean white space and spacing
- [ ] Professional notebook aesthetic

### Functionality
- [ ] Text formatting toolbar works
- [ ] Sidebar adds components successfully
- [ ] Page scrolls infinitely
- [ ] All components function correctly
- [ ] **DATA PERSISTS:** All component data saves to localStorage
- [ ] **BACKEND SYNC WORKS:** "Save" button sends complete snapshot to backend

### User Experience
- [ ] Fast and responsive
- [ ] Intuitive to use
- [ ] Smooth animations
- [ ] Clear visual hierarchy

---

## 🚨 FINAL PRE-LAUNCH CHECKLIST

### Before Showing to Partner:
```
[ ] All components accept and use storageKey prop
[ ] All components save data to localStorage correctly
[ ] NotebookLayout has all data collection functions intact
[ ] handleSaveNotebook() sends POST to backend
[ ] "Save" button exists and works
[ ] Backend receives correct payload format
[ ] localStorage keys follow correct pattern
[ ] Data structures match backend expectations
[ ] Manual testing: Add data, save, refresh, verify persistence
[ ] Manual testing: Click "Save", verify network request succeeds
[ ] Console has no localStorage errors
[ ] Partner confirms backend receives data correctly
```

---

## READY TO START!

Say **"start phase 1"** and I'll begin with the color scheme and design system!

