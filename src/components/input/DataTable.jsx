import React, { useEffect, useRef, useState } from 'react'

const DEFAULT_COLUMNS = ['Column A', 'Column B', 'Column C']

const createEmptyRow = (id, columns) => {
  const base = { id }
  columns.forEach((column) => {
    base[column] = ''
  })
  return base
}

const alignRowsToColumns = (rows, columns) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [createEmptyRow(1, columns)]
  }

  return rows.map((row, index) => {
    const base = createEmptyRow(index + 1, columns)
    columns.forEach((column) => {
      if (row && Object.prototype.hasOwnProperty.call(row, column)) {
        base[column] = row[column]
      }
    })
    return base
  })
}

const normalizeCount = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10)

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback
  }

  return Math.floor(parsed)
}

const DataTable = ({
  storageKey = 'dataTableState',
  compact = false,
  className = '',
}) => {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS)
  const [rows, setRows] = useState(() => [createEmptyRow(1, DEFAULT_COLUMNS)])
  const [rowBatchCount, setRowBatchCount] = useState('1')
  const [columnBatchCount, setColumnBatchCount] = useState('1')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const isHydrated = useRef(false)

  useEffect(() => {
    try {
      const storedRaw = window.localStorage.getItem(storageKey)
      if (!storedRaw) {
        return
      }
      const parsed = JSON.parse(storedRaw)
      if (Array.isArray(parsed?.columns) && Array.isArray(parsed?.rows)) {
        const sanitizedColumns = parsed.columns.filter(
          (value) => typeof value === 'string',
        )
        const resolvedColumns =
          sanitizedColumns && sanitizedColumns.length
            ? sanitizedColumns
            : DEFAULT_COLUMNS

        setColumns(resolvedColumns)
        setRows(alignRowsToColumns(parsed.rows, resolvedColumns))
      }
    } catch (error) {
      console.error('Failed to load stored table data', error)
    } finally {
      isHydrated.current = true
    }
  }, [storageKey])

  useEffect(() => {
    if (!isHydrated.current) {
      return
    }

    setIsSaving(true)
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ columns, rows }),
      )
      setLastSaved(new Date().toISOString())
    } catch (error) {
      console.error('Failed to save table data', error)
    } finally {
      setIsSaving(false)
    }
  }, [columns, rows, storageKey])

  const addRows = (count = 1) => {
    if (count < 1) {
      return
    }

    setRows((current) => {
      const nextRows = [...current]
      for (let iteration = 0; iteration < count; iteration += 1) {
        nextRows.push(createEmptyRow(nextRows.length + 1, columns))
      }
      return nextRows
    })
  }

  const removeRow = () => {
    setRows((current) => {
      if (current.length <= 1) {
        return current
      }
      const trimmed = current.slice(0, -1)
      return alignRowsToColumns(trimmed, columns)
    })
  }

  const updateCell = (rowIndex, column, value) => {
    setRows((current) =>
      current.map((row, index) =>
        index === rowIndex ? { ...row, [column]: value } : row,
      ),
    )
  }

  const handleColumnChange = (index, value) => {
    setColumns((current) => {
      if (index < 0 || index >= current.length) {
        return current
      }

      const previousKey = current[index]
      const fallbackName = `Column ${index + 1}`
      const trimmed = typeof value === 'string' ? value.trim() : ''
      const desiredName = trimmed.length ? trimmed : fallbackName

      if (desiredName === previousKey) {
        return current
      }

      const taken = new Set(
        current.filter((_, columnIndex) => columnIndex !== index),
      )
      let uniqueName = desiredName
      let suffix = 2
      while (taken.has(uniqueName)) {
        uniqueName = `${desiredName || fallbackName} ${suffix}`
        suffix += 1
      }

      setRows((rowsCurrent) =>
        rowsCurrent.map((row) => {
          if (previousKey === uniqueName) {
            return row
          }
          const nextRow = { ...row }
          const existingValue = Object.prototype.hasOwnProperty.call(
            nextRow,
            previousKey,
          )
            ? nextRow[previousKey]
            : ''
          delete nextRow[previousKey]
          nextRow[uniqueName] = existingValue
          return nextRow
        }),
      )

      return current.map((column, columnIndex) =>
        columnIndex === index ? uniqueName : column,
      )
    })
  }

  const addColumns = (count = 1) => {
    if (count < 1) {
      return
    }

    setColumns((current) => {
      const additions = []
      const existing = new Set(current)
      let cursor = current.length + 1

      for (let iteration = 0; iteration < count; iteration += 1) {
        let candidate = `Column ${cursor}`
        cursor += 1
        while (existing.has(candidate)) {
          candidate = `Column ${cursor}`
          cursor += 1
        }
        additions.push(candidate)
        existing.add(candidate)
      }

      if (!additions.length) {
        return current
      }

      const nextColumns = [...current, ...additions]
      setRows((rowsCurrent) =>
        rowsCurrent.map((row, index) => {
          const nextRow = createEmptyRow(index + 1, nextColumns)
          nextColumns.forEach((column) => {
            if (Object.prototype.hasOwnProperty.call(row, column)) {
              nextRow[column] = row[column]
            }
          })
          return nextRow
        }),
      )

      return nextColumns
    })
  }

  const removeColumn = (index) => {
    setColumns((current) => {
      if (current.length <= 1 || index < 0 || index >= current.length) {
        return current
      }

      const columnKey = current[index]
      const nextColumns = current.filter(
        (_, columnIndex) => columnIndex !== index,
      )

      setRows((rowsCurrent) =>
        alignRowsToColumns(
          rowsCurrent.map((row) => {
            const nextRow = { ...row }
            delete nextRow[columnKey]
            return nextRow
          }),
          nextColumns,
        ),
      )

      return nextColumns
    })
  }

  const exportToCSV = () => {
    const headers = ['ID', ...columns]
    const lines = rows.map((row) =>
      headers
        .map((header) =>
          `"${String(row[header === 'ID' ? 'id' : header] ?? '').replace(
            /"/g,
            '""',
          )}"`,
        )
        .join(','),
    )
    const csv = [headers.join(','), ...lines].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `table-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setRows([createEmptyRow(1, columns)])
  }

  const handleAddRows = () => {
    const safeCount = normalizeCount(rowBatchCount, 1)
    addRows(safeCount)
    setRowBatchCount('1')
  }

  const handleAddColumns = () => {
    const safeCount = normalizeCount(columnBatchCount, 1)
    addColumns(safeCount)
    setColumnBatchCount('1')
  }

  const handleAddRowsPrompt = () => {
    const response = window.prompt('How many rows would you like to add?', rowBatchCount)
    if (response === null) {
      return
    }
    const safeCount = normalizeCount(response, 0)
    if (safeCount > 0) {
      addRows(safeCount)
    }
  }

  const handleAddColumnsPrompt = () => {
    const response = window.prompt('How many columns would you like to add?', columnBatchCount)
    if (response === null) {
      return
    }
    const safeCount = normalizeCount(response, 0)
    if (safeCount > 0) {
      addColumns(safeCount)
    }
  }

  // Phase 6.3 - MINIMAL CLEAN DESIGN (like Benchling spreadsheet)
  const wrapperClasses = compact
    ? `flex w-full flex-col gap-2 ${className}` // No border/shadow in compact - wrapper has it
    : `flex w-full max-w-5xl flex-col gap-3 border border-gray-200 rounded-md bg-white p-4 shadow-sm ${className}`

  const compactButtonClass =
    'px-2 py-1 text-xs font-medium text-gray-600 hover:text-notebook-red transition'

  return (
    <div className={wrapperClasses}>
      {/* Phase 6.3 - Clean minimal controls (like Benchling toolbar) */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => addRows(1)}
            className={compactButtonClass}
            title="Add Row"
          >
            + Row
          </button>
          <button
            type="button"
            onClick={() => addColumns(1)}
            className={compactButtonClass}
            title="Add Column"
          >
            + Column
          </button>
          <button
            type="button"
            onClick={removeRow}
            disabled={rows.length <= 1}
            className={`${compactButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
            title="Remove Last Row"
          >
            − Row
          </button>
          <button
            type="button"
            onClick={exportToCSV}
            className={compactButtonClass}
            title="Export as CSV"
          >
            ↓ Export
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="px-2 py-1 text-xs font-medium text-red-500 hover:text-red-600 transition"
            title="Clear All Data"
          >
            Clear
          </button>
        </div>
        <span className="text-xs text-gray-500">
          {rows.length} row{rows.length !== 1 ? 's' : ''} × {columns.length} column{columns.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Phase 6.3 - Clean spreadsheet-like table (Benchling style) */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="w-12 border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-500">
                #
              </th>
              {columns.map((column, index) => (
                <th
                  key={column}
                  className="group relative border border-gray-200 px-0 py-0 text-left"
                >
                  <div className="flex items-center">
                    {/* Clean editable column header - looks like text, becomes input on focus */}
                    <input
                      type="text"
                      value={column}
                      onChange={(event) =>
                        handleColumnChange(index, event.target.value)
                      }
                      placeholder={`Column ${index + 1}`}
                      className="w-full bg-transparent px-3 py-2 text-xs font-semibold text-gray-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-inset focus:ring-notebook-red"
                    />
                    {/* Remove column button - shows on hover */}
                    {columns.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(index)}
                        className="absolute right-1 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition"
                        aria-label={`Remove column ${column}`}
                        title="Remove column"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className="hover:bg-red-50/30 transition"
              >
                <td className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-400">
                  {row.id}
                </td>
                {columns.map((column) => (
                  <td key={column} className="border border-gray-200 px-0 py-0">
                    {/* Clean cell input - borderless, looks like text until focused */}
                    <input
                      type="text"
                      value={row[column] ?? ''}
                      onChange={(event) =>
                        updateCell(rowIndex, column, event.target.value)
                      }
                      className="w-full bg-transparent px-3 py-2 text-sm text-gray-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-inset focus:ring-notebook-red"
                      placeholder="−"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phase 6.3 - Minimal footer with save status */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
        <span>
          {isSaving
            ? 'Saving...'
            : lastSaved
            ? `Saved ${new Date(lastSaved).toLocaleTimeString()}`
            : 'Auto-saves as you type'}
        </span>
      </div>
    </div>
  )
}

export default DataTable
