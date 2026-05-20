<template>
  <div class="page-container" v-loading="loading">
    <div v-if="checkin" class="detail-container">
      <el-button type="primary" text @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>

      <el-card class="info-card card-shadow">
        <div class="checkin-header">
          <div>
            <h1>{{ checkin.restaurantName }}</h1>
            <div class="meta">
              <span class="date">{{ checkin.checkinDate }}</span>
              <el-tag type="success">{{ checkin.mealType }}</el-tag>
              <el-rate v-model="checkin.overallRating" disabled show-score text-color="#ff9900" :max="5" />
              <span class="amount" v-if="checkin.totalAmount">消费 ¥{{ checkin.totalAmount }}</span>
            </div>
          </div>
          <el-button type="danger" @click="deleteCheckin">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
        <p class="comment" v-if="checkin.comment">{{ checkin.comment }}</p>
      </el-card>

      <div class="content-row">
        <el-card class="dishes-card card-shadow">
          <template #header>
            <span>菜品评价</span>
          </template>
          <div v-if="checkin.dishes && checkin.dishes.length > 0" class="dish-list">
            <div v-for="dish in checkin.dishes" :key="dish.dishId" class="dish-item">
              <div class="dish-info">
                <span class="dish-name">{{ dish.dishName }}</span>
                <el-rate v-model="dish.rating" disabled show-score text-color="#ff9900" :max="5" size="small" />
              </div>
              <p v-if="dish.comment" class="dish-comment">{{ dish.comment }}</p>
            </div>
          </div>
          <el-empty v-else description="暂无菜品评价" />
        </el-card>

        <el-card class="photos-card card-shadow">
          <template #header>
            <span>照片 ({{ checkin.photos ? checkin.photos.length : 0 }})</span>
          </template>
          <div v-if="checkin.photos && checkin.photos.length > 0" class="photo-grid">
            <div v-for="photo in checkin.photos" :key="photo.id" class="photo-item">
              <img :src="photo.photoUrl" alt="" />
              <p v-if="photo.description" class="photo-desc">{{ photo.description }}</p>
            </div>
          </div>
          <el-empty v-else description="暂无照片" />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { checkinApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const checkin = ref(null)

const loadDetail = async () => {
  loading.value = true
  try {
    checkin.value = await checkinApi.detail(route.params.id)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const deleteCheckin = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这条打卡记录吗？', '提示', {
      type: 'warning'
    })
    await checkinApi.delete(route.params.id)
    ElMessage.success('删除成功')
    router.push('/checkins')
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style lang="scss" scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  .checkin-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    h1 {
      margin: 0 0 12px 0;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;

      .date {
        font-weight: bold;
        color: #606266;
      }

      .amount {
        color: #f56c6c;
        font-weight: bold;
      }
    }
  }

  .comment {
    margin: 16px 0 0 0;
    padding-top: 16px;
    border-top: 1px solid #eee;
    color: #606266;
    line-height: 1.6;
  }
}

.content-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dish-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;

  .dish-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;

    .dish-name {
      font-weight: bold;
    }
  }

  .dish-comment {
    margin: 8px 0 0 0;
    color: #909399;
    font-size: 13px;
  }
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;

  .photo-item {
    img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 6px;
    }

    .photo-desc {
      margin: 6px 0 0 0;
      font-size: 12px;
      color: #909399;
      text-align: center;
    }
  }
}

@media (max-width: 768px) {
  .content-row {
    grid-template-columns: 1fr;
  }
}
</style>
