<template>
  <div class="page-container">
    <div class="app-header">👤 个人中心</div>
    
    <div v-if="userInfo" style="padding: 16px;">
      <div class="order-card" style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 8px;">👤</div>
        <div style="font-size: 18px; font-weight: bold;">{{ userInfo.username }}</div>
        <div style="color: #666; font-size: 14px; margin-top: 4px;">{{ userInfo.phone }}</div>
        <div style="margin-top: 8px;">
          <span :class="roleBadgeClass">{{ roleText }}</span>
        </div>
      </div>
      
      <div class="order-card">
        <div class="checkout-row" @click="$router.push('/orders')" style="cursor: pointer;">
          <span class="checkout-label">📦 我的订单</span>
          <span class="checkout-value">查看全部 ›</span>
        </div>
        <div class="checkout-row" @click="showAddressEdit = true" style="cursor: pointer;">
          <span class="checkout-label">📍 收货地址</span>
          <span class="checkout-value">{{ userInfo.address || '未设置' }} ›</span>
        </div>
        <div v-if="isMerchant" class="checkout-row" @click="$router.push('/merchant')" style="cursor: pointer;">
          <span class="checkout-label">🏪 商家后台</span>
          <span class="checkout-value">进入 ›</span>
        </div>
      </div>
      
      <div style="margin-top: 24px;">
        <van-button block type="danger" @click="handleLogout">退出登录</van-button>
      </div>
    </div>
    
    <van-popup v-model:show="showAddressEdit" position="bottom" round style="padding: 20px;">
      <h3 style="margin-bottom: 16px;">修改地址</h3>
      <van-form @submit="saveAddress">
        <van-field
          v-model="editAddress"
          label="地址"
          placeholder="请输入详细地址"
          type="textarea"
          autosize
        />
        <van-field
          v-model="editPhone"
          label="电话"
          placeholder="请输入联系电话"
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
import { showConfirmDialog, showToast } from 'vant'
import { authApi } from '../api'
import { useUserStore } from '../stores/user'
import TabBar from '../components/TabBar.vue'

const router = useRouter()
const userStore = useUserStore()

const userInfo = ref(null)
const showAddressEdit = ref(false)
const editAddress = ref('')
const editPhone = ref('')

const isMerchant = computed(() => {
  return userStore.role === 'merchant' || userStore.role === 'admin'
})

const roleText = computed(() => {
  const map = { customer: '普通用户', merchant: '商家', admin: '管理员' }
  return map[userStore.role] || '普通用户'
})

const roleBadgeClass = computed(() => {
  const cls = userStore.role === 'customer' ? 'status-paid' : 'status-preparing'
  return `order-status ${cls}`
})

async function loadProfile() {
  try {
    const res = await authApi.getProfile()
    userInfo.value = res.user
  } catch (e) {
    if (e.response && e.response.status === 401) {
      router.replace('/login')
    }
  }
}

async function saveAddress() {
  try {
    await authApi.updateProfile({
      address: editAddress.value || userInfo.value.address,
      phone: editPhone.value || userInfo.value.phone,
    })
    showToast('保存成功')
    showAddressEdit.value = false
    await userStore.fetchProfile()
    loadProfile()
  } catch (e) {}
}

async function handleLogout() {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要退出登录吗？',
    })
    userStore.logout()
    router.push('/login')
  } catch (e) {}
}

onMounted(() => {
  loadProfile()
})
</script>
