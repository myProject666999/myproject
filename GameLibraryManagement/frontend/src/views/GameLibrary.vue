<template>
  <div class="game-library">
    <div class="page-header">
      <h2>我的游戏库</h2>
      <div class="actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索游戏..."
          style="width: 250px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col v-for="game in filteredGames" :key="game.id" :span="6">
        <el-card class="game-card" shadow="hover" @click="goToDetail(game.id)">
          <div class="game-cover">
            <img v-if="game.coverImage" :src="game.coverImage" :alt="game.name" />
            <div v-else class="cover-placeholder">
              <el-icon size="48"><Gamepad /></el-icon>
            </div>
          </div>
          <div class="game-info">
            <h3 class="game-name">{{ game.name }}</h3>
            <div class="game-meta">
              <span class="genre">{{ game.genre }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="filteredGames.length === 0" description="暂无游戏" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { gameApi } from '../api'

const router = useRouter()
const games = ref([])
const searchKeyword = ref('')

const filteredGames = computed(() => {
  if (!searchKeyword.value) return games.value
  const keyword = searchKeyword.value.toLowerCase()
  return games.value.filter(
    (g) =>
      g.name.toLowerCase().includes(keyword) ||
      (g.genre && g.genre.toLowerCase().includes(keyword))
  )
})

const goToDetail = (id) => {
  router.push(`/game/${id}`)
}

const loadGames = async () => {
  try {
    const res = await gameApi.getGames()
    if (res.code === 200) {
      games.value = res.data
    }
  } catch (error) {
    console.error('加载游戏失败:', error)
  }
}

onMounted(() => {
  loadGames()
})
</script>

<style scoped>
.game-library {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.game-card {
  cursor: pointer;
  margin-bottom: 20px;
  transition: transform 0.2s;
}
.game-card:hover {
  transform: translateY(-5px);
}
.game-cover {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}
.game-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-placeholder {
  color: rgba(255, 255, 255, 0.8);
}
.game-info {
  padding: 15px 0 5px;
}
.game-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}
.game-meta {
  color: #64748b;
  font-size: 13px;
}
.genre {
  background-color: #e0e7ff;
  color: #4f46e5;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}
</style>
