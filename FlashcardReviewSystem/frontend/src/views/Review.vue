<template>
  <div class="review-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>今日复习</span>
          <span style="color: #909399; font-size: 14px;">
            剩余待复习: {{ dueCards.length }} 张
          </span>
        </div>
      </template>

      <div v-if="dueCards.length === 0" class="no-cards">
        <el-icon size="80" color="#409EFF"><Finished /></el-icon>
        <h3>太棒了！今天没有需要复习的卡片</h3>
        <p>去添加一些新卡片吧！</p>
      </div>

      <div v-else-if="currentCard" class="review-card">
        <div class="card-content" @click="showAnswer = !showAnswer">
          <div class="card-face">
            <h3>{{ showAnswer ? '答案' : '问题' }}</h3>
            <p class="card-text">{{ showAnswer ? currentCard.back : currentCard.front }}</p>
            <p class="hint" v-if="!showAnswer">点击卡片查看答案</p>
          </div>
        </div>

        <div v-if="showAnswer" class="rating-buttons">
          <p style="text-align: center; margin-bottom: 15px; color: #606266;">你记得这张卡片吗？</p>
          <el-space>
            <el-button type="danger" @click="rateCard(0)">
              <el-icon><CircleClose /></el-icon> 完全忘记
            </el-button>
            <el-button type="warning" @click="rateCard(2)">
              <el-icon><Warning /></el-icon> 有点印象
            </el-button>
            <el-button type="primary" @click="rateCard(3)">
              <el-icon><CircleCheck /></el-icon> 记得
            </el-button>
            <el-button type="success" @click="rateCard(5)">
              <el-icon><Star /></el-icon> 非常熟悉
            </el-button>
          </el-space>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { cardApi } from '../services/api'
import { ElMessage } from 'element-plus'

const dueCards = ref([])
const currentCard = ref(null)
const showAnswer = ref(false)

const loadDueCards = async () => {
  try {
    const response = await cardApi.getDueCards()
    dueCards.value = response.data
    if (dueCards.value.length > 0) {
      currentCard.value = dueCards.value[0]
    }
  } catch (error) {
    ElMessage.error('加载待复习卡片失败')
  }
}

const rateCard = async (quality) => {
  if (!currentCard.value) return

  try {
    await cardApi.reviewCard(currentCard.value.id, quality)
    ElMessage.success('复习记录已保存')

    dueCards.value.shift()
    showAnswer.value = false

    if (dueCards.value.length > 0) {
      currentCard.value = dueCards.value[0]
    } else {
      currentCard.value = null
    }
  } catch (error) {
    ElMessage.error('保存复习记录失败')
  }
}

onMounted(() => {
  loadDueCards()
})
</script>

<style scoped>
.review-page {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-cards {
  text-align: center;
  padding: 60px 20px;
}

.no-cards h3 {
  margin: 20px 0 10px;
  color: #606266;
}

.no-cards p {
  color: #909399;
}

.review-card {
  padding: 20px;
}

.card-content {
  min-height: 250px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.card-content:hover {
  border-color: #409EFF;
  background: #f0f9ff;
}

.card-face {
  text-align: center;
  padding: 40px;
}

.card-face h3 {
  color: #909399;
  font-size: 14px;
  margin-bottom: 20px;
}

.card-text {
  font-size: 24px;
  color: #303133;
  line-height: 1.6;
  word-break: break-word;
}

.hint {
  margin-top: 30px;
  color: #c0c4cc;
  font-size: 14px;
}

.rating-buttons {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>
