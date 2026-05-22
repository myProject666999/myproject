<template>
  <div>
    <AppHeader />
    <div class="app-container">
      <div class="page-header">
        <h1 class="page-title">我的订阅</h1>
      </div>

      <div v-loading="loading" class="subscriptions-list">
        <div 
          v-for="item in subscriptions" 
          :key="item.id" 
          class="subscription-item card-hover"
          @click="$router.push(`/comic/${item.comic_id}`)"
        >
          <img :src="item.cover" :alt="item.title" class="item-cover" />
          <div class="item-info">
            <h3 class="item-title ellipsis-1">{{ item.title }}</h3>
            <p class="item-desc ellipsis-2">{{ item.description }}</p>
            <div class="item-meta">
              <el-tag :type="getStatusType(item.status)" size="small">
                {{ getStatusText(item.status) }}
              </el-tag>
              <span>已更新 {{ item.total_chapters }} 话</span>
              <span v-if="item.latest_chapter">最新: 第{{ item.latest_chapter }}话</span>
            </div>
            <div v-if="item.last_read_chapter" class="item-progress">
              <span>已读到: 第{{ item.last_read_chapter }}话</span>
            </div>
          </div>
          <div class="item-actions" @click.stop>
            <el-button type="primary" size="small" @click="handleContinueRead(item)">
              继续阅读
            </el-button>
            <el-button type="danger" size="small" @click="handleUnsubscribe(item)">
              取消订阅
            </el-button>
          </div>
        </div>
        <div v-if="subscriptions.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无订阅">
            <el-button type="primary" @click="$router.push('/')">发现漫画</el-button>
          </el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { subscriptionApi, chapterApi } from '@/api'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()
const subscriptions = ref([])
const loading = ref(false)

onMounted(() => {
  fetchSubscriptions()
})

async function fetchSubscriptions() {
  loading.value = true
  try {
    const res = await subscriptionApi.getList()
    subscriptions.value = res.subscriptions || []
  } catch (error) {
    console.error('获取订阅列表失败', error)
  } finally {
    loading.value = false
  }
}

function getStatusType(status) {
  const map = { ongoing: 'success', completed: 'info', hiatus: 'warning' }
  return map[status] || 'info'
}

function getStatusText(status) {
  const map = { ongoing: '连载中', completed: '已完结', hiatus: '暂停更新' }
  return map[status] || '未知'
}

async function handleContinueRead(item) {
  try {
    const res = await chapterApi.getList(item.comic_id)
    const chapters = res.chapters || []
    
    let targetChapter
    if (item.last_read_chapter) {
      targetChapter = chapters.find(c => c.chapter_number > item.last_read_chapter) || chapters[chapters.length - 1]
    } else {
      targetChapter = chapters[0]
    }
    
    if (targetChapter) {
      router.push(`/read/${item.comic_id}/chapter/${targetChapter.id}`)
    } else {
      router.push(`/comic/${item.comic_id}`)
    }
  } catch (error) {
    console.error('获取章节失败', error)
    router.push(`/comic/${item.comic_id}`)
  }
}

async function handleUnsubscribe(item) {
  try {
    await ElMessageBox.confirm(
      `确定要取消订阅《${item.title}》吗？`,
      '取消订阅',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await subscriptionApi.toggle(item.comic_id)
    ElMessage.success('已取消订阅')
    fetchSubscriptions()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订阅失败', error)
    }
  }
}
</script>

<style scoped>
.subscriptions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.subscription-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.subscription-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.item-cover {
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.item-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 12px;
}

.item-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #909399;
  align-items: center;
}

.item-progress {
  margin-top: auto;
  padding-top: 12px;
  font-size: 13px;
  color: #409eff;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}
</style>
