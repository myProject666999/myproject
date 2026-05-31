<template>
  <div class="home">
    <section class="home__section">
      <div class="home__section-header">
        <h2 class="home__section-title">热门专栏</h2>
        <el-button text type="primary" @click="goColumns">
          查看全部
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <div v-loading="loading" class="home__columns">
        <el-row :gutter="24">
          <el-col
            v-for="column in columns"
            :key="column.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <el-card
              class="home__column-card"
              shadow="hover"
              @click="goColumnDetail(column.id)"
            >
              <div class="home__column-cover">
                <el-image
                  :src="column.cover_image"
                  fit="cover"
                  class="home__column-image"
                >
                  <template #error>
                    <div class="home__column-image-placeholder">
                      <el-icon :size="48"><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <el-tag
                  v-if="column.is_free"
                  class="home__column-tag"
                  type="success"
                  effect="dark"
                >
                  免费
                </el-tag>
                <el-tag
                  v-else
                  class="home__column-tag"
                  type="warning"
                  effect="dark"
                >
                  付费
                </el-tag>
              </div>

              <div class="home__column-info">
                <h3 class="home__column-title">{{ column.title }}</h3>
                <p class="home__column-desc">{{ column.description }}</p>

                <div class="home__column-meta">
                  <div class="home__column-author">
                    <el-avatar :size="24" :src="column.author?.avatar">
                      {{ (column.author?.username || 'A').charAt(0).toUpperCase() }}
                    </el-avatar>
                    <span class="home__column-author-name">
                      {{ column.author?.username || '未知作者' }}
                    </span>
                  </div>
                  <div class="home__column-stats">
                    <span class="home__column-price">
                      ¥{{ (column.price || 0).toFixed(2) }}
                    </span>
                    <span class="home__column-subscribers">
                      <el-icon><User /></el-icon>
                      {{ column.subscriber_count || 0 }}
                    </span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-if="!loading && columns.length === 0" description="暂无专栏" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Picture, User } from '@element-plus/icons-vue'
import { columnApi } from '../api'

const router = useRouter()

const columns = ref([])
const loading = ref(false)

async function loadColumns() {
  loading.value = true
  try {
    const data = await columnApi.getList({ page: 1, pageSize: 8 })
    columns.value = data.items || data.list || data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function goColumnDetail(id) {
  router.push(`/column/${id}`)
}

function goColumns() {
  router.push('/columns')
}

onMounted(() => {
  loadColumns()
})
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.home__section {
  margin-bottom: 32px;
}

.home__section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.home__section-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.home__columns {
  min-height: 300px;
}

.home__column-card {
  cursor: pointer;
  margin-bottom: 24px;
  transition: transform 0.2s;
}

.home__column-card:hover {
  transform: translateY(-4px);
}

.home__column-cover {
  position: relative;
  margin: -20px -20px 0;
}

.home__column-image {
  width: 100%;
  height: 160px;
  display: block;
}

.home__column-image-placeholder {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);
}

.home__column-tag {
  position: absolute;
  top: 12px;
  right: 12px;
}

.home__column-info {
  padding-top: 16px;
}

.home__column-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home__column-desc {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  min-height: 39px;
}

.home__column-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.home__column-author {
  display: flex;
  align-items: center;
  gap: 6px;
}

.home__column-author-name {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.home__column-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.home__column-price {
  color: var(--el-color-danger);
  font-weight: 600;
}

.home__column-subscribers {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-secondary);
}
</style>
