import React, { useEffect, useRef, useState } from 'react'

const DEFAULT_COLUMNS = ['Column A', 'Column B', 'Column C']

const createEmptyRow = (id, columns) => {
  const base = { id }
  columns.forEach((column) => {
    base[column] = ''
  })
  return base
}

const DataTable = ({
  storageKey = 'dataTableState',
  compact = false,
  className = '',
}) => {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS)
  const [rows, setRows] = useState(() => [createEmptyRow(1, DEFAULT_COLUMNS)])
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
        const sanitizedColumns =
          parsed.columns.filter((value) => typeof value === 'string') ||
          DEFAULT_COLUMNS
        setColumns(
          sanitizedColumns.length ? sanitizedColumns : DEFAULT_COLUMNS,
        )
        if (Array.isArray(parsed.rows) && parsed.rows.length) {
          setRows(
            parsed.rows.map((row, index) =>
              createEmptyRow(index + 1, sanitizedColumns).id
                ? {
                    ...createEmptyRow(index + 1, sanitizedColumns),
                    ...row,
                  }
                : createEmptyRow(index + 1, sanitizedColumns),
            ),
          )
        }
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

  const addRow = () => {
    setRows((current) => [
      ...current,
      createEmptyRow(current.length + 1, columns),
    ])
  }

  const removeRow = () => {
    setRows((current) => (current.length <= 1 ? current : current.slice(0, -1)))
  }

  const updateCell = (rowIndex, column, value) => {
    setRows((current) =>
      current.map((row, index) =>
        index === rowIndex ? { ...row, [column]: value } : row,
      ),
    )
  }

  const handleColumnChange = (index, value) => {
    setColumns((current) =>
      current.map((column, columnIndex) =>
        columnIndex === index ? value : column,
      ),
    )
  }

  const addColumn = () => {
    setColumns((current) => {
      const label = `Column ${current.length + 1}`
      const next = [...current, label]
      setRows((rowsCurrent) =>
        rowsCurrent.map((row) => ({ ...row, [label]: '' })),
      )
      return next
    })
  }

  const removeColumn = (index) => {
    if (columns.length <= 1) {
      return
    }
    const columnKey = columns[index]
    setColumns((current) => current.filter((_, i) => i !== index))
    setRows((current) =>
      current.map((row) => {
        const { [columnKey]: _removed, ...rest } = row
        return rest
      }),
    )
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

  const wrapperClasses = compact
    ? `flex w-[560px] max-w-full flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-md ${className}`
    : `flex w-full max-w-4xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg ${className}`

  return (
    <div className={wrapperClasses}>
      {!compact && (
        <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Notebook Data Table
            </h2>
            <p className="text-xs text-slate-500">
              Capture quick tabular notes. All edits stay inside your browser.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addRow}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-bio-primary hover:text-bio-primary"
            >
              + Row
            </button>
            <button
              type="button"
              onClick={removeRow}
              disabled={rows.length <= 1}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              − Row
            </button>
            <button
              type="button"
              onClick={addColumn}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-bio-primary hover:text-bio-primary"
            >
              + Column
            </button>
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
                      >
                        ×
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
            ? 'Saving…'
            : lastSaved
            ? `Last saved ${new Date(lastSaved).toLocaleTimeString()}`
            : 'No saves yet'}
        </span>
      </div>
    </div>
  )
}

export default DataTable
