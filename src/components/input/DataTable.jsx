import React, { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'dataTableRows'

const createEmptyRow = (id) => ({
  id,
  protein: '',
  concentration: '',
  activity: '',
  ph: '',
  temp: '',
  notes: '',
})

const DataTable = () => {
  const [rows, setRows] = useState([createEmptyRow(1)])
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length) {
          setRows(parsed)
        }
      }
    } catch (error) {
      console.error('Failed to load stored table data', error)
    }
  }, [])

  const nextRowId = useMemo(() => {
    if (!rows.length) {
      return 1
    }
    return Math.max(...rows.map((row) => Number(row.id) || 0)) + 1
  }, [rows])

  const persistRows = (updatedRows) => {
    setIsSaving(true)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRows))
      setLastSaved(new Date().toISOString())
    } catch (error) {
      console.error('Failed to save table data', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateCell = (rowIndex, field, value) => {
    setRows((current) => {
      const updated = current.map((row, index) =>
        index === rowIndex ? { ...row, [field]: value } : row,
      )
      persistRows(updated)
      return updated
    })
  }

  const addRow = () => {
    setRows((current) => {
      const updated = [...current, createEmptyRow(nextRowId)]
      persistRows(updated)
      return updated
    })
  }

  const removeRow = () => {
    setRows((current) => {
      if (current.length <= 1) {
        return current
      }
      const updated = current.slice(0, -1)
      persistRows(updated)
      return updated
    })
  }

  const clearAll = () => {
    const updated = [createEmptyRow(1)]
    setRows(updated)
    persistRows(updated)
  }

  const exportToCSV = () => {
    if (!rows.length) {
      return
    }

    const header = [
      'ID',
      'Protein Name',
      'Concentration (µM)',
      'Activity (%)',
      'pH',
      'Temperature (°C)',
      'Notes',
    ]
    const lines = rows.map((row) =>
      [
        row.id,
        row.protein,
        row.concentration,
        row.activity,
        row.ph,
        row.temp,
        row.notes,
      ]
        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-bio-dark">
            Experimental Data Table
          </h2>
          <p className="text-sm text-gray-500">
            Track experimental conditions and results with live auto-save.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addRow}
            className="rounded-md bg-bio-primary px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Add Row
          </button>
          <button
            type="button"
            onClick={removeRow}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={rows.length <= 1}
          >
            Remove Row
          </button>
          <button
            type="button"
            onClick={exportToCSV}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Clear All
          </button>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                'ID',
                'Protein Name',
                'Concentration (µM)',
                'Activity (%)',
                'pH',
                'Temperature (°C)',
                'Notes',
              ].map((headerLabel) => (
                <th
                  key={headerLabel}
                  className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-700"
                >
                  {headerLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="odd:bg-white even:bg-gray-50">
                <td className="border-t border-gray-200 px-3 py-2 text-center font-medium text-gray-700">
                  {row.id}
                </td>
                <td className="border-t border-gray-200 px-3 py-2">
                  <input
                    type="text"
                    value={row.protein}
                    onChange={(event) =>
                      updateCell(index, 'protein', event.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1 focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary"
                  />
                </td>
                <td className="border-t border-gray-200 px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.concentration}
                    onChange={(event) =>
                      updateCell(index, 'concentration', event.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1 focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary"
                  />
                </td>
                <td className="border-t border-gray-200 px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    value={row.activity}
                    onChange={(event) =>
                      updateCell(index, 'activity', event.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1 focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary"
                  />
                </td>
                <td className="border-t border-gray-200 px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={row.ph}
                    onChange={(event) =>
                      updateCell(index, 'ph', event.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1 focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary"
                  />
                </td>
                <td className="border-t border-gray-200 px-3 py-2">
                  <input
                    type="number"
                    step="0.1"
                    value={row.temp}
                    onChange={(event) =>
                      updateCell(index, 'temp', event.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1 focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary"
                  />
                </td>
                <td className="border-t border-gray-200 px-3 py-2">
                  <input
                    type="text"
                    value={row.notes}
                    onChange={(event) =>
                      updateCell(index, 'notes', event.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-1 focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-1 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <span>{rows.length} rows</span>
        <span>
          {isSaving
            ? 'Saving...'
            : lastSaved
            ? `Last saved: ${new Date(lastSaved).toLocaleTimeString()}`
            : 'No saves yet'}
        </span>
      </div>
    </div>
  )
}

export default DataTable
