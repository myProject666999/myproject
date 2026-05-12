<template>
  <div class="address-list-page page-container">
    <van-nav-bar
      title="地址管理"
      left-arrow
      @click-left="$router.back()"
    >
      <template #right>
        <van-icon name="plus" size="22" @click="addAddress" />
      </template>
    </van-nav-bar>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell-group v-for="address in addresses" :key="address.id" inset style="margin: 10px 15px">
          <van-cell
            :title="`${address.name} ${address.phone}`"
            :value="address.is_default ? '默认' : ''"
          />
          <van-cell :value="address.detail" />
          <van-cell>
            <template #default>
              <van-button type="primary" size="small" plain @click="editAddress(address)">
                编辑
              </van-button>
              <van-button
                type="primary"
                size="small"
                plain
                style="margin-left: 10px"
                @click="setDefault(address.id)"
              >
                设为默认
              </van-button>
              <van-button
                type="danger"
                size="small"
                plain
                style="margin-left: 10px"
                @click="deleteAddress(address.id)"
              >
                删除
              </van-button>
            </template>
          </van-cell>
        </van-cell-group>

        <van-empty v-if="addresses.length === 0 && !loading" description="暂无地址" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getAddresses, deleteAddress as deleteAddr, setDefaultAddress } from '@/api/address'

const router = useRouter()

const addresses = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

function addAddress() {
  router.push('/address/edit')
}

function editAddress(address: any) {
  router.push({
    path: '/address/edit',
    query: { id: address.id.toString() }
  })
}

async function setDefault(id: number) {
  try {
    await setDefaultAddress(id)
    showToast('设置成功')
    loadAddresses()
  } catch (error: any) {
    showToast(error.message || '设置失败')
  }
}

async function deleteAddress(id: number) {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要删除该地址吗？'
    })
    await deleteAddr(id)
    showToast('删除成功')
    loadAddresses()
  } catch (error: any) {
    if (error !== 'cancel') {
      showToast(error.message || '删除失败')
    }
  }
}

async function loadAddresses() {
  loading.value = true
  try {
    addresses.value = await getAddresses()
    finished.value = true
  } catch (error) {
    console.error('加载地址失败', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function onRefresh() {
  await loadAddresses()
}

async function onLoad() {
  await loadAddresses()
}

onMounted(() => {
  loadAddresses()
})
</script>

<style scoped>
.address-list-page {
  padding-bottom: 20px;
}
</style>
