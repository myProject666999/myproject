import request from '../utils/request'

export const getNotes = () => request.get('/notes')
export const getNotesByBook = (bookId) => request.get(`/notes/book/${bookId}`)
export const getNote = (id) => request.get(`/notes/${id}`)
export const getNoteTags = (id) => request.get(`/notes/${id}/tags`)
export const getFavoriteNotes = () => request.get('/notes/favorites')
export const getRandomNotes = (limit = 5) => request.get(`/notes/random?limit=${limit}`)
export const getRandomNotesByBook = (bookId, limit = 5) => request.get(`/notes/random/book/${bookId}?limit=${limit}`)
export const createNote = (data) => request.post('/notes', data)
export const updateNote = (id, data) => request.put(`/notes/${id}`, data)
export const deleteNote = (id) => request.delete(`/notes/${id}`)
export const markReviewed = (id) => request.put(`/notes/${id}/review`)
