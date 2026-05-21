<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px">
      <h2>餐厅列表</h2>
      <div style="display: flex; gap: 10px">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索餐厅"
          style="width: 250px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          添加餐厅
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" v-for="restaurant in restaurants" :key="restaurant.id">
        <el-card
          shadow="hover"
          style="margin-bottom: 20px; cursor: pointer"
          @click="goToDetail(restaurant.id)"
        >
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span style="font-weight: bold; font-size: 16px">{{ restaurant.name }}</span>
              <el-tag type="success" size="small">{{ restaurant.cuisineType }}</el-tag>
            </div>
          </template>
          <div style="margin-bottom: 10px">
            <div style="display: flex; align-items: center; margin-bottom: 8px">
              <span style="margin-right: 10px; color: #999">综合评分</span>
              <el-rate
                v-model="restaurant.avgOverallScore"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
                :max="5"
              />
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666">
              <span>口味: {{ restaurant.avgTasteScore }}</span>
              <span>环境: {{ restaurant.avgEnvScore }}</span>
              <span>服务: {{ restaurant.avgServiceScore }}</span>
            </div>
          </div>
          <div style="font-size: 13px; color: #999; margin-bottom: 8px">
            <el-icon><Location /></el-icon>
            {{ restaurant.address || '暂无地址' }}
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666">
            <span>{{ restaurant.priceRange || '暂无价格' }}</span>
            <span>{{ restaurant.reviewCount }} 条评价</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showAddDialog" title="添加餐厅" width="500px">
      <el-form :model="restaurantForm" label-width="80px">
        <el-form-item label="餐厅名称">
          <el-input v-model="restaurantForm.name" placeholder="请输入餐厅名称" />
        </el-form-item>
        <el-form-item label="菜系类型">
          <el-input v-model="restaurantForm.cuisineType" placeholder="如：火锅、川菜" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="restaurantForm.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="restaurantForm.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="价格区间">
          <el-input v-model="restaurantForm.priceRange" placeholder="如：¥50-100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addRestaurant">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getRestaurants, searchRestaurants, createRestaurant } from '../api'

const router = useRouter()

const restaurants = ref([])
const searchKeyword = ref('')
const showAddDialog = ref(false)
const restaurantForm = ref({
  name: '',
  cuisineType: '',
  address: '',
  phone: '',
  priceRange: ''
})

const loadRestaurants = async () => {
  try {
    restaurants.value = await getRestaurants()
  } catch (error) {
    console.error('加载餐厅列表失败:', error)
  }
}

const handleSearch = async () => {
  if (searchKeyword.value.trim()) {
    restaurants.value = await searchRestaurants(searchKeyword.value)
  } else {
    loadRestaurants()
  }
}

const goToDetail = (id) => {
  router.push(`/restaurant/${id}`)
}

const addRestaurant = async () => {
  if (!restaurantForm.value.name) {
    ElMessage.warning('请输入餐厅名称')
    return
  }
  try {
    await createRestaurant(restaurantForm.value)
    ElMessage.success('添加成功')
    showAddDialog.value = false
    restaurantForm.value = { name: '', cuisineType: '', address: '', phone: '', priceRange: '' }
    loadRestaurants()
  } catch (error) {
    console.error('添加餐厅失败:', error)
  }
}

onMounted(() => {
  loadRestaurants()
})
</script>
