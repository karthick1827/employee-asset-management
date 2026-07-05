import client from './client'

export function listAssets(params) {
  return client.get('/assets', { params }).then((res) => res.data)
}

export function getAsset(id) {
  return client.get(`/assets/${id}`).then((res) => res.data.data)
}

export function createAsset(payload) {
  return client.post('/assets', payload).then((res) => res.data.data)
}

export function updateAsset(id, payload) {
  return client.put(`/assets/${id}`, payload).then((res) => res.data.data)
}

export function retireAsset(id) {
  return client.delete(`/assets/${id}`).then((res) => res.data.data)
}

export function getAssetHistory(id) {
  return client.get(`/assets/${id}/history`).then((res) => res.data)
}

export function getAssetMaintenance(id) {
  return client.get(`/assets/${id}/maintenance`).then((res) => res.data)
}
