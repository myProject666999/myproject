<template>
  <div class="review-list-page">
    <div class="card">
      <div class="card-title">复盘记录</div>
      <el-timeline>
        <el-timeline-item
          v-for="item in reviews"
          :key="item.id"
          :timestamp="item.reviewDate"
          placement="top"
        >
          <el-card shadow="hover" class="review-card">
            <div class="review-header">
              <h4>{{ item.title }}</h4>
              <el-tag size="small" type="info" @click="goToTarget(item.targetId)">
                关联目标
              </el-tag>
            </div>
            <div class="progress-change">
              <span class="label">进度变化:</span>
              <el-tag type="warning" size="small">{{ item.progressBefore }}%</el-tag>
              <el-icon class="arrow"><ArrowRight /></el-icon>
              <el-tag type="success" size="small">{{ item.progressAfter }}%</el-tag>
            </div>
            <div class="review-content" v-if="item.content">
              <div class="section-title">复盘内容</div>
              <p>{{ item.content }}</p>
            </div>
            <div class="review-content" v-if="item.problems">
              <div class="section-title">遇到问题</div>
              <p>{{ item.problems }}</p>
            </div>
            <div class="review-content" v-if="item.solutions">
              <div class="section-title">解决方案</div>
              <p>{{ item.solutions }}</p>
            </div>
            <div class="review-content" v-if="item.nextSteps">
              <div class="section-title">下一步计划</div>
              <p>{{ item.nextSteps }}</p>
            </div>
          </el-card>
        </el-timeline-item>
        <el-empty v-if="reviews.length === 0" description="暂无复盘记录" />
      </el-timeline>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { getReviewList } from '@/api/target'

const router = useRouter()
const reviews = ref([])

const goToTarget = (targetId) => {
  router.push(`/target/${targetId}`)
}

const loadData = async () => {
  try {
    reviews.value = await getReviewList()
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.review-list-page {
  min-height: 100%;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.review-card {
  margin-bottom: 16px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-header h4 {
  margin: 0;
  font-size: 15px;
  color: #303133;
}

.progress-change {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.progress-change .label {
  color: #606266;
  font-size: 13px;
}

.arrow {
  color: #909399;
  font-size: 12px;
}

.review-content {
  margin-top: 10px;
}

.section-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.review-content p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}
</style>
