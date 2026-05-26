<template>
  <div class="about-page">
    <div class="about-card">
      <div class="avatar-section">
        <el-avatar :size="100" class="avatar">B</el-avatar>
        <h1 class="name">博主</h1>
        <p class="bio">技术爱好者，热爱编程与分享</p>
      </div>

      <div class="divider">
        <div class="divider-line"></div>
      </div>

      <div class="content-section">
        <h2>关于本站</h2>
        <p>这是一个基于 Node.js + Vue3 构建的个人博客系统，用于分享技术文章和生活随笔。</p>

        <h2>技术栈</h2>
        <ul class="tech-list">
          <li><el-tag type="primary" effect="plain">Node.js</el-tag> Express.js 后端框架</li>
          <li><el-tag type="success" effect="plain">Vue 3</el-tag> 前端框架</li>
          <li><el-tag type="warning" effect="plain">Element Plus</el-tag> UI 组件库</li>
          <li><el-tag type="danger" effect="plain">SQLite</el-tag> 轻量数据库</li>
          <li><el-tag type="info" effect="plain">Redis</el-tag> 缓存与计数</li>
        </ul>

        <h2>联系方式</h2>
        <p>如有问题或建议，欢迎在文章下方留言评论。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.about-page {
  max-width: 800px;
  margin: 0 auto;
}

.about-card {
  background: #fff;
  border-radius: 12px;
  padding: 48px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.avatar-section {
  text-align: center;
  padding: 24px 0;
}

.avatar {
  background: linear-gradient(135deg, #1e3a5f, #10b981);
  font-size: 36px;
  font-weight: 700;
  color: #fff;
}

.name {
  margin: 16px 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

.bio {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.divider {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.divider-line {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 2px;
}

.content-section h2 {
  margin: 24px 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.content-section p {
  color: #475569;
  line-height: 1.8;
  margin: 0 0 8px 0;
}

.tech-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tech-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  color: #475569;
  font-size: 14px;
}
</style>
