
<template>
  <el-container style="height: 100vh;">
    <el-aside :width="collapsed ? '64px' : '200px'" style="background: #304156; transition: width 0.3s;">
      <div style="height: 60px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: bold; background: #263445;">
        <span v-show="!collapsed">美容美发系统</span>
        <span v-show="collapsed">美容</span>
      </div>
      <div class="menu-container">
        <el-menu
          :default-active="$route.path"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          :collapse="collapsed"
          router
          unique-opened
        >
          <template v-for="menu in menus" :key="menu.path">
            <el-sub-menu v-if="menu.children && menu.children.length" :index="menu.path">
              <template #title>
                <el-icon><component :is="menu.icon" /></el-icon>
                <span>{{ menu.permissionName }}</span>
              </template>
              <el-menu-item
                v-for="child in menu.children"
                :key="child.path"
                :index="child.path"
              >
                <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
                <span>{{ child.permissionName }}</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="menu.path">
              <el-icon><component :is="menu.icon" /></el-icon>
              <template #title>{{ menu.permissionName }}</template>
            </el-menu-item>
          </template>
        </el-menu>
      </div>
    </el-aside>
    <el-container class="main-container">
      <el-header style="background: #fff; border-bottom: 1px solid #e6e6e6; display: flex; align-items: center; justify-content: space-between; padding: 0 20px;">
        <div style="display: flex; align-items: center;">
          <el-icon style="font-size: 20px; cursor: pointer;" @click="collapsed = !collapsed">
            <Fold v-if="!collapsed" />
            <Expand v-if="collapsed" />
          </el-icon>
          <el-breadcrumb style="margin-left: 20px;">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div style="display: flex; align-items: center;">
          <el-dropdown @command="handleCommand">
            <span style="display: flex; align-items: center; cursor: pointer;">
              <el-avatar :size="32" :src="userStore.avatar" />
              <span style="margin-left: 10px;">{{ userStore.nickname || userStore.username }}</span>
              <el-icon style="margin-left: 5px;"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Fold, Expand, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const collapsed = ref(false)

const menus = computed(() => {
  const staticMenus = [
    {
      path: '/dashboard',
      permissionName: '工作台',
      icon: 'HomeFilled'
    },
    ...(userStore.menus || [])
  ]
  return staticMenus
})

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title
  }))
})

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      userStore.logout()
      router.push('/login')
    } catch {
    }
  }
}
</script>
