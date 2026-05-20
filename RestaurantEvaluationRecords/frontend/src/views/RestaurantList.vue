<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">餐厅列表</h1>
      <el-button type="primary" :icon="Plus" @click="openAddDialog">
        添加餐厅
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" v-for="restaurant in restaurants" :key="restaurant.id">
        <el-card class="restaurant-card" shadow="hover" @click="goToDetail(restaurant.id)">
          <template #header>
            <div class="card-header">
              <span class="restaurant-name">{{ restaurant.name }}</span>
              <el-tag size="small">{{ restaurant.cuisineType }}</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="score-section">
              <div class="overall-score">
                <span class="score-value">{{ restaurant.avgOverallScore || '暂无' }}</span>
                <span class="score-label">综合评分</span>
              </div>
              <div class="dimension-scores">
                <div class="score-item">
                  <span class="label">口味</span>
                  <div class="stars">
                    <el-rate v-model="restaurant.avgTasteScore" disabled :max="5" :show-text="false" size="small" />
                    <span class="score">{{ restaurant.avgTasteScore }}</span>
                  </div>
                </div>
                <div class="score-item">
                  <span class="label">环境</span>
                  <div class="stars">
                    <el-rate v-model="restaurant.avgEnvironmentScore" disabled :max="5" :show-text="false" size="small" />
                    <span class="score">{{ restaurant.avgEnvironmentScore }}</span>
                  </div>
                </div>
                <div class="score-item">
                  <span class="label">服务</span>
                  <div class="stars">
                    <el-rate v-model="restaurant.avgServiceScore" disabled :max="5" :show-text="false" size="small" />
                    <span class="score">{{ restaurant.avgServiceScore }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="info-section">
              <p><el-icon><Location /></el-icon> {{ restaurant.address || '暂无地址' }}</p>
              <p><el-icon><Phone /></el-icon> {{ restaurant.phone || '暂无电话' }}</p>
              <p><el-icon><Money /></el-icon> 人均 ¥{{ restaurant.pricePerPerson || '暂无' }}</p>
            </div>
            <div class="footer-section">
              <span class="review-count">{{ restaurant.reviewCount || 0 }} 条评价</span>
              <span class="repurchase-rate">复购率 {{ restaurant.repurchaseRate || 0 }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="restaurants.length === 0" description="暂无餐厅，点击上方按钮添加" />

    <el-dialog v-model="dialogVisible" title="添加餐厅" width="500px">
      <el-form :model="restaurantForm" :rules="restaurantRules" ref="restaurantFormRef" label-width="80px">
        <el-form-item label="餐厅名称" prop="name">
          <el-input v-model="restaurantForm.name" placeholder="请输入餐厅名称" />
        </el-form-item>
        <el-form-item label="菜系类型" prop="cuisineType">
          <el-input v-model="restaurantForm.cuisineType" placeholder="例如：川菜、江浙菜" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="restaurantForm.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="restaurantForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="人均价格" prop="pricePerPerson">
          <el-input-number v-model="restaurantForm.pricePerPerson" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="restaurantForm.description" type="textarea" :rows="3" placeholder="餐厅描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddRestaurant" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getRestaurantList, addRestaurant } from '@/api'

const router = useRouter()

const restaurants = ref([])
const dialogVisible = ref(false)
const restaurantFormRef = ref()
const submitting = ref(false)

const restaurantForm = reactive({
  name: '',
  cuisineType: '',
  address: '',
  phone: '',
  pricePerPerson: null,
  description: ''
})

const restaurantRules = {
  name: [{ required: true, message: '请输入餐厅名称', trigger: 'blur' }]
}

const fetchRestaurants = async () => {
  try {
    const res = await getRestaurantList()
    restaurants.value = res
  } catch (error) {
    console.error('Failed to fetch restaurants:', error)
  }
}

const goToDetail = (id) => {
  router.push(`/restaurant/${id}`)
}

const openAddDialog = () => {
  dialogVisible.value = true
  Object.keys(restaurantForm).forEach(key => {
    restaurantForm[key] = key === 'pricePerPerson' ? null : ''
  })
  restaurantFormRef.value?.resetFields()
}

const handleAddRestaurant = async () => {
  if (!restaurantFormRef.value) return
  await restaurantFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await addRestaurant(restaurantForm)
        ElMessage.success('添加成功')
        dialogVisible.value = false
        fetchRestaurants()
      } catch (error) {
        console.error('Failed to add restaurant:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  fetchRestaurants()
})
</script>

<style scoped lang="scss">
.restaurant-card {
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .restaurant-name {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .card-content {
    .score-section {
      display: flex;
      gap: 20px;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ebeef5;

      .overall-score {
        text-align: center;

        .score-value {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: #f59e0b;
        }

        .score-label {
          font-size: 12px;
          color: #909399;
        }
      }

      .dimension-scores {
        flex: 1;

        .score-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;

          .label {
            width: 30px;
            font-size: 12px;
            color: #606266;
          }

          .stars {
            display: flex;
            align-items: center;
            gap: 6px;

            .score {
              font-size: 12px;
              color: #f59e0b;
              font-weight: 500;
            }
          }
        }
      }
    }

    .info-section {
      margin-bottom: 16px;

      p {
        margin: 6px 0;
        font-size: 13px;
        color: #606266;
        display: flex;
        align-items: center;
        gap: 6px;

        .el-icon {
          color: #909399;
        }
      }
    }

    .footer-section {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #909399;

      .repurchase-rate {
        color: #67c23a;
      }
    }
  }
}
</style>
