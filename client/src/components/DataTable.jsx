import { EmptyState } from './ui'

export default function DataTable({ columns, rows, rowKey, emptyMessage = 'No records found.' }) {
  if (!rows || rows.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((col) => (
              <th key={col.header} className="whitespace-nowrap px-4 py-3 font-medium text-slate-500">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row[rowKey]} className="transition-colors hover:bg-slate-50">
              {columns.map((col) => (
                <td key={col.header} className="whitespace-nowrap px-4 py-3 text-slate-700">
                  {col.render ? col.render(row) : row[col.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
