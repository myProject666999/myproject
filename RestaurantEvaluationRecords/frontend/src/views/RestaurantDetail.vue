<template>
  <div class="container">
    <div class="detail-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <el-button v-if="isOwner" type="danger" :icon="Delete" @click="handleDelete">删除餐厅</el-button>
    </div>

    <div v-if="restaurant" class="detail-content">
      <div class="restaurant-info card">
        <div class="info-header">
          <h1 class="restaurant-name">{{ restaurant.name }}</h1>
          <el-tag size="large" type="success">{{ restaurant.cuisineType }}</el-tag>
        </div>

        <div class="score-overview">
          <div class="score-main">
            <span class="score-value">{{ restaurant.avgOverallScore || '暂无' }}</span>
            <div class="score-label">
              <el-rate v-model="restaurant.avgOverallScore" disabled :max="5" size="large" />
              <span>{{ restaurant.reviewCount || 0 }} 条评价</span>
            </div>
          </div>
          <div class="score-detail">
            <div class="score-item">
              <span class="label">口味</span>
              <el-progress :percentage="(restaurant.avgTasteScore || 0) * 20" :color="'#f59e0b'" />
              <span class="value">{{ restaurant.avgTasteScore }}</span>
            </div>
            <div class="score-item">
              <span class="label">环境</span>
              <el-progress :percentage="(restaurant.avgEnvironmentScore || 0) * 20" :color="'#409eff'" />
              <span class="value">{{ restaurant.avgEnvironmentScore }}</span>
            </div>
            <div class="score-item">
              <span class="label">服务</span>
              <el-progress :percentage="(restaurant.avgServiceScore || 0) * 20" :color="'#67c23a'" />
              <span class="value">{{ restaurant.avgServiceScore }}</span>
            </div>
          </div>
          <div class="repurchase-info">
            <span class="repurchase-rate">复购率 {{ restaurant.repurchaseRate || 0 }}%</span>
          </div>
        </div>

        <div class="info-detail">
          <p><el-icon><Location /></el-icon> {{ restaurant.address || '暂无地址' }}</p>
          <p><el-icon><Phone /></el-icon> {{ restaurant.phone || '暂无电话' }}</p>
          <p><el-icon><Money /></el-icon> 人均 ¥{{ restaurant.pricePerPerson || '暂无' }}</p>
          <p v-if="restaurant.description"><el-icon><Document /></el-icon> {{ restaurant.description }}</p>
        </div>
      </div>

      <div class="recommended-dishes card">
        <div class="section-header">
          <h3><el-icon><Dish /></el-icon> 推荐菜</h3>
          <el-button type="primary" size="small" :icon="Plus" @click="openDishDialog">添加推荐菜</el-button>
        </div>
        <div class="dish-list">
          <el-tag v-for="dish in restaurant.recommendedDishes" :key="dish.id" type="warning" size="large" class="dish-tag">
            <span class="dish-name">{{ dish.dishName }}</span>
            <span class="dish-desc" v-if="dish.description">- {{ dish.description }}</span>
            <span class="dish-count">{{ dish.recommendCount }}人推荐</span>
          </el-tag>
          <el-empty v-if="!restaurant.recommendedDishes?.length" description="暂无推荐菜" :image-size="80" />
        </div>
      </div>

      <div class="reviews-section card">
        <div class="section-header">
          <h3><el-icon><ChatDotRound /></el-icon> 用户评价</h3>
          <el-button type="primary" size="small" :icon="Edit" @click="openReviewDialog">
            {{ hasReviewed ? '修改评价' : '写评价' }}
          </el-button>
        </div>

        <div class="review-list">
          <div v-for="review in restaurant.reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <el-avatar :size="40" :icon="UserFilled" />
              <div class="reviewer-info">
                <span class="reviewer-name">{{ review.userName }}</span>
                <span class="review-date">{{ formatDate(review.createTime) }}</span>
              </div>
              <el-tag :type="getRepurchaseTagType(review.repurchaseIntention)">
                {{ review.repurchaseIntentionText }}
              </el-tag>
            </div>
            <div class="review-scores">
              <div class="score-row">
                <span>口味：</span>
                <el-rate v-model="review.tasteScore" disabled size="small" />
                <span class="score-num">{{ review.tasteScore }}</span>
              </div>
              <div class="score-row">
                <span>环境：</span>
                <el-rate v-model="review.environmentScore" disabled size="small" />
                <span class="score-num">{{ review.environmentScore }}</span>
              </div>
              <div class="score-row">
                <span>服务：</span>
                <el-rate v-model="review.serviceScore" disabled size="small" />
                <span class="score-num">{{ review.serviceScore }}</span>
              </div>
              <div class="score-row overall">
                <span>综合：</span>
                <span class="overall-score">{{ review.overallScore }}</span>
              </div>
            </div>
            <p v-if="review.content" class="review-content">{{ review.content }}</p>
            <p v-if="review.visitDate" class="visit-date">
              <el-icon><Calendar /></el-icon> 用餐日期：{{ formatDate(review.visitDate) }}
            </p>
          </div>
          <el-empty v-if="!restaurant.reviews?.length" description="暂无评价" :image-size="80" />
        </div>
      </div>
    </div>

    <el-dialog v-model="reviewDialogVisible" :title="hasReviewed ? '修改评价' : '写评价'" width="600px">
      <el-form :model="reviewForm" :rules="reviewRules" ref="reviewFormRef" label-width="80px">
        <el-form-item label="口味" prop="tasteScore">
          <el-rate v-model="reviewForm.tasteScore" :max="5" show-text />
        </el-form-item>
        <el-form-item label="环境" prop="environmentScore">
          <el-rate v-model="reviewForm.environmentScore" :max="5" show-text />
        </el-form-item>
        <el-form-item label="服务" prop="serviceScore">
          <el-rate v-model="reviewForm.serviceScore" :max="5" show-text />
        </el-form-item>
        <el-form-item label="复购意愿" prop="repurchaseIntention">
          <el-radio-group v-model="reviewForm.repurchaseIntention">
            <el-radio :label="1">不想去</el-radio>
            <el-radio :label="2">可能会去</el-radio>
            <el-radio :label="3">一定会去</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="评价内容" prop="content">
          <el-input v-model="reviewForm.content" type="textarea" :rows="4" placeholder="分享您的用餐体验..." />
        </el-form-item>
        <el-form-item label="用餐日期" prop="visitDate">
          <el-date-picker v-model="reviewForm.visitDate" type="date" placeholder="选择日期" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitReview" :loading="submitting">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dishDialogVisible" title="添加推荐菜" width="400px">
      <el-form :model="dishForm" :rules="dishRules" ref="dishFormRef" label-width="80px">
        <el-form-item label="菜品名称" prop="dishName">
          <el-input v-model="dishForm.dishName" placeholder="请输入菜品名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dishForm.description" type="textarea" :rows="2" placeholder="菜品描述（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dishDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddDish" :loading="submitting">推荐</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { 
  getRestaurantDetail, addReview, updateReview, deleteReview,
  addRecommendedDish, deleteRestaurant 
} from '@/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const restaurant = ref(null)
const reviewDialogVisible = ref(false)
const dishDialogVisible = ref(false)
const reviewFormRef = ref()
const dishFormRef = ref()
const submitting = ref(false)
const myReviewId = ref(null)

const restaurantId = computed(() => Number(route.params.id))

const isOwner = computed(() => {
  return userStore.userInfo?.id === restaurant.value?.createUserId
})

const hasReviewed = computed(() => {
  if (!restaurant.value?.reviews) return false
  return restaurant.value.reviews.some(r => r.userId === userStore.userInfo?.id)
})

const reviewForm = reactive({
  restaurantId: restaurantId.value,
  tasteScore: 5,
  environmentScore: 5,
  serviceScore: 5,
  repurchaseIntention: 2,
  content: '',
  visitDate: null
})

const dishForm = reactive({
  restaurantId: restaurantId.value,
  dishName: '',
  description: ''
})

const reviewRules = {
  tasteScore: [{ required: true, message: '请给口味评分', trigger: 'change' }],
  environmentScore: [{ required: true, message: '请给环境评分', trigger: 'change' }],
  serviceScore: [{ required: true, message: '请给服务评分', trigger: 'change' }],
  repurchaseIntention: [{ required: true, message: '请选择复购意愿', trigger: 'change' }]
}

const dishRules = {
  dishName: [{ required: true, message: '请输入菜品名称', trigger: 'blur' }]
}

const fetchRestaurantDetail = async () => {
  try {
    const res = await getRestaurantDetail(restaurantId.value)
    restaurant.value = res
    const myReview = res.reviews?.find(r => r.userId === userStore.userInfo?.id)
    if (myReview) {
      myReviewId.value = myReview.id
    }
  } catch (error) {
    console.error('Failed to fetch restaurant detail:', error)
  }
}

const goBack = () => {
  router.back()
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN')
}

const getRepurchaseTagType = (intention) => {
  switch (intention) {
    case 1: return 'danger'
    case 2: return 'warning'
    case 3: return 'success'
    default: return 'info'
  }
}

const openReviewDialog = () => {
  if (hasReviewed.value && myReviewId.value) {
    const myReview = restaurant.value.reviews.find(r => r.id === myReviewId.value)
    if (myReview) {
      Object.assign(reviewForm, {
        tasteScore: myReview.tasteScore,
        environmentScore: myReview.environmentScore,
        serviceScore: myReview.serviceScore,
        repurchaseIntention: myReview.repurchaseIntention,
        content: myReview.content || '',
        visitDate: myReview.visitDate || null
      })
    }
  } else {
    Object.assign(reviewForm, {
      tasteScore: 5,
      environmentScore: 5,
      serviceScore: 5,
      repurchaseIntention: 2,
      content: '',
      visitDate: null
    })
  }
  reviewDialogVisible.value = true
}

const handleSubmitReview = async () => {
  if (!reviewFormRef.value) return
  await reviewFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (hasReviewed.value && myReviewId.value) {
          await updateReview(myReviewId.value, reviewForm)
          ElMessage.success('评价修改成功')
        } else {
          await addReview(reviewForm)
          ElMessage.success('评价提交成功')
        }
        reviewDialogVisible.value = false
        fetchRestaurantDetail()
      } catch (error) {
        console.error('Failed to submit review:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

const openDishDialog = () => {
  dishForm.dishName = ''
  dishForm.description = ''
  dishFormRef.value?.resetFields()
  dishDialogVisible.value = true
}

const handleAddDish = async () => {
  if (!dishFormRef.value) return
  await dishFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await addRecommendedDish(dishForm)
        ElMessage.success('推荐成功')
        dishDialogVisible.value = false
        fetchRestaurantDetail()
      } catch (error) {
        console.error('Failed to add dish:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDelete = () => {
  ElMessageBox.confirm('确定要删除这家餐厅吗？此操作不可恢复。', '确认删除', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await deleteRestaurant(restaurantId.value)
      ElMessage.success('删除成功')
      router.push('/restaurants')
    } catch (error) {
      console.error('Failed to delete restaurant:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchRestaurantDetail()
})
</script>

<style scoped lang="scss">
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.restaurant-info {
  .info-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;

    .restaurant-name {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #303133;
    }
  }

  .score-overview {
    display: flex;
    gap: 40px;
    padding: 24px;
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-radius: 12px;
    margin-bottom: 24px;

    .score-main {
      text-align: center;

      .score-value {
        display: block;
        font-size: 48px;
        font-weight: 700;
        color: #f59e0b;
        line-height: 1;
      }

      .score-label {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #606266;
      }
    }

    .score-detail {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .score-item {
        display: flex;
        align-items: center;
        gap: 12px;

        .label {
          width: 40px;
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }

        .el-progress {
          flex: 1;
        }

        .value {
          width: 36px;
          text-align: right;
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }
      }
    }

    .repurchase-info {
      display: flex;
      align-items: center;

      .repurchase-rate {
        padding: 8px 16px;
        background: #67c23a;
        color: #fff;
        border-radius: 20px;
        font-weight: 600;
        font-size: 14px;
      }
    }
  }

  .info-detail {
    p {
      margin: 10px 0;
      font-size: 14px;
      color: #606266;
      display: flex;
      align-items: center;
      gap: 8px;

      .el-icon {
        color: #909399;
      }
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      color: #409eff;
    }
  }
}

.recommended-dishes {
  .dish-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .dish-tag {
    padding: 12px 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    height: auto;
    line-height: 1.4;

    .dish-name {
      font-weight: 600;
      font-size: 14px;
    }

    .dish-desc {
      font-size: 12px;
      opacity: 0.85;
    }

    .dish-count {
      font-size: 11px;
      background: rgba(0, 0, 0, 0.1);
      padding: 2px 8px;
      border-radius: 10px;
      margin-top: 4px;
    }
  }
}

.reviews-section {
  .review-list {
    .review-item {
      padding: 20px 0;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .review-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        .reviewer-info {
          flex: 1;
          display: flex;
          flex-direction: column;

          .reviewer-name {
            font-weight: 600;
            color: #303133;
          }

          .review-date {
            font-size: 12px;
            color: #909399;
          }
        }
      }

      .review-scores {
        background: #f5f7fa;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 12px;

        .score-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }

          &.overall {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #ebeef5;

            .overall-score {
              font-size: 20px;
              font-weight: 700;
              color: #f59e0b;
            }
          }

          .score-num {
            font-weight: 600;
            color: #f59e0b;
          }
        }
      }

      .review-content {
        margin: 12px 0;
        color: #606266;
        line-height: 1.6;
      }

      .visit-date {
        font-size: 12px;
        color: #909399;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}
</style>
