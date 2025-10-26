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
- [x] Width: 240px
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
- [x] Padding: `px-4 py-3`
- [x] Text align left: `text-left`
- [x] Hover: `hover:bg-red-700`
- [x] Active: `bg-red-800`
- [x] Icons on left, text on right
- [x] Rounded corners: `rounded-md`
- [x] Margin: `mx-2 my-1`

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

### Step 6.3: Redesign Data Table 🔴

**New minimal design:**
- [ ] Remove card wrapper - just show table
- [ ] Table borders: `border-collapse` with light gray lines
- [ ] Header row: `bg-gray-50` (subtle)
- [ ] No thick borders around entire table
- [ ] Action buttons: Icon-only, no background
- [ ] Padding in cells: `px-3 py-2` (minimal)
- [ ] Input fields inline: no border unless focused

**🔴 DATA SAFEGUARDS:**
- [ ] ✅ Verify `storageKey` prop still accepted
- [ ] ✅ Verify useEffect auto-save still exists (lines 78-95)
- [ ] ✅ Verify `localStorage.setItem(storageKey, ...)` still present
- [ ] ✅ Verify data structure unchanged: `{columns, rows}`
- [ ] ✅ TEST: Edit cells, verify auto-save to localStorage

### Step 6.4: Redesign Protein Viewer 🔴

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

### Step 6.5: Redesign Protocol Upload 🔴

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

## PHASE 7: Layout Integration 🔴 DANGER ZONE!

### Step 7.1: Update NotebookLayout.jsx 🔴

- [ ] Add sidebar on left (240px fixed width)
- [ ] Add header at top (64px fixed height)
- [ ] Main content: Offset for sidebar and header
- [ ] Remove old footer (move component buttons to sidebar)
- [ ] Update component positioning (absolute → vertical stacking)

**🔴 DATA SAFEGUARDS - CRITICAL CHECKS:**
- [ ] ✅ State arrays still exist: `sequenceBlocks`, `proteinBlocks`, `tableBlocks`, `protocolBlocks`
- [ ] ✅ localStorage constants still defined: `DOCUMENT_KEY`, `SEQUENCE_BLOCKS_KEY`, etc.
- [ ] ✅ `collectBlockPayloads()` function NOT removed or modified
- [ ] ✅ `collectSnapshot()` function NOT removed (modify only if removing x/y)
- [ ] ✅ `handleSaveNotebook()` function NOT removed or modified
- [ ] ✅ "Save" button still exists and calls `handleSaveNotebook()`
- [ ] ✅ Component renders still pass `storageKey` prop correctly

### Step 7.2: Implement Snapping Grid System (UPDATED REQUIREMENT)

**NEW: Components should snap to grid instead of free-flowing drag**

- [ ] Keep absolute positioning for flexible layout
- [ ] Implement **snapping grid system** (e.g., 50px or 100px grid)
- [ ] Update `handleFloatingDrag()` to snap to nearest grid position
- [ ] Add visual grid guides (optional, for user feedback)
- [ ] Components snap when dragging ends

**Snapping Implementation:**
```javascript
// Snap coordinates to grid
const snapToGrid = (value, gridSize = 50) => {
  return Math.round(value / gridSize) * gridSize
}

// In handleFloatingDrag, when pointer up:
const snappedX = snapToGrid(nextX, 50)
const snappedY = snapToGrid(nextY, 50)
```

**Grid Configuration:**
- [ ] Grid size: **50px** (adjustable in constant)
- [ ] Visual feedback: Light gray dotted grid lines (optional)
- [ ] Smooth snap animation: `transition: all 0.2s ease-out`

**⚠️ DATA SAFEGUARDS:**
- [ ] Still use x/y coordinates (just snapped to grid)
- [ ] Keep sending `{id, x, y}` to backend (snapped values)
- [ ] No changes to `collectSnapshot()` needed (x/y still used)
- [ ] Block state objects: `{id, x, y}` (where x and y are snapped)

### Step 7.3: Add Text Formatting Area

- [ ] Main editable area for notes (already exists as `contentEditable` div)
- [ ] Show formatting toolbar above it
- [ ] Components inserted below text (in vertical flow)
- ⚠️ **DATA SAFE:** Text already saves to `labNotebookDocument`

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

