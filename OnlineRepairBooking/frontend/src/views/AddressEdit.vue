<template>
  <div class="address-edit page-container">
    <van-nav-bar
      :title="isEdit ? '编辑地址' : '新增地址'"
      left-arrow
      @click-left="onBack"
    />

    <van-form @submit="onSubmit" class="page-content">
      <van-cell-group inset>
        <van-field
          v-model="form.name"
          label="收货人"
          placeholder="请输入收货人姓名"
          :rules="[{ required: true, message: '请输入收货人姓名' }]"
        />
        <van-field
          v-model="form.phone"
          label="手机号"
          placeholder="请输入手机号"
          type="tel"
          :rules="[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
          ]"
        />
        <van-field
          v-model="regionText"
          label="所在地区"
          placeholder="请选择省/市/区"
          readonly
          is-link
          @click="showArea = true"
          :rules="[{ required: true, message: '请选择所在地区' }]"
        />
        <van-field
          v-model="form.detail"
          label="详细地址"
          placeholder="请输入详细地址"
          type="textarea"
          autosize
          :rules="[{ required: true, message: '请输入详细地址' }]"
        />
      </van-cell-group>

      <van-cell-group inset class="mt-12">
        <van-cell title="设为默认地址">
          <template #right-icon>
            <van-switch v-model="form.isDefault" size="24" />
          </template>
        </van-cell>
      </van-cell-group>

      <div class="submit-area">
        <van-button type="primary" native-type="submit" block size="large">
          {{ isEdit ? '保存修改' : '保存地址' }}
        </van-button>
      </div>
    </van-form>

    <van-area
      v-model:show="showArea"
      :area-list="areaList"
      :columns-num="3"
      title="选择地区"
      @confirm="onAreaConfirm"
      @cancel="showArea = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { createAddress, updateAddress, getAddressList } from '@/api/address'
import areaList from '@/utils/area'

const route = useRoute()
const router = useRouter()

const addressId = computed(() => route.query.id)
const isEdit = computed(() => !!addressId.value)

const form = reactive({
  id: null,
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

const regionText = ref('')
const showArea = ref(false)
const loading = ref(false)

const loadAddressDetail = async () => {
  if (!isEdit.value) return

  loading.value = true
  try {
    const res = await getAddressList()
    const addresses = res.list || res.addresses || []
    const address = addresses.find(a => a.id === Number(addressId.value))
    
    if (address) {
      form.id = address.id
      form.name = address.name
      form.phone = address.phone
      form.province = address.province
      form.city = address.city
      form.district = address.district
      form.detail = address.detail
      form.isDefault = address.isDefault
      regionText.value = `${address.province}${address.city}${address.district}`
    }
  } catch (e) {
    showToast('获取地址详情失败')
  } finally {
    loading.value = false
  }
}

const onAreaConfirm = (values) => {
  form.province = values[0]?.name || ''
  form.city = values[1]?.name || ''
  form.district = values[2]?.name || ''
  regionText.value = `${form.province}${form.city}${form.district}`
  showArea.value = false
}

const onBack = () => {
  router.back()
}

const onSubmit = async () => {
  if (!form.province || !form.city || !form.district) {
    showToast('请选择所在地区')
    return
  }

  try {
    const data = {
      name: form.name,
      phone: form.phone,
      province: form.province,
      city: form.city,
      district: form.district,
      detail: form.detail,
      isDefault: form.isDefault
    }

    if (isEdit.value) {
      await updateAddress(form.id, data)
      showToast('修改成功')
    } else {
      await createAddress(data)
      showToast('添加成功')
    }

    router.back()
  } catch (e) {
    console.error('保存地址失败', e)
  }
}

onMounted(() => {
  loadAddressDetail()
})
</script>

<style lang="scss" scoped>
.address-edit {
  background-color: #f7f8fa;
  min-height: 100vh;
}

.page-content {
  padding: 12px 0;
}

.submit-area {
  padding: 16px;
}

.mt-12 {
  margin-top: 12px;
}
</style>
