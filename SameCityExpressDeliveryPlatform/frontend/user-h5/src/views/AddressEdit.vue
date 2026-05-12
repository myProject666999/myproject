<template>
  <div class="address-edit-page page-container">
    <van-nav-bar
      title="编辑地址"
      left-arrow
      @click-left="$router.back()"
    />

    <van-form @submit="handleSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.name"
          name="name"
          label="收货人"
          placeholder="请输入收货人姓名"
          :rules="[{ required: true, message: '请输入收货人姓名' }]"
        />
        <van-field
          v-model="form.phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          :rules="[{ required: true, message: '请输入手机号' }]"
        />
        <van-cell
          title="所在地区"
          is-link
          @click="showAreaPicker = true"
          :value="form.province ? `${form.province} ${form.city} ${form.district}` : '请选择省市区'"
        />
        <van-field
          v-model="form.detail"
          name="detail"
          label="详细地址"
          type="textarea"
          placeholder="请输入详细地址"
          rows="2"
          :rules="[{ required: true, message: '请输入详细地址' }]"
        />
        <van-cell title="地图选点" is-link @click="showMap = true">
          <template #value>
            <span :class="{ placeholder: !form.longitude }">
              {{ form.longitude ? '已选择' : '请在地图上选择位置' }}
            </span>
          </template>
        </van-cell>
        <van-field
          v-model="form.tag"
          name="tag"
          label="标签"
          placeholder="家 / 公司 / 其他"
        />
        <van-cell title="设为默认地址">
          <template #right-icon>
            <van-switch v-model="form.is_default" />
          </template>
        </van-cell>
      </van-cell-group>

      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          保存
        </van-button>
      </div>
    </van-form>

    <van-area
      v-model:show="showAreaPicker"
      :area-list="areaList"
      @confirm="onAreaConfirm"
      @cancel="showAreaPicker = false"
    />

    <van-popup v-model:show="showMap" position="bottom" :style="{ height: '80%' }">
      <div class="map-container">
        <div class="map-header">
          <van-nav-bar
            title="选择位置"
            left-arrow
            @click-left="showMap = false"
          />
        </div>
        <div class="map-content">
          <p style="padding: 20px; text-align: center; color: #969799">
            地图组件占位
            <br />
            实际项目中集成高德/百度地图
          </p>
          <div style="padding: 0 20px">
            <van-field
              v-model="mapForm.longitude"
              label="经度"
              placeholder="示例：116.397428"
              type="number"
            />
            <van-field
              v-model="mapForm.latitude"
              label="纬度"
              placeholder="示例：39.90923"
              type="number"
            />
            <van-button type="primary" block @click="confirmMapLocation" style="margin-top: 20px">
              确认选择
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { createAddress, updateAddress, getAddresses } from '@/api/address'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const showAreaPicker = ref(false)
const showMap = ref(false)

const areaList = {
  province_list: {
    110000: '北京市',
    310000: '上海市',
    440000: '广东省',
    330000: '浙江省',
    320000: '江苏省'
  },
  city_list: {
    110100: '北京市',
    310100: '上海市',
    440100: '广州市',
    440300: '深圳市',
    330100: '杭州市',
    320100: '南京市'
  },
  county_list: {
    110101: '东城区',
    110102: '西城区',
    110105: '朝阳区',
    310101: '黄浦区',
    310104: '徐汇区',
    440103: '荔湾区',
    440303: '罗湖区',
    330102: '上城区',
    320102: '玄武区'
  }
}

const form = reactive({
  id: 0,
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  longitude: 0,
  latitude: 0,
  tag: '',
  is_default: false
})

const mapForm = reactive({
  longitude: '',
  latitude: ''
})

function onAreaConfirm({ selectedOptions }: any) {
  form.province = selectedOptions[0]?.text || ''
  form.city = selectedOptions[1]?.text || ''
  form.district = selectedOptions[2]?.text || ''
  showAreaPicker.value = false
}

function confirmMapLocation() {
  form.longitude = parseFloat(mapForm.longitude) || 0
  form.latitude = parseFloat(mapForm.latitude) || 0
  showMap.value = false
}

async function handleSubmit() {
  if (!form.longitude || !form.latitude) {
    showToast('请选择地图位置')
    return
  }

  loading.value = true
  try {
    if (form.id) {
      await updateAddress(form)
    } else {
      await createAddress(form)
    }
    showToast('保存成功')
    router.back()
  } catch (error: any) {
    showToast(error.message || '保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const id = route.query.id
  if (id) {
    try {
      const addresses = await getAddresses()
      const address = addresses.find((a: any) => a.id === parseInt(id as string))
      if (address) {
        Object.assign(form, address)
        mapForm.longitude = address.longitude.toString()
        mapForm.latitude = address.latitude.toString()
      }
    } catch (error) {
      console.error('加载地址失败', error)
    }
  }
})
</script>

<style scoped>
.address-edit-page {
  padding-bottom: 20px;
}

.placeholder {
  color: #c8c9cc;
}

.map-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-content {
  flex: 1;
  overflow-y: auto;
}
</style>
