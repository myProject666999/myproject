<template>
  <div class="inventory-page">
    <div class="page-header">
      <h2>库存管理</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        新增库存
      </el-button>
    </div>

    <div class="stats">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-label">总库存项</div>
          <div class="stat-value">{{ inventories.length }}</div>
        </div>
      </el-card>
      <el-card class="stat-card warning-card">
        <div class="stat-content">
          <div class="stat-label">
            <el-icon><WarningFilled /></el-icon>
            低库存预警
          </div>
          <div class="stat-value">{{ lowStockCount }}</div>
        </div>
      </el-card>
    </div>

    <el-table
      :data="inventories"
      v-loading="loading"
      stripe
      style="width: 100%; margin-top: 20px;"
      :empty-text="'暂无库存数据'"
    >
      <el-table-column prop="userName" label="用户" width="100" />
      <el-table-column prop="medicineName" label="药品名称" min-width="140" />
      <el-table-column prop="specification" label="规格" width="120" />
      <el-table-column label="当前库存" width="120">
        <template #default="{ row }">
          <span :class="{ 'low-stock': row.lowStock }">
            {{ row.quantity }} {{ row.unit }}
          </span>
          <el-tag v-if="row.lowStock" type="danger" size="small" style="margin-left: 8px">
            不足
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="预警值" width="120">
        <template #default="{ row }">
          {{ row.warningQuantity }} {{ row.unit }}
        </template>
      </el-table-column>
      <el-table-column label="有效期" width="140">
        <template #default="{ row }">
          <span :class="{ 'expiring': isExpiring(row.expiryDate) }">
            {{ row.expiryDate || '无' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="batchNo" label="批号" width="120" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" type="success" @click="openStockDialog(row)">补货</el-button>
          <el-button size="small" type="danger" @click="handleDeleteInventory(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑库存' : '新增库存'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="form" label-width="100px" ref="formRef" :rules="rules">
        <el-form-item label="选择用户" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择用户" style="width: 100%">
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择药品" prop="medicineId">
          <el-select v-model="form.medicineId" placeholder="请选择药品" style="width: 100%" filterable>
            <el-option
              v-for="med in medicines"
              :key="med.id"
              :label="med.name + (med.specification ? ' (' + med.specification + ')' : '')"
              :value="med.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="当前数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="单位">
          <el-select v-model="form.unit" style="width: 100%">
            <el-option label="片" value="片" />
            <el-option label="粒" value="粒" />
            <el-option label="瓶" value="瓶" />
            <el-option label="盒" value="盒" />
            <el-option label="支" value="支" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警值" prop="warningQuantity">
          <el-input-number v-model="form.warningQuantity" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="有效期">
          <el-date-picker
            v-model="form.expiryDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择有效期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="批号">
          <el-input v-model="form.batchNo" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="stockDialogVisible"
      title="补货"
      width="400px"
      destroy-on-close
    >
      <el-form :model="stockForm" label-width="100px">
        <el-form-item label="药品">
          <span>{{ currentStock?.medicineName }}</span>
        </el-form-item>
        <el-form-item label="当前库存">
          <span>{{ currentStock?.quantity }} {{ currentStock?.unit }}</span>
        </el-form-item>
        <el-form-item label="补货数量" prop="addQuantity">
          <el-input-number v-model="stockForm.addQuantity" :min="1" :max="9999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStock">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { getInventoriesByUser, createInventory, updateInventory, deleteInventory } from '@/api/inventory'
import { getMedicines } from '@/api/medicine'
import { getUsers } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  userId: { type: Number, default: 1 }
})

const loading = ref(false)
const inventories = ref([])
const medicines = ref([])
const users = ref([])

const dialogVisible = ref(false)
const stockDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentStock = ref(null)

const defaultForm = () => ({
  id: null,
  userId: props.userId,
  medicineId: null,
  quantity: 0,
  unit: '片',
  warningQuantity: 10,
  expiryDate: null,
  batchNo: ''
})

const form = reactive(defaultForm())
const stockForm = reactive({ addQuantity: 10 })

const rules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  medicineId: [{ required: true, message: '请选择药品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  warningQuantity: [{ required: true, message: '请输入预警值', trigger: 'blur' }]
}

const lowStockCount = computed(() =>
  inventories.value.filter(i => i.lowStock).length
)

const isExpiring = (date) => {
  if (!date) return false
  const now = new Date()
  const expiry = new Date(date)
  const diff = (expiry - now) / (1000 * 60 * 60 * 24)
  return diff < 30
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, defaultForm())
  form.userId = props.userId
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    userId: row.userId,
    medicineId: row.medicineId,
    quantity: row.quantity,
    unit: row.unit,
    warningQuantity: row.warningQuantity,
    expiryDate: row.expiryDate,
    batchNo: row.batchNo
  })
  dialogVisible.value = true
}

const openStockDialog = (row) => {
  currentStock.value = row
  stockForm.addQuantity = 10
  stockDialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (isEdit.value) {
        await updateInventory(form)
        ElMessage.success('更新成功')
      } else {
        await createInventory(form)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchData(props.userId)
    } catch (e) {
      console.error(e)
    }
  })
}

const confirmStock = async () => {
  if (!currentStock.value) return
  try {
    await updateInventory({
      id: currentStock.value.id,
      quantity: currentStock.value.quantity + stockForm.addQuantity
    })
    ElMessage.success(`已补充 ${stockForm.addQuantity} ${currentStock.value.unit}`)
    stockDialogVisible.value = false
    fetchData(props.userId)
  } catch (e) {
    console.error(e)
  }
}

const handleDeleteInventory = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该库存记录吗？', '提示', { type: 'warning' })
    await deleteInventory(row.id)
    ElMessage.success('删除成功')
    fetchData(props.userId)
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const handleUserChange = (e) => {
  fetchData(e.detail.userId)
}

const fetchData = async (userId) => {
  loading.value = true
  try {
    const res = await getInventoriesByUser(userId || props.userId)
    inventories.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchBaseData = async () => {
  try {
    const [medRes, userRes] = await Promise.all([getMedicines(), getUsers()])
    medicines.value = medRes.data || []
    users.value = userRes.data || []
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchData(props.userId)
  fetchBaseData()
  window.addEventListener('user-change', handleUserChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('user-change', handleUserChange)
})
</script>

<style scoped>
.inventory-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.page-header h2 {
  color: #303133;
  margin: 0;
}
.stats {
  display: flex;
  gap: 16px;
}
.stat-card {
  flex: 1;
  max-width: 240px;
}
.stat-card :deep(.el-card__body) {
  padding: 16px 20px;
}
.stat-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stat-label {
  color: #909399;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}
.warning-card .stat-value {
  color: #f56c6c;
}
.low-stock {
  color: #f56c6c;
  font-weight: 600;
}
.expiring {
  color: #e6a23c;
  font-weight: 600;
}
</style>
