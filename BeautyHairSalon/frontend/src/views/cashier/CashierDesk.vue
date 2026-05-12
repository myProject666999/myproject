
<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="18">
        <el-card shadow="hover">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">商品/服务选择</span>
              <el-input v-model="searchKeyword" placeholder="搜索商品或服务" style="width: 200px;" clearable />
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="服务项目" name="service">
              <el-row :gutter="10">
                <el-col :span="6" v-for="item in services" :key="item.id">
                  <el-card shadow="hover" style="margin-bottom: 10px; cursor: pointer;" @click="addItem(item, 'service')">
                    <div style="text-align: center;">
                      <el-icon :size="32" style="color: #409EFF;"><Service /></el-icon>
                      <div style="margin-top: 10px; font-weight: bold;">{{ item.itemName }}</div>
                      <div style="color: #F56C6C; font-size: 16px;">¥{{ item.price }}</div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="商品销售" name="product">
              <el-table :data="products" stripe>
                <el-table-column prop="productName" label="商品名称" />
                <el-table-column prop="salePrice" label="售价" width="100">
                  <template #default="{ row }">¥{{ row.salePrice }}</template>
                </el-table-column>
                <el-table-column prop="stock" label="库存" width="80" />
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="addItem(row, 'product')">添加</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="会员开卡" name="card">
              <el-row :gutter="10">
                <el-col :span="8" v-for="card in cardTypes" :key="card.id">
                  <el-card shadow="hover" style="margin-bottom: 10px; cursor: pointer;" @click="addItem(card, 'card')">
                    <div style="text-align: center;">
                      <el-icon :size="32" style="color: #67C23A;"><CreditCard /></el-icon>
                      <div style="margin-top: 10px; font-weight: bold;">{{ card.cardName }}</div>
                      <div style="color: #F56C6C; font-size: 16px;">¥{{ card.faceValue }}</div>
                      <div v-if="card.giveValue > 0" style="color: #67C23A; font-size: 12px;">送 ¥{{ card.giveValue }}</div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" style="height: 100%;">
          <template #header>
            <span style="font-weight: bold;">当前订单</span>
          </template>
          <el-form label-width="80px">
            <el-form-item label="选择会员">
              <el-input v-model="orderForm.memberName" placeholder="输入手机号查找会员" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="orderForm.phone" />
            </el-form-item>
          </el-form>
          <el-divider />
          <div style="margin-bottom: 10px; font-weight: bold;">购物清单</div>
          <div v-if="cartItems.length === 0" style="text-align: center; padding: 20px; color: #909399;">
            暂无商品
          </div>
          <el-table
            v-else
            :data="cartItems"
            size="small"
            border
          >
            <el-table-column prop="name" label="名称" show-overflow-tooltip />
            <el-table-column prop="price" label="单价" width="60">
              <template #default="{ row }">¥{{ row.price }}</template>
            </el-table-column>
            <el-table-column label="数量" width="80">
              <template #default="{ row }">
                <el-input-number v-model="row.quantity" :min="1" size="small" style="width: 60px;" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="40">
              <template #default="{ row, $index }">
                <el-button type="danger" link size="small" @click="removeItem($index)">×</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-divider />
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>商品总数：</span>
            <span>{{ totalQuantity }} 件</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>优惠金额：</span>
            <span style="color: #F56C6C;">-¥{{ orderForm.discount }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold;">
            <span>应收金额：</span>
            <span style="color: #F56C6C;">¥{{ totalAmount }}</span>
          </div>
          <el-divider />
          <el-button type="primary" style="width: 100%; margin-bottom: 10px;" size="large">收款结算</el-button>
          <el-button style="width: 48%;" size="large">挂单</el-button>
          <el-button type="danger" style="width: 48%; margin-left: 4%;" size="large">清空</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Service, CreditCard } from '@element-plus/icons-vue'

const activeTab = ref('service')
const searchKeyword = ref('')

const orderForm = reactive({
  memberName: '',
  phone: '',
  discount: 0
})

const cartItems = ref([])

const services = ref([
  { id: 1, itemName: '精剪', price: 68, duration: 30 },
  { id: 2, itemName: '洗剪吹', price: 38, duration: 25 },
  { id: 3, itemName: '冷烫', price: 298, duration: 90 },
  { id: 4, itemName: '热烫', price: 498, duration: 120 },
  { id: 5, itemName: '染发（黑色）', price: 198, duration: 60 },
  { id: 6, itemName: '染发（彩色）', price: 398, duration: 90 },
  { id: 7, itemName: '面部护理', price: 298, duration: 60 },
  { id: 8, itemName: '精油SPA', price: 198, duration: 45 }
])

const products = ref([
  { id: 1, productName: '洗发水', salePrice: 88, stock: 50 },
  { id: 2, productName: '护发素', salePrice: 68, stock: 45 },
  { id: 3, productName: '发膜', salePrice: 128, stock: 30 },
  { id: 4, productName: '染发膏', salePrice: 158, stock: 25 }
])

const cardTypes = ref([
  { id: 1, cardName: '银卡储值卡', faceValue: 1000, giveValue: 100 },
  { id: 2, cardName: '金卡储值卡', faceValue: 3000, giveValue: 500 },
  { id: 3, cardName: '钻石卡储值卡', faceValue: 5000, giveValue: 1000 },
  { id: 4, cardName: '剪发10次卡', faceValue: 500, giveValue: 0 },
  { id: 5, cardName: '烫发套餐卡', faceValue: 888, giveValue: 0 }
])

const addItem = (item, type) => {
  const name = item.itemName || item.productName || item.cardName
  const price = item.price || item.salePrice || item.faceValue

  const existIndex = cartItems.value.findIndex(i => i.id === item.id && i.type === type)
  if (existIndex > -1) {
    cartItems.value[existIndex].quantity++
  } else {
    cartItems.value.push({
      id: item.id,
      name,
      price,
      quantity: 1,
      type
    })
  }
}

const removeItem = (index) => {
  cartItems.value.splice(index, 1)
}

const totalQuantity = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalAmount = computed(() => {
  const total = cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return (total - orderForm.discount).toFixed(2)
})
</script>
