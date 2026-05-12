
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="商品名称">
        <el-input v-model="queryForm.keyword" placeholder="请输入商品名称/编码" clearable style="width: 180px;" />
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="queryForm.category" placeholder="请选择" clearable style="width: 130px;">
          <el-option label="洗护用品" value="洗护用品" />
          <el-option label="染烫产品" value="染烫产品" />
          <el-option label="护理产品" value="护理产品" />
          <el-option label="造型产品" value="造型产品" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="success" icon="Plus" @click="handleAdd">新增商品</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe class="table-container" v-loading="loading">
      <el-table-column prop="productCode" label="商品编码" width="120" />
      <el-table-column prop="productName" label="商品名称" width="180" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="unit" label="单位" width="60" />
      <el-table-column prop="stock" label="库存" width="80">
        <template #default="{ row }">
          <span :style="{ color: row.stock < row.safetyStock ? '#F56C6C' : '' }">
            {{ row.stock }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="safetyStock" label="安全库存" width="80" />
      <el-table-column prop="salePrice" label="售价" width="100">
        <template #default="{ row }">¥{{ row.salePrice }}</template>
      </el-table-column>
      <el-table-column prop="costPrice" label="成本价" width="100">
        <template #default="{ row }">¥{{ row.costPrice }}</template>
      </el-table-column>
      <el-table-column prop="supplier" label="供应商" width="120" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination-container"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '新增商品'" width="550px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="商品编码" prop="productCode">
          <el-input v-model="form.productCode" placeholder="自动生成可修改" />
        </el-form-item>
        <el-form-item label="商品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择" style="width: 100%;">
                <el-option label="洗护用品" value="洗护用品" />
                <el-option label="染烫产品" value="染烫产品" />
                <el-option label="护理产品" value="护理产品" />
                <el-option label="造型产品" value="造型产品" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位">
              <el-input v-model="form.unit" placeholder="如：瓶、盒、支" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存">
              <el-input-number v-model="form.stock" :min="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安全库存">
              <el-input-number v-model="form.safetyStock" :min="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="售价" prop="salePrice">
              <el-input-number v-model="form.salePrice" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成本价">
              <el-input-number v-model="form.costPrice" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="供应商">
          <el-input v-model="form.supplier" placeholder="请输入供应商" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入描述" />
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
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const queryForm = reactive({
  keyword: '',
  category: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref([])

const form = reactive({
  id: null,
  productCode: '',
  productName: '',
  category: '',
  unit: '瓶',
  stock: 0,
  safetyStock: 10,
  salePrice: 0,
  costPrice: 0,
  supplier: '',
  description: '',
  status: 1
})

const rules = {
  productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  salePrice: [{ required: true, message: '请输入售价', trigger: 'blur' }]
}

const getList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      size: pagination.size
    }
    if (queryForm.keyword) params.keyword = queryForm.keyword
    if (queryForm.category) params.category = queryForm.category
    
    const res = await request.get('/product/page', { params })
    tableData.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  getList()
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.category = ''
  pagination.current = 1
  getList()
}

const handlePageChange = (page) => {
  pagination.current = page
  getList()
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  getList()
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: null,
    productCode: '',
    productName: '',
    category: '',
    unit: '瓶',
    stock: 0,
    safetyStock: 10,
    salePrice: 0,
    costPrice: 0,
    supplier: '',
    description: '',
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/product/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      await request.put('/product', form)
      ElMessage.success('更新成功')
    } else {
      await request.post('/product', form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } catch (e) {
    if (e !== false) {
      console.error(e)
    }
  }
}

onMounted(() => {
  getList()
})
</script>
