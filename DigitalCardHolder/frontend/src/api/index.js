import request from '@/utils/request'

export function getCardList(params) {
  return request({
    url: '/cards',
    method: 'get',
    params
  })
}

export function getAllCards() {
  return request({
    url: '/cards/all',
    method: 'get'
  })
}

export function getCard(id) {
  return request({
    url: `/cards/${id}`,
    method: 'get'
  })
}

export function saveCard(data) {
  return request({
    url: '/cards',
    method: 'post',
    data
  })
}

export function updateCard(data) {
  return request({
    url: '/cards',
    method: 'put',
    data
  })
}

export function deleteCard(id) {
  return request({
    url: `/cards/${id}`,
    method: 'delete'
  })
}

export function toggleFavorite(id) {
  return request({
    url: `/cards/${id}/favorite`,
    method: 'put'
  })
}

export function ocrRecognize(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/ocr/recognize',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function ocrRecognizeAndSave(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/ocr/recognize-and-save',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function getGroups() {
  return request({
    url: '/groups',
    method: 'get'
  })
}

export function saveGroup(data) {
  return request({
    url: '/groups',
    method: 'post',
    data
  })
}

export function updateGroup(data) {
  return request({
    url: '/groups',
    method: 'put',
    data
  })
}

export function deleteGroup(id) {
  return request({
    url: `/groups/${id}`,
    method: 'delete'
  })
}

export function exportVCard(id) {
  window.open(`/api/vcard/${id}`)
}

export function exportAllVCards() {
  window.open('/api/vcard/export-all')
}
