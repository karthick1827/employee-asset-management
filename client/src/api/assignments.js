import client from './client'

export function assignAsset(assetId, employeeId, conditionNotes) {
  return client.post('/assignments', { assetId, employeeId, conditionNotes }).then((res) => res.data.data)
}

export function returnAsset(assignmentId, conditionNotes) {
  return client
    .patch(`/assignments/${assignmentId}/return`, { conditionNotes })
    .then((res) => res.data.data)
}

export function myAssignments() {
  return client.get('/assignments/my').then((res) => res.data)
}
