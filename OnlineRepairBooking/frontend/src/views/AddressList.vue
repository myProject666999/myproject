<template>
  <div class="address-list page-container">
    <van-nav-bar
      title="地址管理"
      left-arrow
      @click-left="onBack"
    >
      <template #right>
        <van-icon name="plus" size="20" @click="goToAdd" />
      </template>
    </van-nav-bar>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="page-content">
        <van-swipe-cell
          v-for="address in addresses"
          :key="address.id"
          :right-width="160"
          class="mb-12"
        >
          <div class="address-card card" @click="onSelect(address)">
            <div class="address-header flex-between">
              <div class="contact-info">
                <span class="contact-name">{{ address.name }}</span>
                <span class="contact-phone ml-12">{{ address.phone }}</span>
                <van-tag v-if="address.isDefault" type="primary" plain size="small" class="ml-8">默认</van-tag>
              </div>
            </div>
            <div class="address-detail mt-8">
              {{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}
            </div>
            <div class="address-actions flex-between mt-12 pt-12" style="border-top: 1px solid #ebedf0;">
              <van-radio-group v-model="defaultAddressId" @change="onSetDefault(address.id)">
                <van-radio :name="address.id">设为默认</van-radio>
              </van-radio-group>
              <div class="action-buttons">
                <van-button size="small" type="default" @click.stop="goToEdit(address)">编辑</van-button>
              </div>
            </div>
          </div>

          <template #right>
            <van-button square type="danger" text="删除" @click="deleteAddress(address)" />
          </template>
        </van-swipe-cell>

        <van-empty v-if="addresses.length === 0 && !loading" description="暂无地址，点击右上角添加" />

        <div style="height: 80px;"></div>
      </div>
    </van-pull-refresh>

    <div class="footer-bar">
      <van-button type="primary" block icon="plus" @click="goToAdd">新增收货地址</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { getAddressList, deleteAddress as deleteAddressApi, setDefaultAddress } from '@/api/address'

const route = useRoute()
const router = useRouter()

const addresses = ref([])
const loading = ref(false)
const refreshing = ref(false)
const isSelectMode = computed(() => route.query.select === 'true')

const defaultAddressId = computed({
  get: () => {
    const defaultAddr = addresses.value.find(a => a.isDefault)
    return defaultAddr?.id || null
  },
  set: () => {}
})

const onBack = () => {
  router.back()
}

const goToAdd = () => {
  router.push('/address/edit')
}

const goToEdit = (address) => {
  router.push(`/address/edit?id=${address.id}`)
}

const onSelect = (address) => {
  if (isSelectMode.value) {
    sessionStorage.setItem('selectedAddress', JSON.stringify(address))
    router.back()
  }
}

const onSetDefault = async (id) => {
  try {
    await setDefaultAddress(id)
    addresses.value.forEach(addr => {
      addr.isDefault = addr.id === id
    })
    showToast('设置成功')
  } catch (e) {
    console.error('设置默认地址失败', e)
  }
}

const deleteAddress = async (address) => {
  try {
    await showDialog({
      title: '提示',
      message: '确定要删除该地址吗？'
    })
    
    await deleteAddressApi(address.id)
    addresses.value = addresses.value.filter(a => a.id !== address.id)
    showToast('删除成功')
  } catch (e) {
    if (e !== 'cancel') {
      console.error('删除地址失败', e)
    }
  }
}

const fetchAddresses = async () => {
  loading.value = true
  try {
    const res = await getAddressList()
    addresses.value = res.list || res.addresses || []
  } catch (e) {
    showToast('获取地址列表失败')
  } finally {
    loading.value = false
  }
}

const onRefresh = () => {
  fetchAddresses().finally(() => {
    refreshing.value = false
  })
}

onMounted(() => {
  fetchAddresses()
})
</script>

<style lang="scss" scoped>
.address-card {
  cursor: pointer;

  .contact-info {
    .contact-name {
      font-size: 15px;
      font-weight: 500;
      color: #323233;
    }

    .contact-phone {
      font-size: 14px;
      color: #646566;
    }
  }

  .address-detail {
    font-size: 14px;
    color: #646566;
    line-height: 1.5;
  }

  .address-actions {
    .action-buttons {
      display: flex;
      gap: 8px;
    }
  }
}

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.mb-12 {
  margin-bottom: 12px;
}

.ml-8 {
  margin-left: 8px;
}

.ml-12 {
  margin-left: 12px;
}

.mt-8 {
  margin-top: 8px;
}

.mt-12 {
  margin-top: 12px;
}

.pt-12 {
  padding-top: 12px;
}
</style>
