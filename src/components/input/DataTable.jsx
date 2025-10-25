import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

const STORAGE_KEY = 'dataTableState'

const DEFAULT_COLUMNS = [
  { key: 'protein', label: 'Protein' },
  { key: 'concentration', label: 'Conc. (uM)' },
  { key: 'activity', label: 'Activity (%)' },
  { key: 'ph', label: 'pH' },
  { key: 'temp', label: 'Temp (°C)' },
  { key: 'notes', label: 'Notes' },
]

const createEmptyRow = (id, columns) => {
  const base = { id }
  columns.forEach((column) => {
    base[column.key] = ''
  })
  return base
}

const ensureRows = (rows, columns) => {
  if (!Array.isArray(rows) || !rows.length) {
    return [createEmptyRow(1, columns)]
  }
  return rows.map((row, index) => {
    const next = { id: row?.id ?? index + 1 }
    columns.forEach((column) => {
      next[column.key] = row?.[column.key] ?? ''
    })
    return next
  })
}

const sanitizeColumns = (columns) => {
  if (!Array.isArray(columns) || !columns.length) {
    return DEFAULT_COLUMNS
  }

  return columns
    .map((column, index) => ({
      key: column?.key || `col_${index}`,
      label: column?.label || `Column ${index + 1}`,
    }))
    .filter((column, index, array) => array.findIndex((c) => c.key === column.key) === index)
}

const DataTable = ({ storageKey = STORAGE_KEY, compact = false, className = '' }) => {
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
      if (Array.isArray(parsed?.rows) && Array.isArray(parsed?.columns)) {
        const sanitizedColumns = sanitizeColumns(parsed.columns)
        setColumns(sanitizedColumns)
        setRows(ensureRows(parsed.rows, sanitizedColumns))
      } else if (Array.isArray(parsed)) {
        setColumns(DEFAULT_COLUMNS)
        setRows(ensureRows(parsed, DEFAULT_COLUMNS))
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

  const nextRowId = useMemo(() => {
    if (!rows.length) {
      return 1
    }
    return Math.max(...rows.map((row) => Number(row.id) || 0)) + 1
  }, [rows])

  const updateCell = (rowIndex, columnKey, value) => {
    setRows((current) =>
      current.map((row, index) =>
        index === rowIndex ? { ...row, [columnKey]: value } : row,
      ),
    )
  }

  const handleColumnLabelChange = (columnIndex, label) => {
    setColumns((current) =>
      current.map((column, index) =>
        index === columnIndex ? { ...column, label } : column,
      ),
    )
  }

  const addRow = () => {
    setRows((current) => [...current, createEmptyRow(nextRowId, columns)])
  }

  const removeRow = () => {
    setRows((current) => {
      if (current.length <= 1) {
        return current
      }
      return current.slice(0, -1)
    })
  }

  const clearAll = () => {
    setRows([createEmptyRow(1, columns)])
  }

  const addColumn = () => {
    setColumns((current) => {
      const key = `col_${Date.now()}`
      const updated = [
        ...current,
        { key, label: `Column ${current.length + 1}` },
      ]
      setRows((rowsCurrent) =>
        rowsCurrent.map((row) => ({ ...row, [key]: '' })),
      )
      return updated
    })
  }

  const removeColumn = (columnKey) => {
    if (columns.length <= 1) {
      return
    }
    setColumns((current) =>
      current.filter((column) => column.key !== columnKey),
    )
    setRows((rowsCurrent) =>
      rowsCurrent.map((row) => {
        const { [columnKey]: _removed, ...rest } = row
        return rest
      }),
    )
  }

  const exportToCSV = () => {
    if (!rows.length) {
      return
    }

    const header = columns.map((column) =>
      column.label?.trim() ? column.label.trim() : column.key,
    )
    const lines = rows.map((row) =>
      columns
        .map((column) =>
          `"${String(row[column.key] ?? '').replace(/"/g, '""')}"`,
        )
        .join(','),
    )
    const csvContent = [header.join(','), ...lines].join('\r\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `experimental-data-${new Date().toISOString()}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const table = useReactTable({
    data: rows,
    columns: [
      {
        accessorKey: 'id',
        header: '#',
        size: 40,
        cell: (ctx) => (
          <span className="text-xs font-semibold text-slate-500">
            {ctx.getValue()}
          </span>
        ),
      },
      ...columns.map((column, columnIndex) => ({
        accessorKey: column.key,
        header: () => (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={column.label}
              onChange={(event) =>
                handleColumnLabelChange(columnIndex, event.target.value)
              }
              placeholder={`Column ${columnIndex + 1}`}
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary/30"
            />
            {columns.length > 1 && (
              <button
                type="button"
                onClick={() => removeColumn(column.key)}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500 transition hover:border-red-200 hover:text-red-500"
                aria-label={`Remove ${column.label || `column ${columnIndex + 1}`}`}
              >
                ×
              </button>
            )}
          </div>
        ),
        cell: (ctx) => (
          <input
            type="text"
            value={ctx.getValue() ?? ''}
            onChange={(event) =>
              updateCell(ctx.row.index, column.key, event.target.value)
            }
            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 transition focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary/30"
          />
        ),
      })),
    ],
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
  })

  const wrapperClasses = compact
    ? `flex w-[640px] max-w-full flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-md ${className}`
    : `flex w-full max-w-4xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg ${className}`

  return (
    <div className={wrapperClasses}>
      {!compact && (
        <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Experimental Data Table
            </h2>
            <p className="text-xs text-slate-500">
              Customize columns, capture measurements, and export snapshots. All
              data stays local to your browser.
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
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="odd:bg-white even:bg-slate-50/60 hover:bg-slate-100/40"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border-t border-slate-200 px-3 py-2 align-top"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
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
