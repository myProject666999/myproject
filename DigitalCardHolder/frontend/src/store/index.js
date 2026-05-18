import { createStore } from 'vuex'

export default createStore({
  state: {
    groups: [],
    currentGroup: null
  },
  mutations: {
    SET_GROUPS(state, groups) {
      state.groups = groups
    },
    SET_CURRENT_GROUP(state, group) {
      state.currentGroup = group
    }
  },
  actions: {
    setGroups({ commit }, groups) {
      commit('SET_GROUPS', groups)
    },
    setCurrentGroup({ commit }, group) {
      commit('SET_CURRENT_GROUP', group)
    }
  },
  modules: {}
})
