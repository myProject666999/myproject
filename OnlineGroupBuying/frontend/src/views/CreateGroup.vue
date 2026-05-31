<template>
  <div class="create-group-page">
    <div class="page-header">
      <h2>发起拼团</h2>
      <p>选择商品，创建你的团购活动</p>
    </div>
    <el-card shadow="never" class="form-card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="选择商品" prop="product_id">
          <el-select
            v-model="formData.product_id"
            placeholder="请选择商品"
            filterable
            style="width: 100%"
            :loading="productLoading"
            @change="handleProductChange"
          >
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品原价" v-if="selectedProduct">
          <span class="original-price">¥{{ selectedProduct.original_price }}</span>
        </el-form-item>
        <el-form-item label="拼团标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入拼团标题"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="拼团价格" prop="group_price">
          <el-input-number
            v-model="formData.group_price"
            :min="0.01"
            :precision="2"
            :step="1"
            style="width: 100%"
            placeholder="请输入拼团价格"
          />
        </el-form-item>
        <el-form-item label="成团人数" prop="group_size">
          <el-input-number
            v-model="formData.group_size"
            :min="2"
            :max="100"
            :step="1"
            style="width: 100%"
            placeholder="请输入成团人数"
          />
        </el-form-item>
        <el-form-item label="持续时间(小时)">
          <el-input-number
            v-model="formData.duration"
            :min="1"
            :max="720"
            :step="1"
            style="width: 100%"
            placeholder="拼团持续时间"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">
            创建拼团
          </el-button>
          <el-button size="large" @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { groupApi, productApi } from '@/api'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const productLoading = ref(false)
const products = ref([])

const formData = reactive({
  product_id: null,
  title: '',
  group_price: 0,
  group_size: 5,
  duration: 24
})

const selectedProduct = computed(() => {
  return products.value.find((p) => p.id === formData.product_id)
})

const formRules = {
  product_id: [
    { required: true, message: '请选择商品', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入拼团标题', trigger: 'blur' }
  ],
  group_price: [
    { required: true, message: '请输入拼团价格', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error('拼团价格必须大于0'))
        } else if (selectedProduct.value && value >= selectedProduct.value.original_price) {
          callback(new Error('拼团价格必须低于原价'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  group_size: [
    { required: true, message: '请输入成团人数', trigger: 'blur' },
    { type: 'number', min: 2, message: '成团人数至少为 2 人', trigger: 'blur' }
  ]
}

async function fetchProducts() {
  productLoading.value = true
  try {
    const res = await productApi.getList({ page: 1, size: 100 })
    products.value = res.data?.items || res.data || []
  } catch (error) {
    ElMessage.error('获取商品列表失败')
  } finally {
    productLoading.value = false
  }
}

function handleProductChange() {
  if (selectedProduct.value) {
    const suggestedPrice = Math.round(selectedProduct.value.original_price * 0.8 * 100) / 100
    if (!formData.group_price || formData.group_price >= selectedProduct.value.original_price) {
      formData.group_price = suggestedPrice
    }
    if (!formData.title) {
      formData.title = selectedProduct.value.name + ' - 社区拼团'
    }
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const res = await groupApi.create(formData)
      ElMessage.success('拼团创建成功')
      if (res.data?.group_id) {
        router.push(`/group/${res.data.group_id}`)
      } else {
        router.push('/my/groups')
      }
    } catch (error) {
      // 错误已在拦截器中处理
    } finally {
      submitting.value = false
    }
  })
}

function goBack() {
  router.back()
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.create-group-page {
  padding: 10px 0;
  max-width: 700px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 6px 0;
  font-size: 24px;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.form-card {
  border-radius: 12px;
}

.original-price {
  color: #c0c4cc;
  text-decoration: line-through;
  font-size: 16px;
}
</style>
