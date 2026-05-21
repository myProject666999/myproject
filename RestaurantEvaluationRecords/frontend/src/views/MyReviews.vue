<template>
  <div>
    <h2 style="margin-bottom: 20px">我的评价</h2>

    <el-card v-for="review in reviews" :key="review.id" style="margin-bottom: 20px">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px">
        <div>
          <div style="font-weight: bold; font-size: 16px; cursor: pointer; color: #409eff" @click="goToRestaurant(review.restaurantId)">
            <el-icon><Shop /></el-icon>
            查看餐厅
          </div>
          <div style="font-size: 12px; color: #999; margin-top: 5px">{{ formatDate(review.createTime) }}</div>
        </div>
        <div>
          <el-button type="danger" size="small" @click="deleteReview(review.id)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>

      <div style="display: flex; gap: 25px; margin-bottom: 15px">
        <div style="text-align: center">
          <div style="font-size: 20px; font-weight: bold; color: #ff9900">{{ review.overallScore }}</div>
          <div style="font-size: 12px; color: #999">综合</div>
        </div>
        <div>
          <el-rate v-model="review.tasteScore" disabled :max="5" size="small" />
          <div style="font-size: 12px; color: #999">口味</div>
        </div>
        <div>
          <el-rate v-model="review.envScore" disabled :max="5" size="small" />
          <div style="font-size: 12px; color: #999">环境</div>
        </div>
        <div>
          <el-rate v-model="review.serviceScore" disabled :max="5" size="small" />
          <div style="font-size: 12px; color: #999">服务</div>
        </div>
      </div>

      <div style="margin-bottom: 10px">
        <el-tag :type="getRepurchaseType(review.repurchaseWillingness)" size="small">
          复购意愿：{{ getRepurchaseText(review.repurchaseWillingness) }}
        </el-tag>
      </div>

      <div v-if="review.content" style="margin-bottom: 10px; line-height: 1.6">
        {{ review.content }}
      </div>

      <div v-if="review.visitDate" style="font-size: 12px; color: #999">
        用餐日期：{{ review.visitDate }}
      </div>
    </el-card>

    <el-empty v-if="reviews.length === 0" description="暂无评价" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getReviewsByUser, deleteReview as deleteReviewApi } from '../api'

const router = useRouter()

const reviews = ref([])

const currentUser = computed(() => {
  const user = localStorage.getItem('currentUser')
  return user ? JSON.parse(user) : null
})

const loadReviews = async () => {
  if (!currentUser.value) return
  try {
    reviews.value = await getReviewsByUser(currentUser.value.id)
  } catch (error) {
    console.error('加载我的评价失败:', error)
  }
}

const deleteReview = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评价吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteReviewApi(id)
    ElMessage.success('删除成功')
    loadReviews()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评价失败:', error)
    }
  }
}

const goToRestaurant = (id) => {
  router.push(`/restaurant/${id}`)
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
  loadReviews()
})
</script>
