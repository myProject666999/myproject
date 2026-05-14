<template>
  <div class="page-container">
    <van-nav-bar title="活动报名" left-arrow @click-left="router.back()" />
    
    <van-tabs v-model:active="activeTab">
      <van-tab title="全部">
        <activity-list :activities="activities" @select="selectActivity" @register="onRegisterClick" />
      </van-tab>
      <van-tab title="餐饮">
        <activity-list :activities="diningActivities" @select="selectActivity" @register="onRegisterClick" />
      </van-tab>
      <van-tab title="活动">
        <activity-list :activities="eventActivities" @select="selectActivity" @register="onRegisterClick" />
      </van-tab>
    </van-tabs>

    <van-popup v-model:show="showRegisterPopup" position="bottom" :style="{ height: '50%' }" round>
      <div class="register-popup">
        <div class="popup-header">
          <h3>活动报名</h3>
          <van-icon name="cross" @click="showRegisterPopup = false" />
        </div>
        
        <div class="activity-info">
          <div class="activity-name">{{ currentActivity?.name }}</div>
          <div class="activity-price" v-if="currentActivity?.price > 0">
            ¥{{ currentActivity?.price }}/人
          </div>
          <div class="activity-price" v-else>
            免费
          </div>
          <div class="activity-desc">{{ currentActivity?.description }}</div>
        </div>

        <div class="register-form">
          <van-field
            v-model="registerForm.participants"
            type="number"
            label="报名人数"
            placeholder="请输入人数"
            :rules="[{ required: true, message: '请输入报名人数' }]"
          />
          <van-field
            v-model="registerForm.contactName"
            label="联系人"
            placeholder="请输入姓名"
            :rules="[{ required: true, message: '请输入联系人姓名' }]"
          />
          <van-field
            v-model="registerForm.contactPhone"
            type="tel"
            label="联系电话"
            placeholder="请输入手机号"
            maxlength="11"
            :rules="[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1\d{10}$/, message: '手机号格式不正确' }
            ]"
          />
        </div>

        <van-button 
          type="primary" 
          block 
          size="large" 
          :loading="submitting"
          :disabled="!isLogin"
          @click="onSubmitRegister"
        >
          {{ isLogin ? (currentActivity?.price > 0 ? '立即报名' : '免费报名') : '请先登录' }}
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getActivities } from '@/api/activities'
import { useUserStore } from '@/stores/user'
import ActivityList from '@/components/ActivityList.vue'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref(0)
const activities = ref([])
const loading = ref(false)
const showRegisterPopup = ref(false)
const currentActivity = ref(null)
const submitting = ref(false)

const registerForm = reactive({
  participants: 1,
  contactName: '',
  contactPhone: ''
})

const isLogin = computed(() => userStore.isLogin)

const loadActivities = async (type) => {
  try {
    loading.value = true
    const params = {}
    if (type) {
      params.type = type
    }
    const response = await getActivities(params)
    if (response && response.success) {
      activities.value = response.data || []
    }
  } catch (error) {
    console.error('加载活动失败:', error)
  } finally {
    loading.value = false
  }
}

const diningActivities = computed(() => activities.value.filter(a => a.type === 'dining'))
const eventActivities = computed(() => activities.value.filter(a => a.type !== 'dining'))

const selectActivity = (activity) => {
  console.log('选择活动:', activity.name)
}

const onRegisterClick = (activity) => {
  console.log('点击报名:', activity.name)
  currentActivity.value = activity
  registerForm.participants = 1
  registerForm.contactName = userStore.userInfo?.nickname || ''
  registerForm.contactPhone = userStore.userInfo?.phone || ''
  showRegisterPopup.value = true
}

const onSubmitRegister = async () => {
  if (!isLogin.value) {
    showToast('请先登录')
    router.push('/profile')
    return
  }

  if (!registerForm.participants || registerForm.participants < 1) {
    showToast('请输入报名人数')
    return
  }
  if (!registerForm.contactName.trim()) {
    showToast('请输入联系人姓名')
    return
  }
  if (!/^1\d{10}$/.test(registerForm.contactPhone)) {
    showToast('手机号格式不正确')
    return
  }

  try {
    submitting.value = true
    
    showToast('报名成功！')
    showRegisterPopup.value = false
  } catch (error) {
    console.error('报名失败:', error)
    showToast('报名失败，请重试')
  } finally {
    submitting.value = false
  }
}

watch(activeTab, (newVal) => {
  if (newVal === 1) {
    loadActivities('dining')
  } else if (newVal === 2) {
    loadActivities('other')
  } else {
    loadActivities()
  }
})

onMounted(() => {
  userStore.restoreLogin()
  loadActivities()
})
</script>

<style scoped>
.register-popup {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.popup-header h3 {
  margin: 0;
  font-size: 18px;
  color: #323233;
}

.activity-info {
  background: #f7f8fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.activity-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 8px;
}

.activity-price {
  font-size: 20px;
  font-weight: 600;
  color: #ee0a24;
  margin-bottom: 8px;
}

.activity-desc {
  font-size: 14px;
  color: #969799;
  line-height: 1.5;
}

.register-form {
  flex: 1;
  margin-bottom: 16px;
}
</style>
