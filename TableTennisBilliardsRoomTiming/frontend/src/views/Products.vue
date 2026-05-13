<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="addDialogVisible = true" :icon="Plus">
              添加商品
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="products" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="category_name" label="类别" width="100" />
        <el-table-column prop="price" label="售价" width="100">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? '在售' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="editProduct(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteProduct(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="addDialogVisible"
      :title="editingProduct ? '编辑商品' : '添加商品'"
      width="500px"
    >
      <el-form :model="productForm" label-width="80px">
        <el-form-item label="商品名称">
          <el-input v-model="productForm.name" />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="productForm.category_id" placeholder="选择类别" style="width: 100%">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="售价">
          <el-input-number v-model="productForm.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="成本">
          <el-input-number v-model="productForm.cost_price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="productForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="productForm.unit" placeholder="个/瓶/包" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProduct">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '../utils/api'

const products = ref([])
const categories = ref([])
const addDialogVisible = ref(false)
const editingProduct = ref(null)
const productForm = reactive({
  id: null,
  name: '',
  category_id: null,
  price: 0,
  cost_price: 0,
  stock: 0,
  unit: '个',
  is_active: 1
})

async function fetchData() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      api.get('/products'),
      api.get('/products/categories')
    ])
    products.value = productsRes.data
    categories.value = categoriesRes.data
  } catch (error) {
    console.error('获取商品数据失败:', error)
  }
}

function editProduct(row) {
  editingProduct.value = row
  Object.assign(productForm, row)
  addDialogVisible.value = true
}

async function deleteProduct(row) {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      type: 'warning'
    })
    await api.delete(`/products/${row.id}`)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

async function saveProduct() {
  try {
    if (editingProduct.value) {
      await api.put(`/products/${productForm.id}`, productForm)
      ElMessage.success('更新成功')
    } else {
      await api.post('/products', productForm)
      ElMessage.success('添加成功')
    }
    addDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
