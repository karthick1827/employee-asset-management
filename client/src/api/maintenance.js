import client from './client'

export function listTickets(params) {
  return client.get('/maintenance', { params }).then((res) => res.data)
}

export function openTicket(assetId, issueDescription) {
  return client.post('/maintenance', { assetId, issueDescription }).then((res) => res.data.data)
}

export function resolveTicket(ticketId) {
  return client.patch(`/maintenance/${ticketId}/resolve`).then((res) => res.data.data)
}
