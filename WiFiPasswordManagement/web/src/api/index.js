const API = '/api'

export async function listNetworks() {
  const r = await fetch(`${API}/networks`)
  return r.json()
}

export async function getNetwork(id) {
  const r = await fetch(`${API}/networks/${id}`)
  return r.json()
}

export async function createNetwork(data) {
  const r = await fetch(`${API}/networks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return r.json()
}

export async function updateNetwork(id, data) {
  const r = await fetch(`${API}/networks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return r.json()
}

export async function deleteNetwork(id) {
  const r = await fetch(`${API}/networks/${id}`, { method: 'DELETE' })
  return r.ok
}

export async function qrUrl(id) {
  return `${API}/networks/${id}/qr`
}

export async function listShares(id) {
  const r = await fetch(`${API}/networks/${id}/shares`)
  return r.json()
}

export async function createShare(id, data) {
  const r = await fetch(`${API}/networks/${id}/shares`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {})
  })
  return r.json()
}

export async function deleteShare(id) {
  const r = await fetch(`${API}/shares/${id}`, { method: 'DELETE' })
  return r.ok
}

export async function getByShare(token) {
  const r = await fetch(`${API}/share/${token}`)
  return r.json()
}
