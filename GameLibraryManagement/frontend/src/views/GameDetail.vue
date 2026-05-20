<template>
  <div class="game-detail" v-if="game">
    <el-page-header @back="$router.back()" :content="game.name" class="page-header" />

    <el-row :gutter="20" class="detail-content">
      <el-col :span="8">
        <el-card>
          <div class="game-cover">
            <img v-if="game.coverImage" :src="game.coverImage" :alt="game.name" />
            <div v-else class="cover-placeholder">
              <el-icon size="64"><Gamepad /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card>
          <h2 class="game-title">{{ game.name }}</h2>
          <div class="game-meta">
            <el-tag type="primary">{{ game.genre }}</el-tag>
            <span class="price">¥{{ game.price }}</span>
          </div>
          <div class="game-info">
            <div class="info-item">
              <span class="label">开发商：</span>
              <span>{{ game.developer }}</span>
            </div>
            <div class="info-item">
              <span class="label">发行商：</span>
              <span>{{ game.publisher }}</span>
            </div>
            <div class="info-item">
              <span class="label">平台：</span>
              <span>{{ game.platform }}</span>
            </div>
          </div>
          <div class="game-description">
            <h4>游戏描述</h4>
            <p>{{ game.description || '暂无描述' }}</p>
          </div>
          <div class="actions">
            <el-button type="primary">
              <el-icon><Collection /></el-icon>
              添加到我的游戏库
            </el-button>
            <el-button>
              <el-icon><Star /></el-icon>
              收藏
            </el-button>
          </div>
        </el-card>

        <el-card class="playtime-card">
          <h3>游玩记录</h3>
          <el-empty description="暂无游玩记录" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { gameApi } from '../api'

const route = useRoute()
const game = ref(null)

const loadGameDetail = async () => {
  try {
    const res = await gameApi.getGame(route.params.id)
    if (res.code === 200) {
      game.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载游戏详情失败')
  }
}

onMounted(() => {
  loadGameDetail()
})
</script>

<style scoped>
.game-detail {
  padding: 20px;
}
.page-header {
  margin-bottom: 20px;
}
.game-cover {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
}
.game-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
.cover-placeholder {
  color: rgba(255, 255, 255, 0.8);
}
.game-title {
  margin: 0 0 15px 0;
  font-size: 24px;
  color: #1e293b;
}
.game-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}
.price {
  font-size: 20px;
  font-weight: bold;
  color: #f59e0b;
}
.game-info {
  margin-bottom: 20px;
}
.info-item {
  margin-bottom: 8px;
  color: #475569;
}
.label {
  color: #64748b;
}
.game-description h4 {
  margin: 0 0 10px 0;
  color: #334155;
}
.game-description p {
  color: #64748b;
  line-height: 1.6;
}
.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
.playtime-card {
  margin-top: 20px;
}
.playtime-card h3 {
  margin: 0 0 15px 0;
}
</style>
