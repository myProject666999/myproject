<template>
  <div>
    <el-button @click="goBack" style="margin-bottom: 20px">
      <el-icon><ArrowLeft /></el-icon>
      返回列表
    </el-button>

    <el-card v-if="restaurant" style="margin-bottom: 20px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <h2>{{ restaurant.name }}</h2>
          <el-tag type="success">{{ restaurant.cuisineType }}</el-tag>
        </div>
      </template>

      <div style="margin-bottom: 20px">
        <h3 style="margin-bottom: 15px">评分概况</h3>
        <el-row :gutter="20">
          <el-col :span="6">
            <div style="text-align: center; padding: 20px; background: #f5f7fa; border-radius: 8px">
              <div style="font-size: 36px; font-weight: bold; color: #ff9900">{{ restaurant.avgOverallScore }}</div>
              <div style="color: #999">综合评分</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div style="text-align: center; padding: 20px; background: #f5f7fa; border-radius: 8px">
              <div style="font-size: 24px; font-weight: bold; color: #409eff">{{ restaurant.avgTasteScore }}</div>
              <div style="color: #999">口味</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div style="text-align: center; padding: 20px; background: #f5f7fa; border-radius: 8px">
              <div style="font-size: 24px; font-weight: bold; color: #67c23a">{{ restaurant.avgEnvScore }}</div>
              <div style="color: #999">环境</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div style="text-align: center; padding: 20px; background: #f5f7fa; border-radius: 8px">
              <div style="font-size: 24px; font-weight: bold; color: #e6a23c">{{ restaurant.avgServiceScore }}</div>
              <div style="color: #999">服务</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="12">
          <div><strong>地址：</strong>{{ restaurant.address || '暂无' }}</div>
        </el-col>
        <el-col :span="12">
          <div><strong>电话：</strong>{{ restaurant.phone || '暂无' }}</div>
        </el-col>
        <el-col :span="12">
          <div><strong>价格区间：</strong>{{ restaurant.priceRange || '暂无' }}</div>
        </el-col>
        <el-col :span="12">
          <div><strong>评价数量：</strong>{{ restaurant.reviewCount }} 条</div>
        </el-col>
      </el-row>

      <div v-if="recommendedDishes.length > 0" style="margin-bottom: 20px">
        <h3 style="margin-bottom: 10px">推荐菜品</h3>
        <div>
          <el-tag
            v-for="(dish, index) in uniqueDishes"
            :key="index"
            style="margin: 5px"
            type="warning"
            size="large"
          >
            {{ dish }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px">
      <h3>用户评价 ({{ reviews.length }})</h3>
      <el-button type="primary" @click="showReviewDialog = true">
        <el-icon><Edit /></el-icon>
        {{ userReview ? '修改评价' : '写评价' }}
      </el-button>
    </div>

    <el-card v-for="review in reviews" :key="review.id" style="margin-bottom: 15px">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px">
        <div style="display: flex; align-items: center">
          <el-avatar :size="40">{{ review.nickname?.charAt(0) || 'U' }}</el-avatar>
          <div style="margin-left: 12px">
            <div style="font-weight: bold">{{ review.nickname }}</div>
            <div style="font-size: 12px; color: #999">{{ formatDate(review.createTime) }}</div>
          </div>
        </div>
        <el-tag :type="getRepurchaseType(review.repurchaseWillingness)">
          {{ getRepurchaseText(review.repurchaseWillingness) }}
        </el-tag>
      </div>

      <div style="display: flex; gap: 20px; margin-bottom: 10px; font-size: 13px">
        <span>口味: <el-rate v-model="review.tasteScore" disabled :max="5" size="small" /></span>
        <span>环境: <el-rate v-model="review.envScore" disabled :max="5" size="small" /></span>
        <span>服务: <el-rate v-model="review.serviceScore" disabled :max="5" size="small" /></span>
        <span>综合: <strong>{{ review.overallScore }}</strong></span>
      </div>

      <div v-if="review.content" style="margin-bottom: 10px">
        {{ review.content }}
      </div>

      <div v-if="review.visitDate" style="font-size: 12px; color: #999">
        用餐日期：{{ review.visitDate }}
      </div>
    </el-card>

    <el-empty v-if="reviews.length === 0" description="暂无评价" />

    <el-dialog v-model="showReviewDialog" :title="userReview ? '修改评价' : '写评价'" width="600px">
      <el-form :model="reviewForm" label-width="100px">
        <el-form-item label="口味评分">
          <el-rate v-model="reviewForm.tasteScore" :max="5" show-score />
        </el-form-item>
        <el-form-item label="环境评分">
          <el-rate v-model="reviewForm.envScore" :max="5" show-score />
        </el-form-item>
        <el-form-item label="服务评分">
          <el-rate v-model="reviewForm.serviceScore" :max="5" show-score />
        </el-form-item>
        <el-form-item label="复购意愿">
          <el-radio-group v-model="reviewForm.repurchaseWillingness">
            <el-radio :label="1">不会</el-radio>
            <el-radio :label="2">可能会</el-radio>
            <el-radio :label="3">一定会</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input
            v-model="reviewForm.content"
            type="textarea"
            :rows="4"
            placeholder="分享你的用餐体验..."
          />
        </el-form-item>
        <el-form-item label="用餐日期">
          <el-date-picker
            v-model="reviewForm.visitDate"
            type="date"
            placeholder="选择用餐日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="推荐菜品">
          <el-select
            v-model="newDish"
            placeholder="输入菜品名称后回车"
            filterable
            allow-create
            default-first-option
            @change="addDish"
            style="width: 200px; margin-right: 10px"
          />
          <div style="margin-top: 10px">
            <el-tag
              v-for="(dish, index) in reviewForm.recommendedDishes"
              :key="index"
              closable
              style="margin: 5px"
              @close="removeDish(index)"
            >
              {{ dish }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReviewDialog = false">取消</el-button>
        <el-button type="primary" @click="submitReview">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getRestaurantById,
  getReviewsByRestaurant,
  getRecommendedDishesByRestaurant,
  getReviewByUserAndRestaurant,
  createReview,
  updateReview
} from '../api'

const route = useRoute()
const router = useRouter()

const restaurant = ref(null)
const reviews = ref([])
const recommendedDishes = ref([])
const userReview = ref(null)
const showReviewDialog = ref(false)
const newDish = ref('')

const reviewForm = ref({
  tasteScore: 4,
  envScore: 4,
  serviceScore: 4,
  repurchaseWillingness: 2,
  content: '',
  visitDate: '',
  recommendedDishes: []
})

const currentUser = computed(() => {
  const user = localStorage.getItem('currentUser')
  return user ? JSON.parse(user) : null
})

const uniqueDishes = computed(() => {
  const dishes = recommendedDishes.value.map(d => d.dishName)
  return [...new Set(dishes)]
})

const loadRestaurant = async () => {
  try {
    restaurant.value = await getRestaurantById(route.params.id)
  } catch (error) {
    console.error('加载餐厅详情失败:', error)
  }
}

const loadReviews = async () => {
  try {
    reviews.value = await getReviewsByRestaurant(route.params.id)
  } catch (error) {
    console.error('加载评价失败:', error)
  }
}

const loadRecommendedDishes = async () => {
  try {
    recommendedDishes.value = await getRecommendedDishesByRestaurant(route.params.id)
  } catch (error) {
    console.error('加载推荐菜品失败:', error)
  }
}

const loadUserReview = async () => {
  if (!currentUser.value) return
  try {
    userReview.value = await getReviewByUserAndRestaurant(currentUser.value.id, route.params.id)
    if (userReview.value) {
      reviewForm.value = {
        tasteScore: userReview.value.tasteScore,
        envScore: userReview.value.envScore,
        serviceScore: userReview.value.serviceScore,
        repurchaseWillingness: userReview.value.repurchaseWillingness,
        content: userReview.value.content || '',
        visitDate: userReview.value.visitDate || '',
        recommendedDishes: []
      }
    }
  } catch (error) {
    userReview.value = null
  }
}

const addDish = (value) => {
  if (value && !reviewForm.value.recommendedDishes.includes(value)) {
    reviewForm.value.recommendedDishes.push(value)
  }
  newDish.value = ''
}

const removeDish = (index) => {
  reviewForm.value.recommendedDishes.splice(index, 1)
}

const submitReview = async () => {
  try {
    const data = {
      userId: currentUser.value.id,
      restaurantId: route.params.id,
      ...reviewForm.value
    }

    if (userReview.value) {
      await updateReview(userReview.value.id, data)
      ElMessage.success('评价修改成功')
    } else {
      await createReview(data)
      ElMessage.success('评价提交成功')
    }

    showReviewDialog.value = false
    loadRestaurant()
    loadReviews()
    loadRecommendedDishes()
    loadUserReview()
  } catch (error) {
    console.error('提交评价失败:', error)
  }
}

const goBack = () => {
  router.back()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').substring(0, 16)
}

const getRepurchaseText = (value) => {
  const texts = ['不确定', '不会', '可能会', '一定会']
  return texts[value] || '不确定'
}

const getRepurchaseType = (value) => {
  const types = ['info', 'danger', 'warning', 'success']
  return types[value] || 'info'
}

onMounted(() => {
  loadRestaurant()
  loadReviews()
  loadRecommendedDishes()
  loadUserReview()
})
</script>
