<template>
  <div class="page-container">
    <div class="app-header" @click="$router.back()" style="cursor: pointer;">← 确认订单</div>
    
    <div style="padding: 12px;">
      <div class="checkout-section">
        <div class="checkout-row">
          <span class="checkout-label">配送地址</span>
          <span class="checkout-value">{{ address }}</span>
        </div>
        <div class="checkout-row">
          <span class="checkout-label">联系人</span>
          <span class="checkout-value">{{ contactName }} {{ contactPhone }}</span>
        </div>
        <van-button
          size="small"
          plain
          type="primary"
          block
          @click="showAddressPopup = true"
          style="margin-top: 8px;"
        >
          修改地址
        </van-button>
      </div>
      
      <div class="checkout-section">
        <div class="section-title" style="padding: 0 0 12px 0;">配送时段</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <div
            v-for="slot in slots"
            :key="slot.id"
            class="slot-card"
            :class="{
              selected: selectedSlot?.id === slot.id,
              disabled: slot.current_orders >= slot.max_orders
            }"
            @click="selectSlot(slot)"
          >
            <div class="slot-time">{{ slot.start_time }} - {{ slot.end_time }}</div>
            <div class="slot-available">
              剩余 {{ Math.max(0, slot.max_orders - slot.current_orders) }} 单
            </div>
          </div>
        </div>
      </div>
      
      <div class="checkout-section">
        <div class="section-title" style="padding: 0 0 12px 0;">商品清单</div>
        <div
          v-for="item in cartItems"
          :key="item.id"
          style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;"
        >
          <span>{{ item.product?.name }} x {{ item.quantity }}{{ item.product?.price_unit === 'weight' ? 'kg' : '份' }}</span>
          <span>¥{{ (item.product?.price * item.quantity).toFixed(2) }}</span>
        </div>
      </div>
      
      <div class="checkout-section">
        <div class="checkout-row">
          <span class="checkout-label">商品金额</span>
          <span class="checkout-value">¥{{ totalAmount.toFixed(2) }}</span>
        </div>
        <div class="checkout-row">
          <span class="checkout-label">配送费</span>
          <span class="checkout-value">¥{{ deliveryFee.toFixed(2) }}</span>
        </div>
        <div class="checkout-row">
          <span class="checkout-label">备注</span>
          <input
            v-model="remark"
            class="form-input"
            placeholder="选填，给商家留言"
            style="max-width: 200px;"
          />
        </div>
      </div>
    </div>
    
    <div class="total-bar">
      <div>
        <span>合计: </span>
        <span class="total-amount">¥{{ (totalAmount + deliveryFee).toFixed(2) }}</span>
      </div>
      <button class="submit-btn" :disabled="submitting" @click="submitOrder">
        {{ submitting ? '提交中...' : '提交订单' }}
      </button>
    </div>
    
    <van-popup v-model:show="showAddressPopup" position="bottom" round style="padding: 20px;">
      <h3 style="margin-bottom: 16px;">修改地址</h3>
      <van-form @submit="saveAddress">
        <van-field
          v-model="address"
          label="地址"
          placeholder="请输入详细地址"
          :rules="[{ required: true, message: '请输入地址' }]"
        />
        <van-field
          v-model="contactName"
          label="联系人"
          placeholder="请输入联系人姓名"
          :rules="[{ required: true, message: '请输入联系人' }]"
        />
        <van-field
          v-model="contactPhone"
          label="电话"
          placeholder="请输入联系电话"
          :rules="[{ required: true, message: '请输入电话' }]"
        />
        <van-button round block type="primary" native-type="submit" style="margin-top: 16px;">
          保存
        </van-button>
      </van-form>
    </van-popup>
    
    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { cartApi, slotApi, orderApi } from '../api'
import { useUserStore } from '../stores/user'
import TabBar from '../components/TabBar.vue'

const router = useRouter()
const userStore = useUserStore()

const cartItems = ref([])
const slots = ref([])
const selectedSlot = ref(null)
const address = ref('')
const contactName = ref('')
const contactPhone = ref('')
const remark = ref('')
const submitting = ref(false)
const showAddressPopup = ref(false)

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity
  }, 0)
})

const deliveryFee = computed(() => {
  return totalAmount.value >= 30 ? 0 : 5
})

function selectSlot(slot) {
  if (slot.current_orders < slot.max_orders) {
    selectedSlot.value = slot
  }
}

function saveAddress() {
  showAddressPopup.value = false
}

async function loadCart() {
  try {
    const res = await cartApi.getCart()
    cartItems.value = (res.items || []).filter(item => item.selected)
    if (cartItems.value.length === 0) {
      showToast('请先选择商品')
      router.replace('/cart')
    }
  } catch (e) {}
}

async function loadSlots() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const res = await slotApi.getAvailableSlots({ date: today })
    slots.value = res.slots || []
  } catch (e) {}
}

function initAddress() {
  const info = userStore.userInfo
  if (info) {
    address.value = info.address || ''
    contactName.value = info.username
    contactPhone.value = info.phone || ''
  }
}

async function submitOrder() {
  if (!selectedSlot.value) {
    showToast('请选择配送时段')
    return
  }
  
  submitting.value = true
  try {
    const cartItemIds = cartItems.value.map(item => item.id)
    await orderApi.createOrder({
      cart_item_ids: cartItemIds,
      delivery_slot_id: selectedSlot.value.id,
      delivery_address: address.value,
      contact_name: contactName.value,
      contact_phone: contactPhone.value,
      remark: remark.value,
    })
    showToast('下单成功')
    router.replace('/orders')
  } catch (e) {}
  submitting.value = false
}

onMounted(() => {
  loadCart()
  loadSlots()
  initAddress()
})
</script>
