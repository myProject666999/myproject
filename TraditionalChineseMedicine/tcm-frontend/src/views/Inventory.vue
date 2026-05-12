<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>药材库存管理</span>
          <el-button type="primary" @click="openDialog()">
            <el-icon><Plus /></el-icon>新增入库
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-select v-model="selectedHerb" placeholder="选择药材查看库存" filterable style="width: 300px" @change="loadData">
          <el-option v-for="h in herbList" :key="h.id" :label="h.name" :value="h.id" />
        </el-select>
      </div>

      <el-table :data="tableData" border stripe v-if="selectedHerb">
        <el-table-column prop="herbId" label="药材ID" width="80" />
        <el-table-column prop="quantity" label="库存数量(g)" width="120" />
        <el-table-column prop="unitPrice" label="单价(元/g)" width="120" />
        <el-table-column prop="batchNo" label="批次号" width="150" />
        <el-table-column prop="expireDate" label="有效期" width="120" />
        <el-table-column prop="createTime" label="入库时间" width="180" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="请选择药材查看库存" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="formData.id ? '编辑库存' : '新增入库'" width="500px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="药材">
          <el-select v-model="formData.herbId" placeholder="选择药材" filterable style="width: 100%">
            <el-option v-for="h in herbList" :key="h.id" :label="h.name" :value="h.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量(克)">
          <el-input-number v-model="formData.quantity" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="单价(元/克)">
          <el-input-number v-model="formData.unitPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="批次号">
          <el-input v-model="formData.batchNo" />
        </el-form-item>
        <el-form-item label="有效期">
          <el-date-picker v-model="formData.expireDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { herbApi, inventoryApi } from '../api'

const selectedHerb = ref(null)
const herbList = ref([])
const tableData = ref([])
const dialogVisible = ref(false)
const formData = ref({
  id: null,
  herbId: null,
  quantity: 0,
  unitPrice: 0,
  batchNo: '',
  expireDate: ''
})

const loadHerbs = async () => {
  herbList.value = await herbApi.list('', '') || []
}

const loadData = async () => {
  if (selectedHerb.value) {
    tableData.value = await inventoryApi.list(selectedHerb.value) || []
  }
}

const openDialog = (row = null) => {
  if (row) {
    formData.value = { ...row }
  } else {
    formData.value = {
      id: null,
      herbId: selectedHerb.value,
      quantity: 0,
      unitPrice: 0,
      batchNo: '',
      expireDate: ''
    }
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formData.value.herbId) {
    ElMessage.warning('请选择药材')
    return
  }
  if (formData.value.id) {
    await inventoryApi.update(formData.value)
    ElMessage.success('更新成功')
  } else {
    await inventoryApi.save(formData.value)
    ElMessage.success('入库成功')
  }
  dialogVisible.value = false
  loadData()
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该库存记录吗？', '提示', { type: 'warning' }).then(async () => {
    await inventoryApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {})
}

onMounted(() => {
  loadHerbs()
})
</script>

<style scoped>
.page-container { padding-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-bar { margin-bottom: 20px; }
</style>
