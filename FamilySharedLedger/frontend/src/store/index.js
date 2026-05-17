import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || '',
    currentFamily: null
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    SET_FAMILY(state, family) {
      state.currentFamily = family
    },
    LOGOUT(state) {
      state.user = null
      state.token = ''
      state.currentFamily = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  },
  actions: {
    login({ commit }, data) {
      commit('SET_USER', data.user)
      commit('SET_TOKEN', data.token)
    },
    logout({ commit }) {
      commit('LOGOUT')
    }
  }
})
