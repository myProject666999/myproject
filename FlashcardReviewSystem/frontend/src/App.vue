<template>
  <div id="app">
    <el-container>
      <el-header style="background: #409EFF; color: white; display: flex; align-items: center; justify-content: space-between;">
        <h1 style="margin: 0; font-size: 20px;">闪卡复习系统</h1>
        <div>
          <el-button type="primary" plain @click="$router.push('/')">
            <el-icon><Notebook /></el-icon> 今日复习
          </el-button>
          <el-button type="primary" plain @click="$router.push('/decks')">
            <el-icon><Collection /></el-icon> 牌组
          </el-button>
          <el-button type="primary" plain @click="$router.push('/new-card')">
            <el-icon><Plus /></el-icon> 新建卡片
          </el-button>
          <el-button type="primary" plain @click="$router.push('/statistics')">
            <el-icon><DataAnalysis /></el-icon> 统计
          </el-button>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
</script>

<style>
#app {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  min-height: 100vh;
}
.el-header {
  height: 60px !important;
}
.el-main {
  padding: 20px;
}
</style>
