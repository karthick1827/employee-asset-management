import client from './client'

export function getSummary() {
  return client.get('/dashboard/summary').then((res) => res.data.data)
}

export async function downloadAssetAllocationCsv() {
  const res = await client.get('/reports/asset-allocation.csv', { responseType: 'blob' })
  const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'asset-allocation.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
