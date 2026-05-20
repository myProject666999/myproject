import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

export const deckApi = {
  getAllDecks: () => api.get('/decks'),
  getDeckById: (id) => api.get(`/decks/${id}`),
  createDeck: (deck) => api.post('/decks', deck),
  updateDeck: (id, deck) => api.put(`/decks/${id}`, deck),
  deleteDeck: (id) => api.delete(`/decks/${id}`)
}

export const cardApi = {
  getAllCards: () => api.get('/cards'),
  getCardById: (id) => api.get(`/cards/${id}`),
  getCardsByDeckId: (deckId) => api.get(`/cards/deck/${deckId}`),
  getDueCards: () => api.get('/cards/due'),
  getDueCardsByDeckId: (deckId) => api.get(`/cards/due/deck/${deckId}`),
  countDueCards: () => api.get('/cards/due/count'),
  createCard: (card) => api.post('/cards', card),
  updateCard: (id, card) => api.put(`/cards/${id}`, card),
  deleteCard: (id) => api.delete(`/cards/${id}`),
  reviewCard: (id, quality) => api.post(`/cards/${id}/review`, { quality }),
  importCards: (deckId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/cards/import/${deckId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const statisticsApi = {
  getOverallStatistics: () => api.get('/statistics'),
  getDeckStatistics: (deckId) => api.get(`/statistics/deck/${deckId}`)
}

export default api
