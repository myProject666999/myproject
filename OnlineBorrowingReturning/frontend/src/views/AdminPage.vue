<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Setting /></el-icon>
        后台管理
      </h2>
    </div>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-card-title">物品总数</div>
        <div class="stat-card-value">{{ itemStats.total_items || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-title">可用物品</div>
        <div class="stat-card-value" style="color: #67c23a;">{{ itemStats.available_items || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-title">总借用记录</div>
        <div class="stat-card-value">{{ borrowStats.total_borrows || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-title">超期未还</div>
        <div class="stat-card-value" style="color: #f56c6c;">{{ borrowStats.overdue_borrows || 0 }}</div>
      </div>
    </div>

    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>物品管理</span>
          <el-button type="primary" :icon="Plus" @click="showAddDialog = true">
            添加物品
          </el-button>
        </div>
      </template>
      
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索物品"
          clearable
          style="width: 250px;"
          :prefix-icon="Search"
          @keyup.enter="loadItems"
        />
        <el-select v-model="filterCategory" placeholder="分类筛选" clearable style="width: 150px;">
          <el-option label="工具" value="工具" />
          <el-option label="电子设备" value="电子设备" />
          <el-option label="图书" value="图书" />
          <el-option label="生活用品" value="生活用品" />
          <el-option label="其他" value="其他" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="loadItems">搜索</el-button>
      </div>

      <el-table :data="items" v-loading="loading" style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="物品名称" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="location" label="存放位置" width="120" />
        <el-table-column label="库存" width="120">
          <template #default="{ row }">
            {{ row.quantity }} / {{ row.total_quantity }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && items.length === 0" description="暂无物品" />
    </el-card>

    <el-dialog
      v-model="showAddDialog"
      :title="editMode ? '编辑物品' : '添加物品'"
      width="600px"
    >
      <el-form :model="itemForm" label-width="100px">
        <el-form-item label="物品名称" required>
          <el-input v-model="itemForm.name" placeholder="请输入物品名称" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="itemForm.category" placeholder="请选择分类" style="width: 100%;">
            <el-option label="工具" value="工具" />
            <el-option label="电子设备" value="电子设备" />
            <el-option label="图书" value="图书" />
            <el-option label="生活用品" value="生活用品" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="itemForm.description" type="textarea" :rows="3" placeholder="请输入物品描述" />
        </el-form-item>
        <el-form-item label="存放位置">
          <el-input v-model="itemForm.location" placeholder="请输入存放位置" />
        </el-form-item>
        <el-form-item label="总数量" required>
          <el-input-number v-model="itemForm.total_quantity" :min="1" :max="9999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="itemForm.status" placeholder="请选择状态" style="width: 100%;">
            <el-option label="可借" value="available" />
            <el-option label="已借出" value="borrowed" />
            <el-option label="已预约" value="reserved" />
            <el-option label="已损坏" value="damaged" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitItem">
          {{ editMode ? '保存' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete, Setting } from '@element-plus/icons-vue'
import { itemApi, borrowApi } from '@/api'

const loading = ref(false)
const submitting = ref(false)
const items = ref([])
const itemStats = ref({})
const borrowStats = ref({})
const searchKeyword = ref('')
const filterCategory = ref('')
const showAddDialog = ref(false)
const editMode = ref(false)
const editingId = ref(null)

const itemForm = ref({
  name: '',
  category: '',
  description: '',
  location: '',
  total_quantity: 1,
  status: 'available'
})

const getStatusType = (status) => {
  const map = {
    available: 'success',
    borrowed: 'warning',
    reserved: 'info',
    damaged: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    available: '可借',
    borrowed: '已借出',
    reserved: '已预约',
    damaged: '已损坏'
  }
  return map[status] || status
}

const loadStats = async () => {
  try {
    const [itemRes, borrowRes] = await Promise.all([
      itemApi.getStats(),
      borrowApi.getStats()
    ])
    itemStats.value = itemRes.data
    borrowStats.value = borrowRes.data
  } catch (e) {
    console.error(e)
  }
}

const loadItems = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (filterCategory.value) params.category = filterCategory.value
    const res = await itemApi.getItems(params)
    items.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  itemForm.value = {
    name: '',
    category: '',
    description: '',
    location: '',
    total_quantity: 1,
    status: 'available'
  }
  editMode.value = false
  editingId.value = null
}

const handleEdit = (row) => {
  itemForm.value = {
    name: row.name,
    category: row.category,
    description: row.description,
    location: row.location,
    total_quantity: row.total_quantity,
    status: row.status
  }
  editMode.value = true
  editingId.value = row.id
  showAddDialog.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除物品 "${row.name}" 吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    await itemApi.deleteItem(row.id)
    ElMessage.success('删除成功')
    loadItems()
    loadStats()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const submitItem = async () => {
  if (!itemForm.value.name) {
    ElMessage.warning('请填写物品名称')
    return
  }

  submitting.value = true
  try {
    if (editMode.value) {
      await itemApi.updateItem(editingId.value, itemForm.value)
      ElMessage.success('更新成功')
    } else {
      await itemApi.createItem(itemForm.value)
      ElMessage.success('添加成功')
    }
    showAddDialog.value = false
    resetForm()
    loadItems()
    loadStats()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadStats()
  loadItems()
})
</script>
