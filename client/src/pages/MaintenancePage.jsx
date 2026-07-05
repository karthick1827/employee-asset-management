import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listTickets, resolveTicket } from '../api/maintenance'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { Card, ErrorText, PageHeader } from '../components/ui'

export default function MaintenancePage() {
  const [tickets, setTickets] = useState([])
  const [error, setError] = useState('')

  function load() {
    listTickets()
      .then((res) => setTickets(res.data))
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load tickets'))
  }

  useEffect(load, [])

  async function handleResolve(id) {
    setError('')
    try {
      await resolveTicket(id)
      load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to resolve ticket')
    }
  }

  return (
    <div>
      <PageHeader title="Maintenance Tickets" description="Repair history across the fleet" />
      <ErrorText>{error}</ErrorText>
      <Card className="mt-4">
        <DataTable
          rowKey="_id"
          rows={tickets}
          emptyMessage="No maintenance tickets."
          columns={[
            {
              header: 'Asset',
              render: (row) =>
                row.assetId ? (
                  <Link to={`/assets/${row.assetId._id}`} className="font-medium text-indigo-600 hover:underline">
                    {row.assetId.assetTag}
                  </Link>
                ) : (
                  '—'
                ),
            },
            { header: 'Issue', field: 'issueDescription' },
            { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            { header: 'Reported', render: (row) => new Date(row.reportedDate).toLocaleDateString() },
            {
              header: '',
              render: (row) =>
                row.status !== 'resolved' ? (
                  <button
                    type="button"
                    onClick={() => handleResolve(row._id)}
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    Resolve
                  </button>
                ) : null,
            },
          ]}
        />
      </Card>
    </div>
  )
}
