<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Edit, Trash2, RefreshCw } from 'lucide-vue-next'
import StatusTag from '@/components/StatusTag.vue'
import {
  getProductList,
  getProductCategories,
  createProduct,
  updateProduct,
  deleteProduct
} from '@/api/product'
import type { Product, ProductQuery, ProductCreate, ProductUpdate } from '@/types'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const currentId = ref<number | null>(null)

const queryParams = reactive<ProductQuery>({
  page: 1,
  page_size: 10,
  keyword: '',
  category: '',
  status: undefined
})

const tableData = ref<Product[]>([])
const total = ref(0)
const categories = ref<string[]>([])

const formRef = ref<FormInstance>()
const formData = reactive<ProductCreate>({
  product_code: '',
  name: '',
  category: '',
  price: 0,
  cost: 0,
  spec: '',
  image_url: '',
  status: 1
})

const rules: FormRules = {
  product_code: [{ required: true, message: '请输入商品编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  cost: [{ required: true, message: '请输入成本', trigger: 'blur' }]
}

const statusOptions = [
  { value: 1, label: '上架' },
  { value: 0, label: '下架' }
]

const fetchCategories = async () => {
  try {
    const res = await getProductCategories()
    categories.value = res
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getProductList(queryParams)
    tableData.value = res.list
    total.value = res.total
  } catch (error) {
    console.error('Failed to fetch product list:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.category = ''
  queryParams.status = undefined
  queryParams.page = 1
  fetchData()
}

const handleSizeChange = (size: number) => {
  queryParams.page_size = size
  queryParams.page = 1
  fetchData()
}

const handleCurrentChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增商品'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Product) => {
  isEdit.value = true
  dialogTitle.value = '编辑商品'
  currentId.value = row.id
  Object.assign(formData, {
    product_code: row.product_code,
    name: row.name,
    category: row.category,
    price: row.price,
    cost: row.cost,
    spec: row.spec,
    image_url: row.image_url,
    status: row.status
  })
  dialogVisible.value = true
}

const handleDelete = (row: Product) => {
  ElMessageBox.confirm(`确定要删除商品"${row.name}"吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteProduct(row.id)
        ElMessage.success('删除成功')
        fetchData()
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    })
    .catch(() => {})
}

const resetForm = () => {
  currentId.value = null
  formData.product_code = ''
  formData.name = ''
  formData.category = ''
  formData.price = 0
  formData.cost = 0
  formData.spec = ''
  formData.image_url = ''
  formData.status = 1
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value && currentId.value) {
          const updateData: ProductUpdate = {
            name: formData.name,
            category: formData.category,
            price: formData.price,
            cost: formData.cost,
            spec: formData.spec,
            image_url: formData.image_url,
            status: formData.status
          }
          await updateProduct(currentId.value, updateData)
          ElMessage.success('更新成功')
        } else {
          await createProduct(formData)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchData()
        fetchCategories()
      } catch (error) {
        console.error('Failed to submit form:', error)
      }
    }
  })
}

const getStatusTag = (status: number) => {
  return status === 1 ? 'success' : 'danger'
}

const getStatusLabel = (status: number) => {
  return status === 1 ? '上架' : '下架'
}

onMounted(() => {
  fetchCategories()
  fetchData()
})
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">商品管理</h2>
      <p class="text-gray-600 dark:text-gray-400 mt-1">管理货柜内的商品信息</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <el-form :inline="true" :model="queryParams" class="flex flex-wrap gap-4">
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="商品编码/名称"
            class="w-64"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Search class="w-4 h-4 text-gray-400" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="queryParams.category"
            placeholder="全部分类"
            class="w-48"
            clearable
          >
            <el-option
              v-for="item in categories"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="全部"
            class="w-32"
            clearable
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <Search class="w-4 h-4 mr-1" />
            搜索
          </el-button>
          <el-button @click="handleReset">
            <RefreshCw class="w-4 h-4 mr-1" />
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div class="flex justify-between items-center mb-4">
        <div class="text-gray-600 dark:text-gray-400">
          共 <span class="font-semibold text-gray-900 dark:text-white">{{ total }}</span> 条记录
        </div>
        <el-button type="primary" @click="handleAdd">
          <Plus class="w-4 h-4 mr-1" />
          新增商品
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        class="w-full"
        style="width: 100%"
      >
        <el-table-column label="图片" min-width="80">
          <template #default="{ row }">
            <div class="flex items-center justify-center">
              <img
                v-if="row.image_url"
                :src="row.image_url"
                :alt="row.name"
                class="w-10 h-10 rounded object-cover"
              />
              <div
                v-else
                class="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs"
              >
                无图
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="product_code" label="商品编码" min-width="120" />
        <el-table-column prop="name" label="商品名称" min-width="140" />
        <el-table-column prop="category" label="分类" min-width="100" />
        <el-table-column prop="spec" label="规格" min-width="100" show-overflow-tooltip />
        <el-table-column label="售价" min-width="100">
          <template #default="{ row }">
            <span class="text-orange-600 font-medium">¥{{ row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="成本" min-width="100">
          <template #default="{ row }">
            ¥{{ row.cost.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="80">
          <template #default="{ row }">
            <StatusTag :status="getStatusTag(row.status)" :label="getStatusLabel(row.status)" />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="160" />
        <el-table-column label="操作" min-width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <Edit class="w-4 h-4 mr-1" />
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <Trash2 class="w-4 h-4 mr-1" />
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.page_size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="mt-4"
      >
        <el-form-item label="商品编码" prop="product_code">
          <el-input
            v-model="formData.product_code"
            placeholder="请输入商品编码"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类" prop="category">
          <el-select
            v-model="formData.category"
            placeholder="请选择或输入分类"
            class="w-full"
            allow-create
            filterable
          >
            <el-option
              v-for="item in categories"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="售价" prop="price">
              <el-input-number
                v-model="formData.price"
                :precision="2"
                :step="0.5"
                :min="0"
                class="w-full"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成本" prop="cost">
              <el-input-number
                v-model="formData.cost"
                :precision="2"
                :step="0.5"
                :min="0"
                class="w-full"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="规格" prop="spec">
          <el-input v-model="formData.spec" placeholder="请输入商品规格" />
        </el-form-item>
        <el-form-item label="图片地址" prop="image_url">
          <el-input v-model="formData.image_url" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
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
