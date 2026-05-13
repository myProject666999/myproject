
<template>
  <el-container class="admin-layout">
    <el-aside width="220px">
      <div class="logo">🎤 KTV管理系统</div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF">
        <el-menu-item index="/admin/dashboard">
          <i class="el-icon-s-data"></i>
          <span slot="title">数据概览</span>
        </el-menu-item>
        <el-menu-item index="/admin/room">
          <i class="el-icon-office-building"></i>
          <span slot="title">包厢管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/booking">
          <i class="el-icon-date"></i>
          <span slot="title">预订管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/drink">
          <i class="el-icon-goods"></i>
          <span slot="title">酒水管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/user">
          <i class="el-icon-user"></i>
          <span slot="title">用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/checkout">
          <i class="el-icon-s-claim"></i>
          <span slot="title">结账管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-content">
          <span class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </span>
          <div class="user-info">
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                <i class="el-icon-user-solid"></i>
                {{ userInfo }}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'AdminLayout',
  data() {
    return {
      userInfo: '管理员'
    }
  },
  computed: {
    activeMenu() {
      return this.$route.path
    },
    pageTitle() {
      const titleMap = {
        '/admin/dashboard': '数据概览',
        '/admin/room': '包厢管理',
        '/admin/booking': '预订管理',
        '/admin/drink': '酒水管理',
        '/admin/user': '用户管理',
        '/admin/checkout': '结账管理'
      }
      return titleMap[this.$route.path] || '管理后台'
    }
  },
  methods: {
    handleCommand(command) {
      if (command === 'logout') {
        this.$store.dispatch('logout')
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  color: #333;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background-color: #2B3A4A;
}

.el-menu-vertical-demo {
  border-right: none;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #EBEEF5;
  padding: 0;
}

.header-content {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.breadcrumb {
  flex: 1;
}

.user-info {
  cursor: pointer;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
