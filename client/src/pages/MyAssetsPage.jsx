import { useEffect, useState } from 'react'
import { myAssignments } from '../api/assignments'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { Card, ErrorText, PageHeader } from '../components/ui'

export default function MyAssetsPage() {
  const [assignments, setAssignments] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    myAssignments()
      .then((res) => setAssignments(res.data))
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load your assets'))
  }, [])

  return (
    <div>
      <PageHeader title="My Assets" description="Equipment currently assigned to you" />
      <ErrorText>{error}</ErrorText>
      <Card className="mt-4">
        <DataTable
          rowKey="_id"
          rows={assignments}
          emptyMessage="You have no assets currently assigned to you."
          columns={[
            { header: 'Asset Tag', render: (row) => row.assetId?.assetTag },
            { header: 'Category', render: (row) => row.assetId?.category },
            { header: 'Status', render: (row) => <StatusBadge status={row.assetId?.status} /> },
            { header: 'Assigned Since', render: (row) => new Date(row.assignedDate).toLocaleDateString() },
          ]}
        />
      </Card>
    </div>
  )
}
