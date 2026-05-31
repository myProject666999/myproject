const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(BASE + url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  const data = await res.json();
  if (data.code !== 0) {
    throw new Error(data.message || '请求失败');
  }
  return data.data;
}

export function createJielong(payload) {
  return request('/jielong', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getJielongList(params) {
  const qs = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.append(k, v);
    });
  }
  return request(`/jielong?${qs.toString()}`);
}

export function getJielong(id) {
  return request(`/jielong/${id}`);
}

export function closeJielong(id) {
  return request(`/jielong/${id}/close`, { method: 'PUT' });
}

export function deleteJielong(id) {
  return request(`/jielong/${id}`, { method: 'DELETE' });
}

export function getParticipants(id) {
  return request(`/jielong/${id}/participants`);
}

export function addParticipant(id, data) {
  return request(`/jielong/${id}/participants`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteParticipant(id) {
  return request(`/participant/${id}`, { method: 'DELETE' });
}

export function exportJielong(id) {
  window.open(`${BASE}/jielong/${id}/export`, '_blank');
}
