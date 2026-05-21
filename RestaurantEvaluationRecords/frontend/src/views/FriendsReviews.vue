<template>
  <div>
    <h2 style="margin-bottom: 20px">好友评价</h2>

    <el-card v-for="review in reviews" :key="review.id" style="margin-bottom: 20px">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px">
        <div style="display: flex; align-items: center">
          <el-avatar :size="45" style="background: #409eff">{{ review.nickname?.charAt(0) || 'U' }}</el-avatar>
          <div style="margin-left: 15px">
            <div style="font-weight: bold; font-size: 16px">{{ review.nickname }}</div>
            <div style="font-size: 12px; color: #999">{{ formatDate(review.createTime) }}</div>
          </div>
        </div>
        <el-tag :type="getRepurchaseType(review.repurchaseWillingness)" size="small">
          {{ getRepurchaseText(review.repurchaseWillingness) }}
        </el-tag>
      </div>

      <div style="padding: 15px; background: #f5f7fa; border-radius: 8px; margin-bottom: 15px; cursor: pointer" @click="goToRestaurant(review.restaurantId)">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <div>
            <el-icon style="color: #409eff"><Shop /></el-icon>
            <span style="font-weight: bold; margin-left: 8px">点击查看餐厅</span>
          </div>
          <el-icon><ArrowRight /></el-icon>
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

      <div v-if="review.content" style="margin-bottom: 10px; line-height: 1.6">
        {{ review.content }}
      </div>

      <div v-if="review.visitDate" style="font-size: 12px; color: #999">
        用餐日期：{{ review.visitDate }}
      </div>
    </el-card>

    <el-empty v-if="reviews.length === 0" description="暂无好友评价" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFriendsReviews } from '../api'

const router = useRouter()

const reviews = ref([])

const currentUser = computed(() => {
  const user = localStorage.getItem('currentUser')
  return user ? JSON.parse(user) : null
})

const loadReviews = async () => {
  if (!currentUser.value) return
  try {
    reviews.value = await getFriendsReviews(currentUser.value.id)
  } catch (error) {
    console.error('加载好友评价失败:', error)
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
