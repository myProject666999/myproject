
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    token: localStorage.getItem('token') || '',
    role: localStorage.getItem('role') || ''
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    SET_ROLE(state, role) {
      state.role = role
      localStorage.setItem('role', role)
    },
    CLEAR_AUTH(state) {
      state.user = null
      state.token = ''
      state.role = ''
      localStorage.removeItem('token')
      localStorage.removeItem('role')
    }
  },
  actions: {
    login({ commit }, userData) {
      commit('SET_USER', userData.user)
      commit('SET_TOKEN', userData.token)
      commit('SET_ROLE', userData.role)
    },
    logout({ commit }) {
      commit('CLEAR_AUTH')
    }
  },
  getters: {
    isLoggedIn: state => !!state.token,
    userRole: state => state.role,
    userInfo: state => state.user
  }
})
