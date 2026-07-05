import { useEffect, useState } from 'react'
import { Plus, Search, UserMinus } from 'lucide-react'
import { listEmployees, createEmployee, deactivateEmployee } from '../api/employees'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { Button, Card, ErrorText, Field, Input, PageHeader } from '../components/ui'

const emptyForm = { employeeId: '', name: '', department: '', designation: '', email: '' }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  function load() {
    listEmployees(search ? { search } : undefined)
      .then((res) => setEmployees(res.data))
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load employees'))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    try {
      await createEmployee(form)
      setForm(emptyForm)
      setModalOpen(false)
      load()
    } catch (err) {
      setFormError(err.response?.data?.error?.message || 'Failed to create employee')
    }
  }

  async function handleDeactivate(id) {
    setError('')
    try {
      await deactivateEmployee(id)
      load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to deactivate employee')
    }
  }

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage employee records"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            New Employee
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name or employee ID"
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
          rows={employees}
          columns={[
            { header: 'Employee ID', field: 'employeeId' },
            { header: 'Name', field: 'name' },
            { header: 'Department', field: 'department' },
            { header: 'Designation', field: 'designation' },
            { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            {
              header: '',
              render: (row) =>
                row.status === 'active' ? (
                  <button
                    type="button"
                    onClick={() => handleDeactivate(row._id)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-red-600"
                  >
                    <UserMinus size={14} />
                    Deactivate
                  </button>
                ) : null,
            },
          ]}
        />
      </Card>

      {modalOpen && (
        <Modal title="New Employee" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <Field label="Employee ID">
              <Input required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
            </Field>
            <Field label="Name">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Department">
              <Input
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </Field>
            <Field label="Designation">
              <Input
                required
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
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
