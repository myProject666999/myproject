import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const gameApi = {
  getGames: (keyword) => request.get('/games', { params: { keyword } }),
  getGame: (id) => request.get(`/games/${id}`),
  addGame: (data) => request.post('/games', data),
  updateGame: (data) => request.put('/games', data),
  deleteGame: (id) => request.delete(`/games/${id}`)
}

export const userGameApi = {
  getUserGames: (userId) => request.get(`/user-games/user/${userId}`),
  getUserGameDetail: (userId, gameId) => request.get(`/user-games/${userId}/${gameId}`),
  addUserGame: (data) => request.post('/user-games', data),
  updateUserGame: (data) => request.put('/user-games', data),
  addPlayTime: (userGameId, minutes) => request.post(`/user-games/${userGameId}/add-playtime`, null, { params: { minutes } })
}

export const statisticsApi = {
  getUserStatistics: (userId) => request.get(`/statistics/user/${userId}`)
}

export default request
