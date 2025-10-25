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

  const wrapperClasses = compact
    ? `flex w-[560px] max-w-full flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-md ${className}`
    : `flex w-full max-w-4xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg ${className}`

  const compactButtonClass =
    'rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-bio-primary hover:text-bio-primary'

  return (
    <div className={wrapperClasses}>
      {!compact ? (
        <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Notebook Data Table
            </h2>
            <p className="text-xs text-slate-500">
              Capture quick tabular notes. All edits stay inside your browser.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => addRows(1)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-bio-primary hover:text-bio-primary"
            >
              + Row
            </button>
            <button
              type="button"
              onClick={removeRow}
              disabled={rows.length <= 1}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              - Row
            </button>
            <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1">
              <label htmlFor={`${storageKey}-row-count`} className="sr-only">
                Rows to add
              </label>
              <input
                id={`${storageKey}-row-count`}
                type="number"
                min="1"
                value={rowBatchCount}
                onChange={(event) => setRowBatchCount(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleAddRows()
                  }
                }}
                className="h-7 w-14 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary/30"
              />
              <button
                type="button"
                onClick={handleAddRows}
                className="rounded-md bg-bio-primary px-2 py-1 text-xs font-semibold text-white transition hover:bg-bio-primary/90"
              >
                + Rows
              </button>
            </div>
            <button
              type="button"
              onClick={() => addColumns(1)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-bio-primary hover:text-bio-primary"
            >
              + Column
            </button>
            <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1">
              <label htmlFor={`${storageKey}-column-count`} className="sr-only">
                Columns to add
              </label>
              <input
                id={`${storageKey}-column-count`}
                type="number"
                min="1"
                value={columnBatchCount}
                onChange={(event) => setColumnBatchCount(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleAddColumns()
                  }
                }}
                className="h-7 w-16 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary/30"
              />
              <button
                type="button"
                onClick={handleAddColumns}
                className="rounded-md bg-bio-primary px-2 py-1 text-xs font-semibold text-white transition hover:bg-bio-primary/90"
              >
                + Columns
              </button>
            </div>
            <button
              type="button"
              onClick={exportToCSV}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-bio-primary hover:text-bio-primary"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
            >
              Clear
            </button>
          </div>
        </header>
      ) : (
        <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
          <button
            type="button"
            onClick={() => addRows(1)}
            className={compactButtonClass}
          >
            + Row
          </button>
          <button
            type="button"
            onClick={removeRow}
            disabled={rows.length <= 1}
            className={`${compactButtonClass} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            - Row
          </button>
          <button
            type="button"
            onClick={() => addColumns(1)}
            className={compactButtonClass}
          >
            + Column
          </button>
          <button
            type="button"
            onClick={handleAddRowsPrompt}
            className={compactButtonClass}
          >
            + Rows…
          </button>
          <button
            type="button"
            onClick={handleAddColumnsPrompt}
            className={compactButtonClass}
          >
            + Columns…
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-[11px] font-medium text-red-500 transition hover:bg-red-50"
          >
            Clear
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-slate-200 text-xs text-slate-700">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-10 border-b border-slate-200 px-2 py-1 text-left font-semibold">
                #
              </th>
              {columns.map((column, index) => (
                <th
                  key={column}
                  className="border-b border-slate-200 px-2 py-1 text-left font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={column}
                      onChange={(event) =>
                        handleColumnChange(index, event.target.value)
                      }
                      placeholder={`Column ${index + 1}`}
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary/30"
                    />
                    {columns.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(index)}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500 transition hover:border-red-200 hover:text-red-500"
                        aria-label={`Remove column ${column}`}
                      >
                        -
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
                className="odd:bg-white even:bg-slate-50/60 hover:bg-slate-100/40"
              >
                <td className="border-t border-slate-200 px-2 py-1 text-center text-xs font-semibold text-slate-500">
                  {row.id}
                </td>
                {columns.map((column) => (
                  <td key={column} className="border-t border-slate-200 px-2 py-1">
                    <input
                      type="text"
                      value={row[column] ?? ''}
                      onChange={(event) =>
                        updateCell(rowIndex, column, event.target.value)
                      }
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 transition focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary/30"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-1 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>{rows.length} rows</span>
        <span>
          {isSaving
            ? 'Saving...'
            : lastSaved
            ? `Last saved ${new Date(lastSaved).toLocaleTimeString()}`
            : 'No saves yet'}
        </span>
      </div>
    </div>
  )
}

export default DataTable
