import client from './client'

export function listEmployees(params) {
  return client.get('/employees', { params }).then((res) => res.data)
}

export function getEmployee(id) {
  return client.get(`/employees/${id}`).then((res) => res.data.data)
}

export function createEmployee(payload) {
  return client.post('/employees', payload).then((res) => res.data.data)
}

export function updateEmployee(id, payload) {
  return client.put(`/employees/${id}`, payload).then((res) => res.data.data)
}

export function deactivateEmployee(id) {
  return client.delete(`/employees/${id}`).then((res) => res.data.data)
}

export function getEmployeeHistory(id) {
  return client.get(`/employees/${id}/history`).then((res) => res.data)
}
