<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">我的评价</h1>
    </div>

    <div class="reviews-container">
      <div v-for="review in reviews" :key="review.id" class="review-card card">
        <div class="review-header">
          <div class="review-meta">
            <span class="review-date">{{ formatDate(review.createTime) }}</span>
            <el-tag :type="getRepurchaseTagType(review.repurchaseIntention)">
              {{ review.repurchaseIntentionText }}
            </el-tag>
          </div>
          <div class="review-actions">
            <el-button type="primary" size="small" :icon="Edit" @click="openEditDialog(review)">
              编辑
            </el-button>
            <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(review.id)">
              删除
            </el-button>
          </div>
        </div>

        <div class="restaurant-link" @click="goToRestaurant(review.restaurantId)">
          <el-icon><Shop /></el-icon>
          <span>{{ review.restaurantName }}</span>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </div>

        <div class="review-scores">
          <div class="score-item">
            <span class="label">口味</span>
            <el-rate v-model="review.tasteScore" disabled size="small" />
            <span class="score">{{ review.tasteScore }}</span>
          </div>
          <div class="score-item">
            <span class="label">环境</span>
            <el-rate v-model="review.environmentScore" disabled size="small" />
            <span class="score">{{ review.environmentScore }}</span>
          </div>
          <div class="score-item">
            <span class="label">服务</span>
            <el-rate v-model="review.serviceScore" disabled size="small" />
            <span class="score">{{ review.serviceScore }}</span>
          </div>
          <div class="score-item overall">
            <span class="label">综合</span>
            <span class="overall-score">{{ review.overallScore }}</span>
          </div>
        </div>

        <p v-if="review.content" class="review-content">{{ review.content }}</p>
        
        <p v-if="review.visitDate" class="visit-date">
          <el-icon><Calendar /></el-icon> 用餐日期：{{ formatDate(review.visitDate) }}
        </p>
      </div>

      <el-empty v-if="reviews.length === 0" description="暂无评价，去餐厅页面写下你的第一条评价吧" :image-size="120" />
    </div>

    <el-dialog v-model="editDialogVisible" title="修改评价" width="600px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
        <el-form-item label="口味" prop="tasteScore">
          <el-rate v-model="editForm.tasteScore" :max="5" show-text />
        </el-form-item>
        <el-form-item label="环境" prop="environmentScore">
          <el-rate v-model="editForm.environmentScore" :max="5" show-text />
        </el-form-item>
        <el-form-item label="服务" prop="serviceScore">
          <el-rate v-model="editForm.serviceScore" :max="5" show-text />
        </el-form-item>
        <el-form-item label="复购意愿" prop="repurchaseIntention">
          <el-radio-group v-model="editForm.repurchaseIntention">
            <el-radio :label="1">不想去</el-radio>
            <el-radio :label="2">可能会去</el-radio>
            <el-radio :label="3">一定会去</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="评价内容" prop="content">
          <el-input v-model="editForm.content" type="textarea" :rows="4" placeholder="分享您的用餐体验..." />
        </el-form-item>
        <el-form-item label="用餐日期" prop="visitDate">
          <el-date-picker v-model="editForm.visitDate" type="date" placeholder="选择日期" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateReview" :loading="submitting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyReviews, updateReview, deleteReview } from '@/api'

const router = useRouter()

const reviews = ref([])
const editDialogVisible = ref(false)
const editFormRef = ref()
const submitting = ref(false)
const currentReviewId = ref(null)

const editForm = reactive({
  tasteScore: 5,
  environmentScore: 5,
  serviceScore: 5,
  repurchaseIntention: 2,
  content: '',
  visitDate: null
})

const editRules = {
  tasteScore: [{ required: true, message: '请给口味评分', trigger: 'change' }],
  environmentScore: [{ required: true, message: '请给环境评分', trigger: 'change' }],
  serviceScore: [{ required: true, message: '请给服务评分', trigger: 'change' }],
  repurchaseIntention: [{ required: true, message: '请选择复购意愿', trigger: 'change' }]
}

const fetchReviews = async () => {
  try {
    const res = await getMyReviews()
    reviews.value = res
  } catch (error) {
    console.error('Failed to fetch my reviews:', error)
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const getRepurchaseTagType = (intention) => {
  switch (intention) {
    case 1: return 'danger'
    case 2: return 'warning'
    case 3: return 'success'
    default: return 'info'
  }
}

const goToRestaurant = (id) => {
  router.push(`/restaurant/${id}`)
}

const openEditDialog = (review) => {
  currentReviewId.value = review.id
  Object.assign(editForm, {
    tasteScore: review.tasteScore,
    environmentScore: review.environmentScore,
    serviceScore: review.serviceScore,
    repurchaseIntention: review.repurchaseIntention,
    content: review.content || '',
    visitDate: review.visitDate || null
  })
  editDialogVisible.value = true
}

const handleUpdateReview = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await updateReview(currentReviewId.value, {
          ...editForm,
          restaurantId: reviews.value.find(r => r.id === currentReviewId.value)?.restaurantId
        })
        ElMessage.success('评价修改成功')
        editDialogVisible.value = false
        fetchReviews()
      } catch (error) {
        console.error('Failed to update review:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除这条评价吗？', '确认删除', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await deleteReview(id)
      ElMessage.success('删除成功')
      fetchReviews()
    } catch (error) {
      console.error('Failed to delete review:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchReviews()
})
</script>

<style scoped lang="scss">
.reviews-container {
  .review-card {
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .review-meta {
        display: flex;
        align-items: center;
        gap: 12px;

        .review-date {
          font-size: 13px;
          color: #909399;
        }
      }
    }

    .restaurant-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #ecf5ff;
      border-radius: 8px;
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.2s;
      color: #409eff;
      font-weight: 500;

      &:hover {
        background: #d9ecff;
      }

      .arrow {
        margin-left: auto;
      }
    }

    .review-scores {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 16px;

      .score-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .label {
          font-size: 13px;
          color: #606266;
          width: 36px;
        }

        .score {
          font-weight: 600;
          color: #f59e0b;
          font-size: 14px;
        }

        &.overall {
          padding-left: 16px;
          border-left: 2px solid #ebeef5;

          .label {
            width: auto;
            font-weight: 600;
            color: #303133;
          }

          .overall-score {
            font-size: 20px;
            font-weight: 700;
            color: #f59e0b;
          }
        }
      }
    }

    .review-content {
      margin: 0 0 12px;
      color: #606266;
      line-height: 1.8;
      font-size: 14px;
    }

    .visit-date {
      margin: 0;
      font-size: 12px;
      color: #909399;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}
</style>
