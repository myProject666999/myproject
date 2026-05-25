<template>
  <div class="kb-article-detail">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-button link @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <span class="title">{{ article.title }}</span>
        </div>
      </template>

      <div class="article-meta">
        <el-tag>{{ article.categoryName }}</el-tag>
        <span>浏览: {{ article.viewCount }}</span>
        <span>创建于: {{ formatTime(article.createdAt) }}</span>
      </div>

      <div class="article-content" v-html="article.content"></div>

      <div class="article-footer">
        <span>这篇文章对您有帮助吗？</span>
        <el-button type="success" :icon="Check" @click="markHelpful(true)">有帮助</el-button>
        <el-button type="danger" :icon="Close" @click="markHelpful(false)">没帮助</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'
import { getKbArticleDetail, markKbHelpful } from '@/api/kb'
import dayjs from 'dayjs'

const route = useRoute()
const article = ref({})

function formatTime(time) {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

async function loadArticle() {
  const res = await getKbArticleDetail(route.params.id)
  if (res.code === 0) {
    article.value = res.data
  }
}

async function markHelpful(helpful) {
  const res = await markKbHelpful(route.params.id, { helpful })
  if (res.code === 0) {
    ElMessage.success('感谢您的反馈')
  }
}

onMounted(() => {
  loadArticle()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;

  .title {
    font-size: 20px;
    font-weight: bold;
  }
}

.article-meta {
  display: flex;
  gap: 20px;
  margin: 20px 0;
  color: #909399;
  font-size: 14px;
}

.article-content {
  line-height: 1.8;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.article-footer {
  margin-top: 20px;
  text-align: center;

  span {
    margin-right: 20px;
    color: #606266;
  }
}
</style>
