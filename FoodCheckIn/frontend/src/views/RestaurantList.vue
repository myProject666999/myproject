<template>
  <div class="page-container">
    <div class="page-header">
      <h2>餐厅列表</h2>
      <el-button type="primary" @click="showAdd = true">
        <el-icon><Plus /></el-icon>
        新增餐厅
      </el-button>
    </div>

    <el-card class="card-shadow">
      <el-table :data="restaurants" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="餐厅名称" min-width="150" />
        <el-table-column prop="cuisineType" label="菜系" width="100" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="avgPrice" label="人均价格" width="120">
          <template #default="{ row }">
            ¥{{ row.avgPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="overallRating" label="评分" width="180">
          <template #default="{ row }">
            <el-rate v-model="row.overallRating" disabled show-score text-color="#ff9900" :max="5" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="goToDetail(row.id)">查看</el-button>
            <el-button type="primary" link @click="editRestaurant(row)">编辑</el-button>
            <el-button type="danger" link @click="deleteRestaurant(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showAdd" title="新增餐厅" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="餐厅名称">
          <el-input v-model="form.name" placeholder="请输入餐厅名称" />
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="纬度">
          <el-input-number v-model="form.latitude" :precision="6" :step="0.000001" style="width: 100%" />
        </el-form-item>
        <el-form-item label="经度">
          <el-input-number v-model="form.longitude" :precision="6" :step="0.000001" style="width: 100%" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="菜系类型">
          <el-select v-model="form.cuisineType" placeholder="请选择菜系" style="width: 100%">
            <el-option label="川菜" value="川菜" />
            <el-option label="江浙菜" value="江浙菜" />
            <el-option label="粤菜" value="粤菜" />
            <el-option label="湘菜" value="湘菜" />
            <el-option label="西北菜" value="西北菜" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="人均价格">
          <el-input-number v-model="form.avgPrice" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="餐厅描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { restaurantApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const restaurants = ref([])
const loading = ref(false)
const showAdd = ref(false)
const isEdit = ref(false)

const form = ref({
  id: null,
  name: '',
  address: '',
  latitude: 39.9042,
  longitude: 116.4074,
  phone: '',
  cuisineType: '',
  avgPrice: null,
  description: ''
})

const loadRestaurants = async () => {
  loading.value = true
  try {
    restaurants.value = await restaurantApi.list()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/restaurant/${id}`)
}

const editRestaurant = (row) => {
  isEdit.value = true
  form.value = { ...row }
  showAdd.value = true
}

const deleteRestaurant = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除餐厅"${row.name}"吗？`, '提示', {
      type: 'warning'
    })
    await restaurantApi.delete(row.id)
    ElMessage.success('删除成功')
    loadRestaurants()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const save = async () => {
  try {
    if (isEdit.value) {
      await restaurantApi.update(form.value)
      ElMessage.success('更新成功')
    } else {
      await restaurantApi.add(form.value)
      ElMessage.success('添加成功')
    }
    showAdd.value = false
    resetForm()
    loadRestaurants()
  } catch (error) {
    console.error(error)
  }
}

const resetForm = () => {
  form.value = {
    id: null,
    name: '',
    address: '',
    latitude: 39.9042,
    longitude: 116.4074,
    phone: '',
    cuisineType: '',
    avgPrice: null,
    description: ''
  }
  isEdit.value = false
}

onMounted(() => {
  loadRestaurants()
})
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
  }
}
</style>
