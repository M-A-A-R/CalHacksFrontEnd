import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'

const DOCUMENT_KEY = 'labNotebookDocument'
const SEQUENCE_BLOCKS_KEY = 'labNotebookSequenceBlocks'
const PROTEIN_BLOCKS_KEY = 'labNotebookProteinBlocks'
const TABLE_BLOCKS_KEY = 'labNotebookTableBlocks'
const PROTOCOL_BLOCKS_KEY = 'labNotebookProtocolBlocks'

const BLOCK_PREFIX = {
  sequence: 'sequence',
  protein: 'protein',
  table: 'table',
  protocol: 'protocol',
}

const initialState = {
  documentHtml: '',
  layout: {
    sequences: [],
    proteins: [],
    tables: [],
    protocols: [],
  },
  blocks: {
    sequences: {},
    proteins: {},
    tables: {},
    protocols: {},
  },
  metadata: {
    id: null,
    title: 'Untitled Notebook',
    created: null,
    lastModified: null,
    lastSaved: null,
    version: 1,
  },
  status: {
    isHydrated: false,
    isSaving: false,
    error: null,
  },
}

const NotebookContext = createContext(undefined)

const readJSON = (key, fallback = null) => {
  if (typeof window === 'undefined') {
    return fallback
  }
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return fallback
    }
    return JSON.parse(raw)
  } catch (error) {
    console.error(`NotebookContext: failed to parse "${key}"`, error)
    return fallback
  }
}

const sanitizeLayout = (value) => {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .filter((entry) => entry && typeof entry.id === 'string')
    .map((entry) => ({
      id: entry.id,
      x: Number.isFinite(Number(entry.x)) ? Number(entry.x) : undefined,
      y: Number.isFinite(Number(entry.y)) ? Number(entry.y) : undefined,
    }))
}

const loadBlockPayloads = (layout, kind) => {
  const prefix = BLOCK_PREFIX[kind]
  if (!prefix) {
    return {}
  }

  return layout.reduce((accumulator, entry) => {
    const storageKey = `${prefix}-block-${entry.id}`
    const payload = readJSON(storageKey, null)
    if (payload !== null) {
      accumulator[entry.id] = payload
    }
    return accumulator
  }, {})
}

const hydrateFromLocalStorage = () => {
  if (typeof window === 'undefined') {
    return initialState
  }
  const documentHtml =
    window.localStorage.getItem(DOCUMENT_KEY) ?? initialState.documentHtml

  const sequencesLayout = sanitizeLayout(readJSON(SEQUENCE_BLOCKS_KEY, []))
  const proteinsLayout = sanitizeLayout(readJSON(PROTEIN_BLOCKS_KEY, []))
  const tablesLayout = sanitizeLayout(readJSON(TABLE_BLOCKS_KEY, []))
  const protocolsLayout = sanitizeLayout(readJSON(PROTOCOL_BLOCKS_KEY, []))

  return {
    documentHtml,
    layout: {
      sequences: sequencesLayout,
      proteins: proteinsLayout,
      tables: tablesLayout,
      protocols: protocolsLayout,
    },
    blocks: {
      sequences: loadBlockPayloads(sequencesLayout, 'sequence'),
      proteins: loadBlockPayloads(proteinsLayout, 'protein'),
      tables: loadBlockPayloads(tablesLayout, 'table'),
      protocols: loadBlockPayloads(protocolsLayout, 'protocol'),
    },
    metadata: {
      ...initialState.metadata,
      lastModified: new Date().toISOString(),
    },
    status: {
      ...initialState.status,
      isHydrated: true,
    },
  }
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'HYDRATE': {
      return {
        ...state,
        ...action.payload,
        status: {
          ...state.status,
          ...action.payload?.status,
          isHydrated: true,
        },
      }
    }
    case 'UPDATE_DOCUMENT': {
      return {
        ...state,
        documentHtml: action.payload,
        metadata: {
          ...state.metadata,
          lastModified: new Date().toISOString(),
        },
      }
    }
    case 'UPSERT_BLOCK': {
      const { kind, id, data } = action.payload
      if (!BLOCK_PREFIX[kind] || !id) {
        return state
      }
      const key = `${kind}s`
      return {
        ...state,
        blocks: {
          ...state.blocks,
          [key]: {
            ...state.blocks[key],
            [id]: data,
          },
        },
        metadata: {
          ...state.metadata,
          lastModified: new Date().toISOString(),
        },
      }
    }
    case 'REMOVE_BLOCK': {
      const { kind, id } = action.payload
      if (!BLOCK_PREFIX[kind] || !id) {
        return state
      }
      const key = `${kind}s`
      const nextBlocks = { ...state.blocks[key] }
      delete nextBlocks[id]
      return {
        ...state,
        blocks: {
          ...state.blocks,
          [key]: nextBlocks,
        },
        layout: {
          ...state.layout,
          [key]: state.layout[key].filter((entry) => entry.id !== id),
        },
        metadata: {
          ...state.metadata,
          lastModified: new Date().toISOString(),
        },
      }
    }
    case 'UPDATE_LAYOUT': {
      const { kind, layout } = action.payload
      if (!BLOCK_PREFIX[kind]) {
        return state
      }
      const key = `${kind}s`
      return {
        ...state,
        layout: {
          ...state.layout,
          [key]: sanitizeLayout(layout),
        },
        metadata: {
          ...state.metadata,
          lastModified: new Date().toISOString(),
        },
      }
    }
    case 'SAVE_START': {
      return {
        ...state,
        status: {
          ...state.status,
          isSaving: true,
          error: null,
        },
      }
    }
    case 'SAVE_SUCCESS': {
      return {
        ...state,
        metadata: {
          ...state.metadata,
          lastSaved: action.payload?.timestamp ?? new Date().toISOString(),
        },
        status: {
          ...state.status,
          isSaving: false,
          error: null,
        },
      }
    }
    case 'SAVE_ERROR': {
      return {
        ...state,
        status: {
          ...state.status,
          isSaving: false,
          error: action.payload?.error ?? 'Unknown error',
        },
      }
    }
    default:
      return state
  }
}

const createInitialState = () => {
  if (typeof window === 'undefined') {
    return initialState
  }
  const hydrated = hydrateFromLocalStorage()
  return {
    ...initialState,
    ...hydrated,
  }
}

export const NotebookProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, createInitialState)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const entries = Object.entries(state.blocks.sequences ?? {})
    entries.forEach(([id, data]) => {
      try {
        window.localStorage.setItem(
          `sequence-block-${id}`,
          JSON.stringify(data ?? {}),
        )
      } catch (error) {
        console.error(
          `NotebookContext: failed to persist sequence data for ${id}`,
          error,
        )
      }
    })
  }, [state.blocks.sequences])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const entries = Object.entries(state.blocks.proteins ?? {})
    entries.forEach(([id, data]) => {
      try {
        window.localStorage.setItem(
          `protein-block-${id}`,
          JSON.stringify(data ?? {}),
        )
      } catch (error) {
        console.error(
          `NotebookContext: failed to persist protein data for ${id}`,
          error,
        )
      }
    })
  }, [state.blocks.proteins])

  const value = useMemo(
    () => ({
      state,
      dispatch,
      actions: {
        updateDocument: (html) =>
          dispatch({ type: 'UPDATE_DOCUMENT', payload: html }),
        upsertBlock: (kind, id, data) =>
          dispatch({ type: 'UPSERT_BLOCK', payload: { kind, id, data } }),
        removeBlock: (kind, id) =>
          dispatch({ type: 'REMOVE_BLOCK', payload: { kind, id } }),
        updateLayout: (kind, layout) =>
          dispatch({ type: 'UPDATE_LAYOUT', payload: { kind, layout } }),
        signalSaveStart: () => dispatch({ type: 'SAVE_START' }),
        signalSaveSuccess: (timestamp) =>
          dispatch({ type: 'SAVE_SUCCESS', payload: { timestamp } }),
        signalSaveError: (error) =>
          dispatch({ type: 'SAVE_ERROR', payload: { error } }),
      },
    }),
    [state],
  )

  return (
    <NotebookContext.Provider value={value}>
      {children}
    </NotebookContext.Provider>
  )
}

export const useNotebook = () => {
  const context = useContext(NotebookContext)
  if (!context) {
    throw new Error('useNotebook must be used within a NotebookProvider')
  }
  return context
}
