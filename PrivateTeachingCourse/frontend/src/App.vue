<template>
  <div class="app">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <van-tabbar v-model="active" route v-if="showTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="calendar-o" to="/courses">课程</van-tabbar-item>
      <van-tabbar-item icon="friends-o" to="/community">社区</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const route = useRoute()
    
    const showTabbar = computed(() => {
      const tabbarRoutes = ['/', '/courses', '/community', '/profile']
      return tabbarRoutes.includes(route.path)
    })
    
    const active = computed(() => {
      const pathMap = { '/': 0, '/courses': 1, '/community': 2, '/profile': 3 }
      return pathMap[route.path] ?? 0
    })
    
    return { showTabbar, active }
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 50px;
}
</style>
