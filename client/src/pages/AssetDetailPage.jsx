import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Undo2 } from 'lucide-react'
import { getAsset, getAssetMaintenance } from '../api/assets'
import { returnAsset } from '../api/assignments'
import { openTicket, resolveTicket } from '../api/maintenance'
import { useAuth } from '../context/AuthContext'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { Button, Card, ErrorText, Input } from '../components/ui'
import client from '../api/client'

export default function AssetDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const canSeeHistory = user?.role === 'admin' || user?.role === 'hr'
  const [asset, setAsset] = useState(null)
  const [history, setHistory] = useState([])
  const [tickets, setTickets] = useState([])
  const [issueDescription, setIssueDescription] = useState('')
  const [error, setError] = useState('')

  function load() {
    getAsset(id).then(setAsset).catch((err) => setError(err.response?.data?.error?.message || 'Failed to load asset'))
    if (canSeeHistory) {
      client.get(`/assets/${id}/history`).then((res) => setHistory(res.data.data)).catch(() => {})
    }
    getAssetMaintenance(id).then((res) => setTickets(res.data)).catch(() => {})
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleReturn(assignmentId) {
    setError('')
    try {
      await returnAsset(assignmentId)
      load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to return asset')
    }
  }

  async function handleOpenTicket(e) {
    e.preventDefault()
    setError('')
    try {
      await openTicket(id, issueDescription)
      setIssueDescription('')
      load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to open ticket')
    }
  }

  async function handleResolve(ticketId) {
    setError('')
    try {
      await resolveTicket(ticketId)
      load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to resolve ticket')
    }
  }

  if (!asset) return <p className="text-sm text-slate-400">{error || 'Loading...'}</p>

  const activeAssignment = history.find((h) => !h.returnedDate)

  return (
    <div>
      <Link to="/assets" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} />
        Back to assets
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{asset.assetTag}</h1>
            <StatusBadge status={asset.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {asset.category} — {[asset.brand, asset.model].filter(Boolean).join(' ') || '—'}
          </p>
        </div>
        {isAdmin && activeAssignment && (
          <Button variant="secondary" onClick={() => handleReturn(activeAssignment._id)}>
            <Undo2 size={16} />
            Return Asset
          </Button>
        )}
      </div>

      <ErrorText>{error}</ErrorText>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Purchased</p>
          <p className="text-sm font-medium text-slate-900">{new Date(asset.purchaseDate).toLocaleDateString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Warranty Expiry</p>
          <p className="text-sm font-medium text-slate-900">{new Date(asset.warrantyExpiry).toLocaleDateString()}</p>
        </Card>
      </div>

      {canSeeHistory && (
        <Card className="mb-6">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Assignment History</h2>
          </div>
          <DataTable
            rowKey="_id"
            rows={history}
            emptyMessage="No assignment history."
            columns={[
              { header: 'Employee', render: (row) => row.employeeId?.name || '(deleted)' },
              { header: 'Assigned', render: (row) => new Date(row.assignedDate).toLocaleDateString() },
              {
                header: 'Returned',
                render: (row) => (row.returnedDate ? new Date(row.returnedDate).toLocaleDateString() : '—'),
              },
              { header: 'Notes', field: 'conditionNotes' },
            ]}
          />
        </Card>
      )}

      <Card>
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Maintenance</h2>
        </div>
        {isAdmin && (
          <form onSubmit={handleOpenTicket} className="flex gap-2 border-b border-slate-100 px-5 py-4">
            <Input
              placeholder="Describe the issue"
              required
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
            />
            <Button type="submit" className="shrink-0">
              Report Issue
            </Button>
          </form>
        )}
        <DataTable
          rowKey="_id"
          rows={tickets}
          emptyMessage="No maintenance tickets."
          columns={[
            { header: 'Issue', field: 'issueDescription' },
            { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            { header: 'Reported', render: (row) => new Date(row.reportedDate).toLocaleDateString() },
            {
              header: '',
              render: (row) =>
                isAdmin && row.status !== 'resolved' ? (
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
