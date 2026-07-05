import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { listAssets, createAsset } from '../api/assets'
import { listEmployees } from '../api/employees'
import { assignAsset } from '../api/assignments'
import { useAuth } from '../context/AuthContext'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { Button, Card, ErrorText, Field, Input, PageHeader, Select } from '../components/ui'

const emptyForm = { assetTag: '', category: '', brand: '', model: '', purchaseDate: '', warrantyExpiry: '' }

export default function AssetsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [assets, setAssets] = useState([])
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [modalOpen, setModalOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [assigningId, setAssigningId] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [error, setError] = useState('')

  function load() {
    listAssets(search ? { search } : undefined)
      .then((res) => setAssets(res.data))
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load assets'))
  }

  useEffect(() => {
    load()
    if (isAdmin) {
      listEmployees({ status: 'active' }).then((res) => setEmployees(res.data)).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    try {
      await createAsset(form)
      setForm(emptyForm)
      setModalOpen(false)
      load()
    } catch (err) {
      setFormError(err.response?.data?.error?.message || 'Failed to create asset')
    }
  }

  async function handleAssign(assetId) {
    setError('')
    try {
      await assignAsset(assetId, selectedEmployee)
      setAssigningId(null)
      setSelectedEmployee('')
      load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to assign asset')
    }
  }

  return (
    <div>
      <PageHeader
        title="Assets"
        description="Track inventory and lifecycle status"
        actions={
          isAdmin && (
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              New Asset
            </Button>
          )
        }
      />

      <div className="mb-4 max-w-xs">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by tag, category, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ErrorText>{error}</ErrorText>

      <Card className="mt-4">
        <DataTable
          rowKey="_id"
          rows={assets}
          columns={[
            {
              header: 'Asset Tag',
              render: (row) => (
                <Link to={`/assets/${row._id}`} className="font-medium text-indigo-600 hover:underline">
                  {row.assetTag}
                </Link>
              ),
            },
            { header: 'Category', field: 'category' },
            { header: 'Brand/Model', render: (row) => [row.brand, row.model].filter(Boolean).join(' ') },
            { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            {
              header: '',
              render: (row) => {
                if (!isAdmin || row.status !== 'available') return null
                if (assigningId === row._id) {
                  return (
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="w-40"
                      >
                        <option value="">Select employee</option>
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.name}
                          </option>
                        ))}
                      </Select>
                      <Button
                        variant="primary"
                        disabled={!selectedEmployee}
                        onClick={() => handleAssign(row._id)}
                        className="px-2.5 py-1.5 text-xs"
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setAssigningId(null)}
                        className="px-2.5 py-1.5 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  )
                }
                return (
                  <button
                    type="button"
                    onClick={() => setAssigningId(row._id)}
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    Assign
                  </button>
                )
              },
            },
          ]}
        />
      </Card>

      {isAdmin && modalOpen && (
        <Modal title="New Asset" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <Field label="Asset Tag">
              <Input required value={form.assetTag} onChange={(e) => setForm({ ...form, assetTag: e.target.value })} />
            </Field>
            <Field label="Category">
              <Input
                required
                placeholder="laptop, monitor, phone..."
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand">
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </Field>
              <Field label="Model">
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Purchase Date">
                <Input
                  type="date"
                  required
                  value={form.purchaseDate}
                  onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                />
              </Field>
              <Field label="Warranty Expiry">
                <Input
                  type="date"
                  required
                  value={form.warrantyExpiry}
                  onChange={(e) => setForm({ ...form, warrantyExpiry: e.target.value })}
                />
              </Field>
            </div>
            <ErrorText>{formError}</ErrorText>
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
