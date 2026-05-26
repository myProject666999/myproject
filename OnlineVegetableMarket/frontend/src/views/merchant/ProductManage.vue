<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
      <van-button type="primary" @click="showCreate = true">+ 新增商品</van-button>
    </div>
    
    <div class="merchant-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>商品名称</th>
            <th>分类</th>
            <th>单价</th>
            <th>计价方式</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.id }}</td>
            <td>{{ product.name }}</td>
            <td>{{ product.category?.name || '-' }}</td>
            <td>¥{{ product.price.toFixed(2) }}/{{ product.price_unit === 'weight' ? 'kg' : '份' }}</td>
            <td>{{ product.price_unit === 'weight' ? '按重量' : '按份' }}</td>
            <td>
              <span :class="`order-status status-${product.status === 'on_sale' ? 'paid' : 'cancelled'}`">
                {{ product.status === 'on_sale' ? '在售' : product.status === 'sold_out' ? '售罄' : '下架' }}
              </span>
            </td>
            <td>
              <button class="merchant-action-btn btn-primary" @click="editProduct(product)">编辑</button>
              <button class="merchant-action-btn btn-warning" @click="toggleStatus(product)">
                {{ product.status === 'on_sale' ? '下架' : '上架' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <van-popup v-model:show="showCreate" position="bottom" round style="padding: 20px; max-height: 80vh; overflow-y: auto;">
      <h3 style="margin-bottom: 16px;">{{ editingId ? '编辑商品' : '新增商品' }}</h3>
      <van-form @submit="saveProduct">
        <van-field
          v-model="form.name"
          label="商品名称"
          placeholder="请输入商品名称"
          :rules="[{ required: true, message: '请输入商品名称' }]"
        />
        <van-field
          v-model="form.category_id"
          label="分类"
          placeholder="请选择分类"
          :rules="[{ required: true, message: '请选择分类' }]"
        >
          <template #input>
            <select v-model="form.category_id" style="width: 100%; padding: 10px; border: 1px solid #eee; border-radius: 6px;">
              <option value="">请选择分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </template>
        </van-field>
        <van-field
          v-model="form.price"
          type="number"
          label="单价"
          placeholder="请输入单价"
          :rules="[{ required: true, message: '请输入单价' }]"
        />
        <van-field
          v-model="form.price_unit"
          label="计价方式"
        >
          <template #input>
            <select v-model="form.price_unit" style="width: 100%; padding: 10px; border: 1px solid #eee; border-radius: 6px;">
              <option value="weight">按重量(元/kg)</option>
              <option value="piece">按份(元/份)</option>
            </select>
          </template>
        </van-field>
        <van-field
          v-model="form.origin"
          label="产地"
          placeholder="请输入产地"
        />
        <van-field
          v-model="form.description"
          type="textarea"
          label="描述"
          placeholder="请输入商品描述"
          autosize
        />
        <van-button round block type="primary" native-type="submit" style="margin-top: 16px;">
          保存
        </van-button>
      </van-form>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import { productApi, categoryApi } from '../../api'

const products = ref([])
const categories = ref([])
const showCreate = ref(false)
const editingId = ref(null)

const form = reactive({
  name: '',
  category_id: '',
  price: '',
  price_unit: 'weight',
  origin: '',
  description: '',
})

async function loadProducts() {
  try {
    const res = await productApi.getProducts({ page: 1, page_size: 100 })
    products.value = res.products || []
  } catch (e) {}
}

async function loadCategories() {
  try {
    const res = await categoryApi.getCategories()
    categories.value = res.categories || []
  } catch (e) {}
}

function editProduct(product) {
  editingId.value = product.id
  form.name = product.name
  form.category_id = String(product.category_id)
  form.price = String(product.price)
  form.price_unit = product.price_unit
  form.origin = product.origin || ''
  form.description = product.description || ''
  showCreate.value = true
}

async function toggleStatus(product) {
  const newStatus = product.status === 'on_sale' ? 'off_shelf' : 'on_sale'
  try {
    await productApi.updateProduct(product.id, { status: newStatus })
    showToast('操作成功')
    loadProducts()
  } catch (e) {}
}

async function saveProduct() {
  try {
    const data = {
      ...form,
      category_id: Number(form.category_id),
      price: Number(form.price),
    }
    if (editingId.value) {
      await productApi.updateProduct(editingId.value, data)
    } else {
      await productApi.createProduct(data)
    }
    showToast('保存成功')
    showCreate.value = false
    resetForm()
    loadProducts()
  } catch (e) {}
}

function resetForm() {
  editingId.value = null
  form.name = ''
  form.category_id = ''
  form.price = ''
  form.price_unit = 'weight'
  form.origin = ''
  form.description = ''
}

onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>
