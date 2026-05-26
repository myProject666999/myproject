<template>
  <div>
    <div style="display: flex; gap: 8px; margin-bottom: 16px; align-items: center;">
      <span>日期:</span>
      <input
        v-model="selectedDate"
        type="date"
        class="form-input"
        style="max-width: 200px;"
      />
      <van-button type="primary" @click="loadInventory">查询</van-button>
      <van-button plain @click="showEdit = true">+ 添加/修改库存</van-button>
    </div>
    
    <div class="merchant-table">
      <table>
        <thead>
          <tr>
            <th>商品ID</th>
            <th>商品名称</th>
            <th>总库存</th>
            <th>剩余库存</th>
            <th>已售</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in inventories" :key="inv.id">
            <td>{{ inv.product_id }}</td>
            <td>{{ inv.product?.name || '-' }}</td>
            <td>{{ inv.total_quantity }}{{ inv.product?.price_unit === 'piece' ? '份' : 'kg' }}</td>
            <td style="color: #4CAF50;">{{ inv.remaining_quantity }}{{ inv.product?.price_unit === 'piece' ? '份' : 'kg' }}</td>
            <td style="color: #ff976a;">{{ (inv.total_quantity - inv.remaining_quantity).toFixed(2) }}{{ inv.product?.price_unit === 'piece' ? '份' : 'kg' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <van-popup v-model:show="showEdit" position="bottom" round style="padding: 20px;">
      <h3 style="margin-bottom: 16px;">设置库存</h3>
      <van-form @submit="saveInventory">
        <van-field
          v-model="editForm.product_id"
          label="商品ID"
          type="number"
          placeholder="请输入商品ID"
          :rules="[{ required: true, message: '请输入商品ID' }]"
        />
        <van-field
          v-model="editForm.inventory_date"
          label="日期"
          type="date"
          placeholder="请选择日期"
          :rules="[{ required: true, message: '请选择日期' }]"
        />
        <van-field
          v-model="editForm.total_quantity"
          label="总库存"
          type="number"
          placeholder="请输入总库存数量"
          :rules="[{ required: true, message: '请输入总库存' }]"
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
import { showToast } from 'vant'
import { inventoryApi } from '../../api'

const inventories = ref([])
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showEdit = ref(false)

const editForm = reactive({
  product_id: '',
  inventory_date: new Date().toISOString().split('T')[0],
  total_quantity: '',
})

async function loadInventory() {
  try {
    const res = await inventoryApi.getInventory({ date: selectedDate.value })
    inventories.value = res.inventories || []
  } catch (e) {}
}

async function saveInventory() {
  try {
    await inventoryApi.updateInventory({
      product_id: Number(editForm.product_id),
      inventory_date: editForm.inventory_date,
      total_quantity: Number(editForm.total_quantity),
    })
    showToast('保存成功')
    showEdit.value = false
    editForm.product_id = ''
    editForm.total_quantity = ''
    loadInventory()
  } catch (e) {}
}

onMounted(loadInventory)
</script>
