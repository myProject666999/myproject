<template>
  <el-container class="layout-container">
    <el-aside width="220px">
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><DataLine /></el-icon>
          <span>数据统计</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/exceptions">
          <el-icon><Warning /></el-icon>
          <span>异常工单</span>
        </el-menu-item>
        <el-menu-item index="/riders">
          <el-icon><User /></el-icon>
          <span>骑手管理</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><Avatar /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/pricing">
          <el-icon><PriceTag /></el-icon>
          <span>计费规则</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="layout-header">
        <div class="logo">同城速运 - 运营管理后台</div>
        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <el-icon><User /></el-icon>
              管理员
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataLine, List, Warning, User, Avatar, PriceTag, ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

function handleCommand(command: string) {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      localStorage.removeItem('admin_token')
      router.push('/login')
      ElMessage.success('退出成功')
    }).catch(() => {})
  }
}
</script>
