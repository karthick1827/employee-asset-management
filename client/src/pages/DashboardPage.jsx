import { useEffect, useState } from 'react'
import { Boxes, CheckCircle2, Wrench, Archive, Download } from 'lucide-react'
import { getSummary, downloadAssetAllocationCsv } from '../api/dashboard'
import DataTable from '../components/DataTable'
import { Button, Card, ErrorText, PageHeader } from '../components/ui'

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getSummary()
      .then(setSummary)
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load dashboard'))
  }, [])

  if (error) return <ErrorText>{error}</ErrorText>
  if (!summary) return <p className="text-sm text-slate-400">Loading...</p>

  const cards = [
    { label: 'Total Assets', value: summary.totalAssets, icon: Boxes, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Assigned', value: summary.assignedCount, icon: CheckCircle2, color: 'bg-amber-50 text-amber-600' },
    { label: 'Available', value: summary.availableCount, icon: Boxes, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'In Repair', value: summary.inRepairCount, icon: Wrench, color: 'bg-orange-50 text-orange-600' },
    { label: 'Retired', value: summary.retiredCount, icon: Archive, color: 'bg-slate-100 text-slate-600' },
  ]

  return (
    <div>
      <PageHeader title="Dashboard" description="Fleet overview at a glance" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label} className="p-4">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}>
              <card.icon size={18} />
            </div>
            <div className="text-2xl font-semibold text-slate-900">{card.value}</div>
            <div className="text-sm text-slate-500">{card.label}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Warranty Expiring Soon</h2>
            <p className="text-xs text-slate-500">Within the next 90 days</p>
          </div>
          <Button variant="secondary" onClick={downloadAssetAllocationCsv}>
            <Download size={16} />
            Export CSV
          </Button>
        </div>
        <DataTable
          rowKey="_id"
          rows={summary.warrantyExpiringSoon}
          emptyMessage="No assets nearing warranty expiry."
          columns={[
            { header: 'Asset Tag', field: 'assetTag' },
            { header: 'Category', field: 'category' },
            {
              header: 'Warranty Expiry',
              render: (row) => new Date(row.warrantyExpiry).toLocaleDateString(),
            },
          ]}
        />
      </Card>
    </div>
  )
}
