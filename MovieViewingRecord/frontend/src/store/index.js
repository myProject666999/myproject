import Vue from 'vue'
import Vuex from 'vuex'
import api from '@/utils/api'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    movies: [],
    totalMovies: 0,
    currentPage: 1,
    pageSize: 20,
    loading: false
  },
  mutations: {
    SET_MOVIES(state, movies) {
      state.movies = movies
    },
    SET_TOTAL(state, total) {
      state.totalMovies = total
    },
    SET_PAGE(state, page) {
      state.currentPage = page
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    }
  },
  actions: {
    async searchMovies({ commit }, params) {
      commit('SET_LOADING', true)
      try {
        const response = await api.searchMovies(params)
        commit('SET_MOVIES', response.content)
        commit('SET_TOTAL', response.totalElements)
        commit('SET_PAGE', response.currentPage + 1)
      } catch (error) {
        console.error('搜索电影失败:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {}
})
