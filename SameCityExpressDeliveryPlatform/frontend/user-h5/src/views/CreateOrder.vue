<template>
  <div class="create-order-page page-container">
    <van-nav-bar
      title="发单"
      left-arrow
      @click-left="$router.back()"
    />

    <van-form @submit="handleSubmit">
      <van-cell-group inset title="取件信息">
        <van-field
          v-model="form.pickupName"
          name="pickupName"
          label="联系人"
          placeholder="请输入取件人姓名"
          :rules="[{ required: true, message: '请输入取件人姓名' }]"
        />
        <van-field
          v-model="form.pickupPhone"
          name="pickupPhone"
          label="手机号"
          placeholder="请输入取件人手机号"
          :rules="[{ required: true, message: '请输入取件人手机号' }]"
        />
        <van-cell title="取件地址" is-link @click="showPickupMap = true">
          <template #value>
            <span :class="{ placeholder: !form.pickupAddress }">
              {{ form.pickupAddress || '请选择取件地址' }}
            </span>
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group inset title="收件信息">
        <van-field
          v-model="form.deliveryName"
          name="deliveryName"
          label="联系人"
          placeholder="请输入收件人姓名"
          :rules="[{ required: true, message: '请输入收件人姓名' }]"
        />
        <van-field
          v-model="form.deliveryPhone"
          name="deliveryPhone"
          label="手机号"
          placeholder="请输入收件人手机号"
          :rules="[{ required: true, message: '请输入收件人手机号' }]"
        />
        <van-cell title="收件地址" is-link @click="showDeliveryMap = true">
          <template #value>
            <span :class="{ placeholder: !form.deliveryAddress }">
              {{ form.deliveryAddress || '请选择收件地址' }}
            </span>
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group inset title="物品信息">
        <van-field
          name="itemType"
          label="物品类型"
          readonly
          :value="itemTypeText"
          is-link
          @click="showItemTypePicker = true"
        />
        <van-field
          v-model="form.itemName"
          name="itemName"
          label="物品名称"
          placeholder="请输入物品名称"
        />
        <van-field
          v-model="form.weight"
          name="weight"
          label="物品重量"
          placeholder="请输入重量(kg)"
          type="number"
        />
        <van-field
          v-model="form.quantity"
          name="quantity"
          label="数量"
          placeholder="请输入数量"
          type="number"
        />
        <van-field
          v-model="form.remark"
          name="remark"
          label="备注"
          type="textarea"
          placeholder="请输入备注信息"
          rows="2"
        />
      </van-cell-group>

      <van-cell-group inset v-if="priceResult">
        <van-cell title="配送距离" :value="`${priceResult.distance?.toFixed(2)} km`" />
        <van-cell title="预计时间" :value="`${priceResult.estimatedTime} 分钟`" />
        <van-cell title="基础费用" :value="`¥${priceResult.basePrice}`" />
        <van-cell title="距离费用" :value="`¥${priceResult.distancePrice}`" />
        <van-cell title="重量费用" :value="`¥${priceResult.weightPrice}`" />
        <van-cell title="时段附加费" :value="`¥${priceResult.timeSurcharge}`" />
        <van-cell title="总费用">
          <template #value>
            <span class="price-highlight" style="font-size: 20px">
              ¥{{ priceResult.totalPrice }}
            </span>
          </template>
        </van-cell>
      </van-cell-group>

      <div class="submit-section">
        <div class="price-info" v-if="priceResult">
          <span>总费用</span>
          <span class="price-highlight" style="font-size: 24px">¥{{ priceResult.totalPrice }}</span>
        </div>
        <van-button type="primary" round native-type="submit" :loading="submitting">
          确认下单
        </van-button>
      </div>
    </van-form>

    <van-popup v-model:show="showItemTypePicker" position="bottom">
      <van-picker
        :columns="itemTypeOptions"
        @confirm="onItemTypeConfirm"
        @cancel="showItemTypePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showPickupMap" position="bottom" :style="{ height: '80%' }">
      <div class="map-container">
        <div class="map-header">
          <van-nav-bar
            title="选择取件地址"
            left-arrow
            @click-left="showPickupMap = false"
          />
        </div>
        <div class="map-content">
          <van-search
            v-model="pickupSearchKeyword"
            placeholder="搜索地址"
            @search="searchPickupAddress"
          />
          <van-list
            v-model:loading="addressLoading"
            :finished="addressFinished"
            @load="loadPickupAddresses"
          >
            <van-cell
              v-for="item in pickupAddressList"
              :key="item.id"
              :title="item.name"
              :label="item.address"
              @click="selectPickupAddress(item)"
            />
          </van-list>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showDeliveryMap" position="bottom" :style="{ height: '80%' }">
      <div class="map-container">
        <div class="map-header">
          <van-nav-bar
            title="选择收件地址"
            left-arrow
            @click-left="showDeliveryMap = false"
          />
        </div>
        <div class="map-content">
          <van-search
            v-model="deliverySearchKeyword"
            placeholder="搜索地址"
            @search="searchDeliveryAddress"
          />
          <van-list
            v-model:loading="addressLoading"
            :finished="addressFinished"
            @load="loadDeliveryAddresses"
          >
            <van-cell
              v-for="item in deliveryAddressList"
              :key="item.id"
              :title="item.name"
              :label="item.address"
              @click="selectDeliveryAddress(item)"
            />
          </van-list>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { calculatePrice, createOrder } from '@/api/order'
import { getAddresses } from '@/api/address'

const route = useRoute()
const router = useRouter()

const submitting = ref(false)
const priceResult = ref<any>(null)
const showItemTypePicker = ref(false)
const showPickupMap = ref(false)
const showDeliveryMap = ref(false)

const pickupSearchKeyword = ref('')
const deliverySearchKeyword = ref('')
const pickupAddressList = ref<any[]>([])
const deliveryAddressList = ref<any[]>([])
const addressLoading = ref(false)
const addressFinished = ref(true)

const itemTypeOptions = [
  { text: '文件', value: 1 },
  { text: '鲜花', value: 2 },
  { text: '食品', value: 3 },
  { text: '其他', value: 4 }
]

const form = reactive({
  pickupName: '',
  pickupPhone: '',
  pickupAddress: '',
  pickupLongitude: 0,
  pickupLatitude: 0,
  deliveryName: '',
  deliveryPhone: '',
  deliveryAddress: '',
  deliveryLongitude: 0,
  deliveryLatitude: 0,
  itemType: 1,
  itemName: '',
  weight: 1,
  quantity: 1,
  remark: ''
})

const itemTypeText = computed(() => {
  const item = itemTypeOptions.find(opt => opt.value === form.itemType)
  return item?.text || '请选择'
})

onMounted(() => {
  const type = route.query.type
  if (type) {
    form.itemType = parseInt(type as string)
  }
  loadSavedAddresses()
})

async function loadSavedAddresses() {
  try {
    const addresses = await getAddresses()
    pickupAddressList.value = addresses
    deliveryAddressList.value = addresses
  } catch (error) {
    console.error('加载地址失败', error)
  }
}

watch(
  () => [
    form.pickupLongitude,
    form.pickupLatitude,
    form.deliveryLongitude,
    form.deliveryLatitude,
    form.weight
  ],
  async () => {
    if (
      form.pickupLongitude &&
      form.pickupLatitude &&
      form.deliveryLongitude &&
      form.deliveryLatitude
    ) {
      try {
        priceResult.value = await calculatePrice({
          pickup_longitude: form.pickupLongitude,
          pickup_latitude: form.pickupLatitude,
          delivery_longitude: form.deliveryLongitude,
          delivery_latitude: form.deliveryLatitude,
          weight: form.weight
        })
      } catch (error) {
        console.error('计算价格失败', error)
      }
    }
  },
  { deep: true }
)

function onItemTypeConfirm({ selectedOptions }: any) {
  form.itemType = selectedOptions[0].value
  showItemTypePicker.value = false
}

function selectPickupAddress(address: any) {
  form.pickupAddress = address.detail || address.address
  form.pickupLongitude = address.longitude
  form.pickupLatitude = address.latitude
  form.pickupName = address.name || form.pickupName
  form.pickupPhone = address.phone || form.pickupPhone
  showPickupMap.value = false
  calculateCurrentPrice()
}

function selectDeliveryAddress(address: any) {
  form.deliveryAddress = address.detail || address.address
  form.deliveryLongitude = address.longitude
  form.deliveryLatitude = address.latitude
  form.deliveryName = address.name || form.deliveryName
  form.deliveryPhone = address.phone || form.deliveryPhone
  showDeliveryMap.value = false
  calculateCurrentPrice()
}

async function searchPickupAddress() {
  console.log('搜索取件地址:', pickupSearchKeyword.value)
}

async function searchDeliveryAddress() {
  console.log('搜索收件地址:', deliverySearchKeyword.value)
}

async function loadPickupAddresses() {
  addressFinished.value = true
}

async function loadDeliveryAddresses() {
  addressFinished.value = true
}

async function calculateCurrentPrice() {
  if (
    form.pickupLongitude &&
    form.pickupLatitude &&
    form.deliveryLongitude &&
    form.deliveryLatitude
  ) {
    try {
      priceResult.value = await calculatePrice({
        pickup_longitude: form.pickupLongitude,
        pickup_latitude: form.pickupLatitude,
        delivery_longitude: form.deliveryLongitude,
        delivery_latitude: form.deliveryLatitude,
        weight: form.weight
      })
    } catch (error) {
      console.error('计算价格失败', error)
    }
  }
}

async function handleSubmit() {
  if (!form.pickupAddress || !form.deliveryAddress) {
    showToast('请选择取件和收件地址')
    return
  }

  if (!priceResult.value) {
    try {
      await calculateCurrentPrice()
    } catch (error) {
      showToast('计算配送费用失败，请重试')
      return
    }
  }

  if (!priceResult.value) {
    showToast('无法计算配送费用')
    return
  }

  submitting.value = true
  showLoadingToast({ message: '提交中...', forbidClick: true })

  try {
    const order = await createOrder({
      pickup_name: form.pickupName,
      pickup_phone: form.pickupPhone,
      pickup_address: form.pickupAddress,
      pickup_longitude: form.pickupLongitude,
      pickup_latitude: form.pickupLatitude,
      delivery_name: form.deliveryName,
      delivery_phone: form.deliveryPhone,
      delivery_address: form.deliveryAddress,
      delivery_longitude: form.deliveryLongitude,
      delivery_latitude: form.deliveryLatitude,
      item_type: form.itemType,
      item_name: form.itemName,
      weight: form.weight,
      item_value: 0,
      quantity: form.quantity,
      remark: form.remark
    })

    showToast('下单成功')
    router.replace({ name: 'OrderDetail', params: { id: order.id } })
  } catch (error: any) {
    showToast(error.message || '下单失败')
  } finally {
    closeToast()
    submitting.value = false
  }
}
</script>

<style scoped>
.create-order-page {
  padding-bottom: 100px;
}

.placeholder {
  color: #c8c9cc;
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 15px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-info {
  display: flex;
  flex-direction: column;
}

.price-info span:first-child {
  font-size: 12px;
  color: #969799;
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
