<template>
  <div class="page-container">
    <van-nav-bar title="预约上门" left-arrow @click-left="router.back()" fixed placeholder />

    <div class="content-wrapper">
      <div class="estimate-summary">
        <div class="summary-row">
          <span class="label">回收品类</span>
          <span class="value">{{ estimateInfo.categoryName }}</span>
        </div>
        <div class="summary-row">
          <span class="label">预估数量</span>
          <span class="value">{{ estimateInfo.quantity }}</span>
        </div>
        <div class="summary-row">
          <span class="label">预估价格</span>
          <span class="price">¥{{ estimateInfo.estimatedPrice }}</span>
        </div>
      </div>

      <div class="section-title">选择地址</div>
      <van-cell-group inset>
        <van-cell
          v-for="addr in addresses"
          :key="addr.id"
          :title="addr.name + ' ' + addr.phone"
          :value="addr.province + addr.city + addr.district + addr.detailAddress"
          :is-link="false"
          @click="selectAddress(addr)"
        >
          <template #icon>
            <van-radio
              :name="addr.id"
              :checked="selectedAddressId === addr.id"
            />
          </template>
          <template #right-icon>
            <van-tag v-if="addr.isDefault" type="primary" plain>默认</van-tag>
          </template>
        </van-cell>
        <van-cell
          title="添加新地址"
          is-link
          @click="showAddAddress = true"
        >
          <template #icon>
            <van-icon name="plus" color="#07c160" />
          </template>
        </van-cell>
      </van-cell-group>

      <div class="section-title">预约时间</div>
      <van-cell-group inset>
        <van-cell title="选择时间" :value="appointmentTime || '请选择'" is-link @click="showPicker = true" />
      </van-cell-group>

      <div class="button-group">
        <van-button type="primary" block round @click="submitOrder">
          确认预约
        </van-button>
      </div>
    </div>

    <van-popup
      v-model:show="showPicker"
      position="bottom"
      round
      :style="{ height: '50%' }"
    >
      <van-datetime-picker
        v-model="currentDate"
        type="datetime"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onTimeConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>

    <van-popup
      v-model:show="showAddAddress"
      position="bottom"
      round
      :style="{ height: '80%' }"
    >
      <van-nav-bar title="添加地址" left-arrow @click-left="showAddAddress = false" />
      <van-form @submit="addAddress">
        <van-cell-group inset>
          <van-field
            v-model="newAddress.name"
            label="联系人"
            placeholder="请输入联系人姓名"
            :rules="[{ required: true, message: '请填写联系人' }]"
          />
          <van-field
            v-model="newAddress.phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]"
          />
          <van-field
            v-model="newAddress.province"
            label="省"
            placeholder="请输入省"
          />
          <van-field
            v-model="newAddress.city"
            label="市"
            placeholder="请输入市"
          />
          <van-field
            v-model="newAddress.district"
            label="区"
            placeholder="请输入区"
          />
          <van-field
            v-model="newAddress.detailAddress"
            label="详细地址"
            placeholder="请输入详细地址"
            :rules="[{ required: true, message: '请填写详细地址' }]"
          />
        </van-cell-group>
        <div class="form-footer">
          <van-button type="primary" round block native-type="submit">
            保存地址
          </van-button>
        </div>
      </van-form>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { orderApi, addressApi } from '@/api'

const router = useRouter()

const estimateInfo = ref(JSON.parse(localStorage.getItem('estimateInfo') || '{}'))
const addresses = ref([])
const selectedAddressId = ref(null)
const appointmentTime = ref(null)
const currentDate = ref(new Date())
const showPicker = ref(false)
const showAddAddress = ref(false)

const newAddress = ref({
  name: '',
  phone: '',
  province: '北京市',
  city: '北京市',
  district: '朝阳区',
  detailAddress: ''
})

const minDate = new Date()
const maxDate = new Date()
maxDate.setDate(maxDate.getDate() + 30)

const loadAddresses = async () => {
  try {
    const res = await addressApi.list()
    addresses.value = res.data || []
    const defaultAddr = addresses.value.find(a => a.isDefault)
    if (defaultAddr) {
      selectedAddressId.value = defaultAddr.id
    } else if (addresses.value.length > 0) {
      selectedAddressId.value = addresses.value[0].id
    }
  } catch (e) {
    showToast('加载地址失败')
  }
}

const selectAddress = (addr) => {
  selectedAddressId.value = addr.id
}

const onTimeConfirm = ({ selectedOptions }) => {
  appointmentTime.value = selectedOptions.join('-').replace(/-(\d+)-/, ' $1 ') + ':00'
  showPicker.value = false
}

const addAddress = async () => {
  try {
    showLoadingToast({ message: '保存中...', duration: 0 })
    await addressApi.add(newAddress.value)
    closeToast()
    showToast('保存成功')
    showAddAddress.value = false
    loadAddresses()
  } catch (e) {
    closeToast()
  }
}

const submitOrder = async () => {
  if (!selectedAddressId.value) {
    showToast('请选择地址')
    return
  }
  if (!appointmentTime.value) {
    showToast('请选择预约时间')
    return
  }

  try {
    showLoadingToast({ message: '提交中...', duration: 0 })
    await orderApi.create({
      categoryId: estimateInfo.value.categoryId,
      addressId: selectedAddressId.value,
      quantity: estimateInfo.value.quantity,
      estimatedPrice: estimateInfo.value.estimatedPrice,
      description: estimateInfo.value.description,
      images: estimateInfo.value.images,
      appointmentTime: appointmentTime.value
    })
    closeToast()
    showToast('预约成功')
    localStorage.removeItem('estimateInfo')
    router.push('/orders')
  } catch (e) {
    closeToast()
  }
}

onMounted(() => {
  loadAddresses()
})
</script>

<style lang="less" scoped>
.estimate-summary {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    
    .label {
      color: #969799;
      font-size: 14px;
    }
    
    .value {
      font-size: 14px;
    }
    
    .price {
      color: #07c160;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.section-title {
  padding: 16px 0 8px;
  font-size: 15px;
  font-weight: 600;
}

.button-group {
  padding: 24px 0;
}

.form-footer {
  padding: 16px;
}
</style>
