<template>
  <div>
    <AppHeader />
    <div class="app-container">
      <div class="page-header">
        <div>
          <el-button text @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <h1 class="page-title">{{ comic?.title || '章节管理' }}</h1>
        </div>
        <el-button type="primary" @click="$router.push(`/author/comic/${comicId}/chapter/create`)">
          <el-icon><Plus /></el-icon>
          添加新章节
        </el-button>
      </div>

      <el-card v-loading="loading">
        <el-table :data="chapters" style="width: 100%">
          <el-table-column prop="chapter_number" label="话数" width="100">
            <template #default="{ row }">
              第{{ row.chapter_number }}话
            </template>
          </el-table-column>
          <el-table-column prop="title" label="章节标题" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.status === 'published' ? 'success' : 'warning'" size="small">
                {{ row.status === 'published' ? '已发布' : '草稿' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="views" label="阅读量" width="120" />
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" @click="handleView(row)">
                查看
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="chapters.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无章节，点击上方按钮添加">
            <el-button type="primary" @click="$router.push(`/author/comic/${comicId}/chapter/create`)">
              添加章节
            </el-button>
          </el-empty>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { chapterApi, comicApi } from '@/api'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()
const router = useRouter()

const comicId = route.params.id
const comic = ref(null)
const chapters = ref([])
const loading = ref(false)

onMounted(() => {
  fetchComic()
  fetchChapters()
})

async function fetchComic() {
  try {
    const res = await comicApi.getDetail(comicId)
    comic.value = res.comic
  } catch (error) {
    console.error('获取作品信息失败', error)
  }
}

async function fetchChapters() {
  loading.value = true
  try {
    const res = await chapterApi.getList(comicId)
    chapters.value = res.chapters || []
  } catch (error) {
    console.error('获取章节列表失败', error)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

function handleView(chapter) {
  router.push(`/read/${comicId}/chapter/${chapter.id}`)
}

async function handleDelete(chapter) {
  try {
    await ElMessageBox.confirm(
      `确定要删除第${chapter.chapter_number}话《${chapter.title}》吗？`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await chapterApi.delete(chapter.id)
    ElMessage.success('删除成功')
    fetchChapters()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
    }
  }
}
</script>
