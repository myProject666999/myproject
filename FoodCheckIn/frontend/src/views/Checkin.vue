<template>
  <div class="page-container">
    <el-button type="primary" text @click="$router.back()">
      <el-icon><ArrowLeft /></el-icon>
      返回
    </el-button>

    <el-card class="card-shadow checkin-card">
      <template #header>
        <h2>美食打卡</h2>
      </template>

      <el-form :model="form" label-width="100px">
        <el-form-item label="选择餐厅" required>
          <el-select 
            v-model="form.restaurantId" 
            placeholder="请选择餐厅" 
            style="width: 100%"
            filterable
            @change="onRestaurantChange"
          >
            <el-option 
              v-for="r in restaurants" 
              :key="r.id" 
              :label="r.name" 
              :value="r.id" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="打卡日期" required>
          <el-date-picker 
            v-model="form.checkinDate" 
            type="date" 
            placeholder="选择日期" 
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="餐次">
          <el-select v-model="form.mealType" placeholder="请选择餐次" style="width: 100%">
            <el-option label="早餐" value="早餐" />
            <el-option label="午餐" value="午餐" />
            <el-option label="晚餐" value="晚餐" />
            <el-option label="夜宵" value="夜宵" />
          </el-select>
        </el-form-item>

        <el-form-item label="消费金额">
          <el-input-number 
            v-model="form.totalAmount" 
            :min="0" 
            :precision="2" 
            style="width: 100%"
            placeholder="请输入消费金额"
          />
        </el-form-item>

        <el-form-item label="整体评分" required>
          <el-rate v-model="form.overallRating" :max="5" show-score text-color="#ff9900" />
        </el-form-item>

        <el-form-item label="评价">
          <el-input 
            v-model="form.comment" 
            type="textarea" 
            :rows="3" 
            placeholder="写下你的用餐体验..."
          />
        </el-form-item>

        <el-divider>菜品评分</el-divider>

        <div v-if="dishes.length > 0" class="dish-rating-section">
          <div v-for="dish in dishes" :key="dish.id" class="dish-rating-item">
            <div class="dish-info">
              <span class="dish-name">{{ dish.name }}</span>
              <span class="dish-price">¥{{ dish.price }}</span>
            </div>
            <div class="dish-rating">
              <el-rate 
                v-model="dish.rating" 
                :max="5" 
                show-score 
                text-color="#ff9900"
                @change="onDishRatingChange(dish)"
              />
              <el-input 
                v-model="dish.comment" 
                placeholder="评价一下这道菜..." 
                size="small"
                style="margin-left: 12px; width: 200px;"
              />
            </div>
          </div>
        </div>
        <el-empty v-else description="请先选择餐厅以显示菜品" />

        <el-divider>照片上传</el-divider>

        <div class="photo-section">
          <div class="photo-list">
            <div v-for="(photo, index) in form.photos" :key="index" class="photo-item">
              <img :src="photo.photoUrl" alt="" />
              <div class="photo-actions">
                <el-button type="danger" size="small" circle @click="removePhoto(index)">
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
              <el-input 
                v-model="photo.description" 
                placeholder="照片描述" 
                size="small"
                class="photo-desc"
              />
            </div>
            <div class="add-photo" @click="addPhoto">
              <el-icon><Plus /></el-icon>
              <span>添加照片</span>
            </div>
          </div>
        </div>

        <el-form-item style="margin-top: 24px;">
          <el-button type="primary" size="large" @click="submitCheckin" :loading="submitting">
            <el-icon><Check /></el-icon>
            提交打卡
          </el-button>
          <el-button size="large" @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { restaurantApi, checkinApi } from '@/api'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const restaurants = ref([])
const dishes = ref([])
const submitting = ref(false)

const form = reactive({
  restaurantId: null,
  checkinDate: dayjs().format('YYYY-MM-DD'),
  mealType: '',
  totalAmount: null,
  overallRating: 0,
  comment: '',
  photos: []
})

const loadRestaurants = async () => {
  try {
    restaurants.value = await restaurantApi.list()
    if (route.query.restaurantId) {
      form.restaurantId = Number(route.query.restaurantId)
      onRestaurantChange(form.restaurantId)
    }
  } catch (error) {
    console.error(error)
  }
}

const onRestaurantChange = async (restaurantId) => {
  try {
    const dishList = await restaurantApi.getDishes(restaurantId)
    dishes.value = dishList.map(d => ({
      ...d,
      rating: 0,
      comment: ''
    }))
  } catch (error) {
    console.error(error)
  }
}

const onDishRatingChange = (dish) => {
}

const addPhoto = () => {
  const sampleImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=200&fit=crop'
  ]
  form.photos.push({
    dishId: null,
    photoUrl: sampleImages[form.photos.length % sampleImages.length],
    description: ''
  })
}

const removePhoto = (index) => {
  form.photos.splice(index, 1)
}

const submitCheckin = async () => {
  if (!form.restaurantId) {
    ElMessage.error('请选择餐厅')
    return
  }
  if (!form.checkinDate) {
    ElMessage.error('请选择打卡日期')
    return
  }
  if (!form.overallRating) {
    ElMessage.error('请给整体评分')
    return
  }

  submitting.value = true
  try {
    const ratedDishes = dishes.value
      .filter(d => d.rating > 0)
      .map(d => ({
        dishId: d.id,
        rating: d.rating,
        comment: d.comment
      }))

    const requestData = {
      ...form,
      dishes: ratedDishes
    }

    await checkinApi.create(requestData)
    ElMessage.success('打卡成功！')
    router.push('/checkins')
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadRestaurants()
})
</script>

<style lang="scss" scoped>
.checkin-card {
  max-width: 900px;
  margin: 0 auto;
}

.dish-rating-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dish-rating-item {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 6px;

  .dish-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .dish-name {
      font-weight: bold;
    }

    .dish-price {
      color: #f56c6c;
      font-weight: bold;
    }
  }

  .dish-rating {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.photo-section {
  .photo-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .photo-item {
    width: 180px;
    position: relative;

    img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 6px;
    }

    .photo-actions {
      position: absolute;
      top: 4px;
      right: 4px;
    }

    .photo-desc {
      margin-top: 8px;
    }
  }

  .add-photo {
    width: 180px;
    height: 120px;
    border: 2px dashed #dcdfe6;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }

    .el-icon {
      font-size: 32px;
      margin-bottom: 4px;
    }
  }
}
</style>
