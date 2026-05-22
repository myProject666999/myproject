<template>
  <div>
    <AppHeader />
    <div class="app-container">
      <div class="page-header">
        <h1 class="page-title">作者工作台</h1>
        <el-button type="primary" @click="$router.push('/author/comic/create')">
          <el-icon><Plus /></el-icon>
          创建新作品
        </el-button>
      </div>

      <div v-loading="loading" class="stats-cards">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#409eff"><Collection /></el-icon>
            <div>
              <div class="stat-value">{{ comics.length }}</div>
              <div class="stat-label">作品总数</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#67c23a"><View /></el-icon>
            <div>
              <div class="stat-value">{{ totalViews }}</div>
              <div class="stat-label">总阅读量</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#e6a23c"><Notebook /></el-icon>
            <div>
              <div class="stat-value">{{ totalChapters }}</div>
              <div class="stat-label">章节总数</div>
            </div>
          </div>
        </el-card>
      </div>

      <div class="comics-list">
        <h2 class="section-title">我的作品</h2>
        <div v-loading="loading" class="comics-grid">
          <el-card 
            v-for="comic in comics" 
            :key="comic.id" 
            class="comic-card"
            shadow="hover"
          >
            <div class="card-content">
              <img :src="comic.cover" :alt="comic.title" class="card-cover" />
              <div class="card-info">
                <h3 class="card-title ellipsis-1">{{ comic.title }}</h3>
                <p class="card-desc ellipsis-2">{{ comic.description || '暂无简介' }}</p>
                <div class="card-meta">
                  <el-tag :type="getStatusType(comic.status)" size="small">
                    {{ getStatusText(comic.status) }}
                  </el-tag>
                  <span>{{ comic.total_chapters || 0 }} 话</span>
                  <span>{{ formatNumber(comic.views) }} 阅读</span>
                </div>
              </div>
            </div>
            <div class="card-actions">
              <el-button type="primary" size="small" @click="$router.push(`/comic/${comic.id}`)">
                查看
              </el-button>
              <el-button size="small" @click="$router.push(`/author/comic/${comic.id}/chapters`)">
                章节管理
              </el-button>
              <el-button size="small" @click="$router.push(`/author/comic/${comic.id}/edit`)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(comic)">
                删除
              </el-button>
            </div>
          </el-card>
        </div>
        <div v-if="comics.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无作品，点击右上角创建新作品">
            <el-button type="primary" @click="$router.push('/author/comic/create')">
              创建作品
            </el-button>
          </el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { comicApi } from '@/api'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()
const comics = ref([])
const loading = ref(false)

const totalViews = computed(() => {
  return comics.value.reduce((sum, comic) => sum + (comic.views || 0), 0)
})

const totalChapters = computed(() => {
  return comics.value.reduce((sum, comic) => sum + (comic.total_chapters || 0), 0)
})

onMounted(() => {
  fetchComics()
})

async function fetchComics() {
  loading.value = true
  try {
    const res = await comicApi.getMyComics()
    comics.value = res.comics || []
  } catch (error) {
    console.error('获取作品列表失败', error)
  } finally {
    loading.value = false
  }
}

function formatNumber(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num || 0
}

function getStatusType(status) {
  const map = { ongoing: 'success', completed: 'info', hiatus: 'warning' }
  return map[status] || 'info'
}

function getStatusText(status) {
  const map = { ongoing: '连载中', completed: '已完结', hiatus: '暂停更新' }
  return map[status] || '未知'
}

async function handleDelete(comic) {
  try {
    await ElMessageBox.confirm(
      `确定要删除《${comic.title}》吗？删除后无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await comicApi.delete(comic.id)
    ElMessage.success('删除成功')
    fetchComics()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
    }
  }
}
</script>

<style scoped>
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  border-radius: 12px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.comics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.comic-card {
  border-radius: 12px;
  overflow: hidden;
}

.card-content {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.card-cover {
  width: 100px;
  height: 133px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 12px;
  flex: 1;
}

.card-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
  align-items: center;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
