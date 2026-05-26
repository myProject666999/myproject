<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isCollapse = ref(false);

const activeMenu = computed(() => route.name);

const menuItems = [
  {
    index: 'admin-dashboard',
    title: '仪表盘',
    icon: 'Odometer',
  },
  {
    index: 'admin-articles',
    title: '文章管理',
    icon: 'Document',
  },
  {
    index: 'admin-categories',
    title: '分类标签',
    icon: 'Folder',
  },
  {
    index: 'admin-comments',
    title: '评论管理',
    icon: 'ChatDotRound',
  },
];

function handleSelect(index: string) {
  router.push({ name: index });
}

function handleLogout() {
  authStore.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <el-container class="h-screen">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="bg-gray-900 transition-all duration-300">
      <div class="h-14 flex items-center justify-center border-b border-gray-700">
        <span v-if="!isCollapse" class="text-white text-lg font-bold">博客管理</span>
        <el-icon v-else class="text-indigo-400 text-xl"><Menu /></el-icon>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        background-color="#1f2937"
        text-color="#9ca3af"
        active-text-color="#818cf8"
        class="border-none"
        @select="handleSelect"
      >
        <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
      <div class="absolute bottom-4 left-0 right-0 px-4">
        <button
          @click="isCollapse = !isCollapse"
          class="w-full py-2 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
        >
          <el-icon :size="20">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </button>
      </div>
    </el-aside>

    <el-container>
      <el-header class="bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div class="text-gray-700 text-lg font-medium">
          {{ menuItems.find(m => m.index === activeMenu)?.title || '管理后台' }}
        </div>
        <div class="flex items-center gap-4">
          <el-dropdown>
            <div class="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
              <el-avatar :size="32" class="bg-indigo-500">
                {{ authStore.user?.nickname?.charAt(0) || 'A' }}
              </el-avatar>
              <span class="text-gray-700">{{ authStore.user?.nickname || '管理员' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  <el-icon class="mr-2"><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="bg-gray-50 p-6 overflow-auto">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.el-aside {
  position: relative;
}

.el-menu {
  border-right: none;
}
</style>
