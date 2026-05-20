<template>
  <div class="page-container" v-loading="loading">
    <div v-if="restaurant" class="detail-container">
      <el-button type="primary" text @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>

      <el-card class="info-card card-shadow">
        <div class="restaurant-header">
          <div>
            <h1>{{ restaurant.name }}</h1>
            <div class="meta">
              <el-tag>{{ restaurant.cuisineType }}</el-tag>
              <span class="price">人均 ¥{{ restaurant.avgPrice }}</span>
              <el-rate v-model="restaurant.overallRating" disabled show-score text-color="#ff9900" :max="5" />
              <span class="checkin-count">{{ restaurant.checkinCount }} 次打卡</span>
            </div>
          </div>
          <div class="actions">
            <el-button type="primary" @click="goToCheckin">
              <el-icon><EditPen /></el-icon>
              去打卡
            </el-button>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <el-icon><Location /></el-icon>
            <span>{{ restaurant.address }}</span>
          </div>
          <div class="info-item" v-if="restaurant.phone">
            <el-icon><Phone /></el-icon>
            <span>{{ restaurant.phone }}</span>
          </div>
          <div class="info-item" v-if="restaurant.latitude && restaurant.longitude">
            <el-icon><Position /></el-icon>
            <span>{{ restaurant.latitude }}, {{ restaurant.longitude }}</span>
          </div>
        </div>
        <p class="description" v-if="restaurant.description">{{ restaurant.description }}</p>
      </el-card>

      <div class="content-row">
        <el-card class="dishes-card card-shadow">
          <template #header>
            <div class="card-header">
              <span>菜品列表</span>
              <el-button type="primary" size="small" @click="showAddDish = true">
                <el-icon><Plus /></el-icon>
                添加菜品
              </el-button>
            </div>
          </template>
          <div v-if="restaurant.dishes && restaurant.dishes.length > 0" class="dish-list">
            <div v-for="dish in restaurant.dishes" :key="dish.id" class="dish-item">
              <div class="dish-info">
                <div class="dish-name">{{ dish.name }}</div>
                <div class="dish-price">¥{{ dish.price }}</div>
                <el-rate v-model="dish.avgRating" disabled show-score text-color="#ff9900" :max="5" size="small" />
                <div class="dish-desc" v-if="dish.description">{{ dish.description }}</div>
              </div>
              <div class="dish-actions">
                <el-button type="danger" link size="small" @click="deleteDish(dish)">删除</el-button>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无菜品" />
        </el-card>

        <el-card class="checkins-card card-shadow">
          <template #header>
            <span>最近打卡</span>
          </template>
          <div v-if="restaurant.recentCheckins && restaurant.recentCheckins.length > 0" class="checkin-list">
            <div v-for="checkin in restaurant.recentCheckins" :key="checkin.id" class="checkin-item" @click="goToCheckinDetail(checkin.id)">
              <div class="checkin-photo" v-if="checkin.photoUrl">
                <img :src="checkin.photoUrl" alt="" />
              </div>
              <div class="checkin-photo placeholder" v-else>
                <el-icon><Picture /></el-icon>
              </div>
              <div class="checkin-info">
                <div class="checkin-date">{{ checkin.checkinDate }} · {{ checkin.mealType }}</div>
                <el-rate v-model="checkin.overallRating" disabled :max="5" size="small" />
                <div class="checkin-comment">{{ checkin.comment }}</div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无打卡记录" />
        </el-card>
      </div>
    </div>

    <el-dialog v-model="showAddDish" title="添加菜品" width="500px">
      <el-form :model="dishForm" label-width="80px">
        <el-form-item label="菜品名称">
          <el-input v-model="dishForm.name" placeholder="请输入菜品名称" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="dishForm.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="dishForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDish = false">取消</el-button>
        <el-button type="primary" @click="saveDish">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { restaurantApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const restaurant = ref(null)
const showAddDish = ref(false)
const dishForm = ref({
  restaurantId: null,
  name: '',
  price: null,
  description: ''
})

const loadDetail = async () => {
  loading.value = true
  try {
    restaurant.value = await restaurantApi.detail(route.params.id)
    dishForm.value.restaurantId = restaurant.value.id
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const goToCheckin = () => {
  router.push({ path: '/checkin', query: { restaurantId: restaurant.value.id } })
}

const goToCheckinDetail = (id) => {
  router.push(`/checkin/${id}`)
}

const saveDish = async () => {
  try {
    await restaurantApi.addDish(dishForm.value)
    ElMessage.success('添加成功')
    showAddDish.value = false
    dishForm.value = {
      restaurantId: restaurant.value.id,
      name: '',
      price: null,
      description: ''
    }
    loadDetail()
  } catch (error) {
    console.error(error)
  }
}

const deleteDish = async (dish) => {
  try {
    await ElMessageBox.confirm(`确定要删除菜品"${dish.name}"吗？`, '提示', {
      type: 'warning'
    })
    await restaurantApi.deleteDish(dish.id)
    ElMessage.success('删除成功')
    loadDetail()
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
  .restaurant-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;

    h1 {
      margin: 0 0 12px 0;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;

      .price {
        color: #f56c6c;
        font-weight: bold;
      }

      .checkin-count {
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;
    margin-bottom: 16px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #606266;

      .el-icon {
        color: #409eff;
      }
    }
  }

  .description {
    color: #606266;
    line-height: 1.6;
    margin: 0;
    padding-top: 16px;
    border-top: 1px solid #eee;
  }
}

.content-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .dish-info {
    flex: 1;

    .dish-name {
      font-weight: bold;
      margin-bottom: 4px;
    }

    .dish-price {
      color: #f56c6c;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .dish-desc {
      color: #909399;
      font-size: 12px;
      margin-top: 4px;
    }
  }
}

.checkin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkin-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ecf5ff;
  }

  .checkin-photo {
    width: 80px;
    height: 80px;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &.placeholder {
      background: #e4e7ed;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #909399;
      font-size: 32px;
    }
  }

  .checkin-info {
    flex: 1;
    min-width: 0;

    .checkin-date {
      font-size: 12px;
      color: #909399;
      margin-bottom: 4px;
    }

    .checkin-comment {
      margin-top: 4px;
      color: #606266;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
}

@media (max-width: 768px) {
  .content-row {
    grid-template-columns: 1fr;
  }
}
</style>
