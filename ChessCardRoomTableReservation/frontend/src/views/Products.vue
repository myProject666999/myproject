<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>商品管理</span>
          <el-button type="primary" @click="openAddDialog" :icon="Plus">添加商品</el-button>
        </div>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部" name="" />
        <el-tab-pane label="茶水" name="tea" />
        <el-tab-pane label="酒水" name="drink" />
        <el-tab-pane label="零食" name="snack" />
      </el-tabs>
      <el-table :data="filteredProducts" border>
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="category" label="分类">
          <template #default="{ row }">
            {{ getCategoryText(row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column prop="stock" label="库存" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="dark">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="editProduct(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteProduct(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '添加商品'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="商品名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category">
            <el-option label="茶水" value="tea" />
            <el-option label="酒水" value="drink" />
            <el-option label="零食" value="snack" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="form.unit" placeholder="份/杯/瓶/盘" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">上架</el-radio>
            <el-radio :value="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProducts, createProduct, updateProduct, deleteProduct as apiDeleteProduct } from '../api'
import { Plus } from '@element-plus/icons-vue'

const products = ref([])
const activeTab = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  id: null,
  name: '',
  category: 'tea',
  price: 0,
  unit: '份',
  stock: 0,
  status: 1
})

const filteredProducts = computed(() => {
  if (!activeTab.value) return products.value
  return products.value.filter(p => p.category === activeTab.value)
})

function getCategoryText(category) {
  const map = { tea: '茶水', drink: '酒水', snack: '零食' }
  return map[category] || category
}

async function loadProducts() {
  try {
    products.value = await getProducts()
  } catch (e) {
    console.error(e)
  }
}

function openAddDialog() {
  isEdit.value = false
  form.value = { id: null, name: '', category: 'tea', price: 0, unit: '份', stock: 0, status: 1 }
  dialogVisible.value = true
}

function editProduct(row) {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

async function submitForm() {
  try {
    if (isEdit.value) {
      await updateProduct(form.value)
      ElMessage.success('修改成功')
    } else {
      await createProduct(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadProducts()
  } catch (e) {
    console.error(e)
  }
}

function deleteProduct(row) {
  ElMessageBox.confirm('确定删除该商品吗？', '提示', { type: 'warning' })
    .then(async () => {
      await apiDeleteProduct(row.id)
      ElMessage.success('删除成功')
      loadProducts()
    })
    .catch(() => {})
}

onMounted(() => {
  loadProducts()
})
</script>
