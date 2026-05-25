import request from '@/utils/request'

export function getKbCategories() {
  return request.get('/kb/categories')
}

export function getKbArticles(params) {
  return request.get('/kb/articles', { params })
}

export function getKbArticleDetail(id) {
  return request.get(`/kb/article/${id}`)
}

export function createKbArticle(data) {
  return request.post('/kb/article', data)
}

export function updateKbArticle(data) {
  return request.put('/kb/article', data)
}

export function deleteKbArticle(id) {
  return request.delete(`/kb/article/${id}`)
}

export function searchKbArticles(data) {
  return request.post('/kb/search', data)
}

export function markKbHelpful(id, data) {
  return request.post(`/kb/article/${id}/helpful`, data)
}
