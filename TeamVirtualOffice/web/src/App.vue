<template>
  <div id="app">
    <template v-if="isLoggedIn">
      <div class="sidebar">
        <div class="logo">
          <span>Team Office</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          class="nav-menu"
        >
          <el-menu-item index="/office">
            <el-icon><House /></el-icon>
            <span>Office</span>
          </el-menu-item>
          <el-menu-item index="/members">
            <el-icon><User /></el-icon>
            <span>Members</span>
          </el-menu-item>
          <el-menu-item index="/activities">
            <el-icon><ChatDotRound /></el-icon>
            <span>Activities</span>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>Settings</span>
          </el-menu-item>
        </el-menu>
        <div class="user-info">
          <div class="connection-status">
            <el-icon :class="wsConnected ? 'connected' : 'disconnected'">
              <Connection />
            </el-icon>
            <span>{{ wsConnected ? 'Online' : 'Offline' }}</span>
          </div>
          <div class="user-name">{{ userInfo?.username || 'User' }}</div>
          <el-button type="danger" size="small" @click="handleLogout">
            Logout
          </el-button>
        </div>
      </div>
      <div class="main-content">
        <router-view />
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useWsStore } from '@/stores/ws'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const wsStore = useWsStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)
const wsConnected = computed(() => wsStore.connected)

const activeMenu = computed(() => route.path)

async function handleLogout() {
  wsStore.disconnect()
  await userStore.logout()
  router.push('/login')
}

onMounted(() => {
  if (isLoggedIn.value) {
    wsStore.connect()
  }
})

onUnmounted(() => {
  wsStore.disconnect()
})
</script>

<style lang="scss">
#app {
  height: 100vh;
  display: flex;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.sidebar {
  width: 240px;
  height: 100%;
  background: #001529;
  display: flex;
  flex-direction: column;
  color: #fff;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nav-menu {
    flex: 1;
    border-right: none;
    background: transparent;
  }

  .user-info {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    .connection-status {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 14px;

      .connected {
        color: #67c23a;
      }

      .disconnected {
        color: #f56c6c;
      }
    }

    .user-name {
      margin-bottom: 12px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.85);
    }
  }
}

.main-content {
  flex: 1;
  height: 100%;
  overflow: auto;
  background: #f5f7fa;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
