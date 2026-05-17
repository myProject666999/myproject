<template>
  <el-container style="height: 100vh;">
    <el-aside width="200px" style="background-color: #304156;">
      <div style="height: 60px; line-height: 60px; text-align: center; color: #fff; font-size: 18px; font-weight: bold;">
        建筑公司管理系统
      </div>
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical-demo"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router>
        <el-menu-item index="/">
          <i class="el-icon-s-home"></i>
          <span slot="title">首页</span>
        </el-menu-item>
        <el-menu-item index="/customer">
          <i class="el-icon-user"></i>
          <span slot="title">客户管理</span>
        </el-menu-item>
        <el-menu-item index="/project">
          <i class="el-icon-folder-opened"></i>
          <span slot="title">项目管理</span>
        </el-menu-item>
        <el-menu-item index="/worker">
          <i class="el-icon-s-custom"></i>
          <span slot="title">工人管理</span>
        </el-menu-item>
        <el-menu-item index="/material">
          <i class="el-icon-goods"></i>
          <span slot="title">材料管理</span>
        </el-menu-item>
        <el-menu-item index="/progress">
          <i class="el-icon-timeline"></i>
          <span slot="title">进度管理</span>
        </el-menu-item>
        <el-menu-item index="/acceptance">
          <i class="el-icon-circle-check"></i>
          <span slot="title">验收管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="background-color: #fff; border-bottom: 1px solid #e6e6e6;">
        <div style="line-height: 60px;">
          <span style="font-size: 16px;">{{ currentPageTitle }}</span>
        </div>
      </el-header>
      <el-main style="background-color: #f0f2f5;">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'App',
  computed: {
    currentPageTitle() {
      const titleMap = {
        '/': '首页',
        '/customer': '客户管理',
        '/project': '项目管理',
        '/worker': '工人管理',
        '/material': '材料管理',
        '/progress': '进度管理',
        '/acceptance': '验收管理'
      }
      return titleMap[this.$route.path] || '建筑公司管理系统'
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
html, body, #app {
  width: 100%;
  height: 100%;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
