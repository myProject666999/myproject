<template>
  <div class="packing-page">
    <div class="page-header">
      <h2>物品清单</h2>
      <div class="header-actions">
        <el-select v-model="selectedTripId" placeholder="选择行程" style="width: 200px" @change="loadItems">
          <el-option v-for="trip in trips" :key="trip.id" :label="trip.name" :value="trip.id" />
        </el-select>
        <el-button type="primary" @click="openItemDialog(null)">
          <el-icon><Plus /></el-icon>
          添加物品
        </el-button>
      </div>
    </div>

    <div class="progress-section">
      <el-progress :percentage="packedPercentage" :status="packedPercentage === 100 ? 'success' : ''" />
      <p class="progress-text">已打包 {{ packedCount }} / {{ items.length }} 件</p>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" v-for="(categoryItems, category) in groupedItems" :key="category">
      <el-card class="category-card">
        <template #header>
          <div class="category-header">
            <span class="category-name">{{ category }}</span>
            <el-tag size="small">{{ categoryItems.length }} 件</el-tag>
          </div>
        </template>
        <div class="item-list">
          <div
            class="item-row"
            v-for="item in categoryItems"
            :key="item.id"
            :class="{ packed: item.isPacked }">
            <el-checkbox
              :model-value="item.isPacked"
              @change="togglePacked(item)"
            >
            </el-checkbox>
            <div class="item-content">
              <span class="item-name">{{ item.name }}</span>
              <el-tag v-if="item.quantity > 1" size="small" type="info">x{{ item.quantity }}</el-tag>
              <span class="item-remark" v-if="item.remark">{{ item.remark }}</span>
            </div>
            <div class="item-actions">
              <el-button size="small" @click="openItemDialog(item)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteItem(item)">删除</el-button>
            </div>
          </div>
        </div>
      </el-card>
    </el-col>
    </el-row>

    <el-empty v-if="items.length === 0" description="暂无物品" />

    <el-dialog v-model="itemDialogVisible" :title="isEdit ? '编辑物品' : '添加物品'" width="500px">
      <el-form :model="itemForm" label-width="80px">
        <el-form-item label="物品名称">
          <el-input v-model="itemForm.name" />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="itemForm.category" style="width: 100%">
            <el-option label="证件" value="证件" />
            <el-option label="衣物" value="衣物" />
            <el-option label="电子设备" value="电子设备" />
            <el-option label="护肤" value="护肤" />
            <el-option label="药品" value="药品" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="itemForm.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="itemForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveItem">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { tripApi, packingItemApi } from '@/api'

const trips = ref([])
const items = ref([])
const selectedTripId = ref(null)

const itemDialogVisible = ref(false)
const isEdit = ref(false)
const currentItemId = ref(null)
const itemForm = ref({
  name: '',
  category: '其他',
  quantity: 1,
  remark: ''
})

const packedCount = computed(() => {
  return items.value.filter(item => item.isPacked).length
})

const packedPercentage = computed(() => {
  if (items.value.length === 0) return 0
  return Math.round((packedCount.value / items.value.length) * 100)
})

const groupedItems = computed(() => {
  const groups = {}
  items.value.forEach(item => {
    const category = item.category || '其他'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(item)
  })
  return groups
})

const loadTrips = async () => {
  try {
    const data = await tripApi.list()
    trips.value = data
    if (data.length > 0) {
      selectedTripId.value = data[0].id
      loadItems()
    }
  } catch (error) {
    ElMessage.error('加载行程列表失败')
  }
}

const loadItems = async () => {
  if (!selectedTripId.value) return
  try {
    const data = await packingItemApi.list(selectedTripId.value)
    items.value = data
  } catch (error) {
    ElMessage.error('加载物品清单失败')
  }
}

const togglePacked = async (item) => {
  try {
    await packingItemApi.update(item.id, { ...item, isPacked: !item.isPacked })
    item.isPacked = !item.isPacked
    ElMessage.success(item.isPacked ? '已标记为已打包' : '已标记为未打包')
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

const openItemDialog = (item) => {
  isEdit.value = !!item
  currentItemId.value = item?.id || null
  itemForm.value = item ? { ...item } : {
    name: '',
    category: '其他',
    quantity: 1,
    remark: ''
  }
  itemDialogVisible.value = true
}

const saveItem = async () => {
  try {
    const data = { ...itemForm.value, tripId: selectedTripId.value, isPacked: false }
    if (isEdit.value) {
      await packingItemApi.update(currentItemId.value, data)
      ElMessage.success('更新成功')
    } else {
      await packingItemApi.create(data)
      ElMessage.success('创建成功')
    }
    itemDialogVisible.value = false
    loadItems()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const deleteItem = async (item) => {
  try {
    await ElMessageBox.confirm('确定要删除这个物品吗？', '提示', { type: 'warning' })
    await packingItemApi.delete(item.id)
    ElMessage.success('删除成功')
    loadItems()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadTrips()
})
</script>

<style scoped>
.packing-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.progress-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.progress-text {
  text-align: center;
  margin-top: 10px;
  color: #606266;
}

.category-card {
  margin-bottom: 20px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.item-row.packed {
  opacity: 0.6;
}

.item-row.packed .item-name {
  text-decoration: line-through;
}

.item-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 10px;
}

.item-name {
  font-weight: 500;
  color: #303133;
}

.item-remark {
  color: #909399;
  font-size: 13px;
}

.item-actions {
  display: flex;
  gap: 5px;
}
</style>
