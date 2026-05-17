import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: null,
    token: '',
    sidebarCollapse: false
  },
  mutations: {
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
    },
    SET_TOKEN(state, token) {
      state.token = token
    },
    TOGGLE_SIDEBAR(state) {
      state.sidebarCollapse = !state.sidebarCollapse
    }
  },
  actions: {
    setUserInfo({ commit }, userInfo) {
      commit('SET_USER_INFO', userInfo)
    },
    setToken({ commit }, token) {
      commit('SET_TOKEN', token)
    },
    toggleSidebar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    }
  },
  getters: {
    userInfo: state => state.userInfo,
    token: state => state.token,
    sidebarCollapse: state => state.sidebarCollapse
  }
})
