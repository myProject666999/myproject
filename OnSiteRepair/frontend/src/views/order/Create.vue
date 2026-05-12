<template>
  <div class="page-container">
    <van-nav-bar title="报修下单" left-text="返回" @click-left="onClickLeft" />
    
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.category"
          readonly
          label="维修类别"
          placeholder="请选择维修类别"
          is-link
          @click="showCategory = true"
        />
        <van-field
          v-model="form.faultType"
          label="故障类型"
          placeholder="请输入故障类型"
          :rules="[{ required: true, message: '请输入故障类型' }]"
        />
        <van-field
          v-model="form.faultDesc"
          type="textarea"
          label="故障描述"
          placeholder="请详细描述故障情况"
          autosize
          :rules="[{ required: true, message: '请输入故障描述' }]"
        />
      </van-cell-group>

      <van-cell-group inset title="故障图片">
        <van-uploader v-model="form.images" multiple :max-count="9" />
      </van-cell-group>

      <van-cell-group inset title="故障视频">
        <van-uploader v-model="form.video" :max-count="1" accept="video/*" />
      </van-cell-group>

      <van-cell-group inset title="联系信息">
        <van-field
          v-model="form.contactName"
          label="联系人"
          placeholder="请输入联系人姓名"
          :rules="[{ required: true, message: '请输入联系人' }]"
        />
        <van-field
          v-model="form.contactPhone"
          label="联系电话"
          placeholder="请输入联系电话"
          :rules="[{ required: true, message: '请输入联系电话' }]"
        />
        <van-field
          v-model="form.address"
          readonly
          label="服务地址"
          placeholder="请选择服务地址"
          is-link
          @click="getLocation"
        />
      </van-cell-group>

      <van-cell-group inset>
        <van-field
          v-model="form.appointmentTime"
          type="datetime"
          label="预约时间"
          readonly
          placeholder="请选择预约时间"
          is-link
          @click="showTimePicker = true"
        />
      </van-cell-group>

      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          提交报修
        </van-button>
      </div>
    </van-form>

    <van-popup v-model:show="showCategory" position="bottom">
      <van-picker
        :columns="categories"
        @confirm="onConfirmCategory"
        @cancel="showCategory = false"
      />
    </van-popup>

    <van-popup v-model:show="showTimePicker" position="bottom">
      <van-datetime-picker
        v-model="currentDate"
        type="datetime"
        :min-date="minDate"
        @confirm="onConfirmTime"
        @cancel="showTimePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { createOrder } from '@/api/order'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const showCategory = ref(false)
const showTimePicker = ref(false)
const currentDate = ref(new Date())
const minDate = new Date()

const categories = [
  { text: '家电维修', value: '家电' },
  { text: '水电维修', value: '水电' }
]

const form = reactive({
  category: route.query.category || '',
  faultType: '',
  faultDesc: '',
  images: [],
  video: [],
  contactName: '',
  contactPhone: '',
  address: '',
  latitude: null,
  longitude: null,
  appointmentTime: ''
})

const onClickLeft = () => {
  router.back()
}

const onConfirmCategory = ({ selectedOptions }) => {
  form.category = selectedOptions[0].value
  showCategory.value = false
}

const onConfirmTime = ({ selectedValues }) => {
  form.appointmentTime = selectedValues
  showTimePicker.value = false
}

const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.latitude = position.coords.latitude
        form.longitude = position.coords.longitude
        form.address = '当前位置'
        showToast('定位成功')
      },
      () => {
        showToast('定位失败，请手动输入地址')
      }
    )
  } else {
    showToast('您的浏览器不支持定位')
  }
}

const onSubmit = async () => {
  try {
    loading.value = true
    showLoadingToast({ message: '提交中...', duration: 0 })
    
    const images = form.images.map(img => img.content || img.url).join(',')
    const video = form.video[0]?.content || form.video[0]?.url || ''
    
    await createOrder({
      category: form.category,
      faultType: form.faultType,
      faultDesc: form.faultDesc,
      images,
      video,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      address: form.address,
      latitude: form.latitude,
      longitude: form.longitude,
      appointmentTime: form.appointmentTime
    })
    
    closeToast()
    showToast('提交成功')
    router.replace('/orders')
  } catch (e) {
    closeToast()
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>
