<template>
  <div id="app">
    <el-container style="height: 100vh">
      <el-header style="background: #409eff; color: white; display: flex; align-items: center; padding: 0 20px">
        <span style="font-size: 20px; font-weight: bold">🏃 运动日记</span>
        <el-menu
          :default-active="$route.path"
          mode="horizontal"
          background-color="#409eff"
          text-color="white"
          active-text-color="#ffd04b"
          style="margin-left: 30px; border: none"
          router
        >
          <el-menu-item index="/today">
            <el-icon><Sunny /></el-icon> 今日运动
          </el-menu-item>
          <el-menu-item index="/history">
            <el-icon><Document /></el-icon> 历史记录
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><DataLine /></el-icon> 统计
          </el-menu-item>
        </el-menu>
      </el-header>
      <el-main style="background: #f5f7fa; overflow-y: auto">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
