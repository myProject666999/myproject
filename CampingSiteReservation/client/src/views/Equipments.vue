<template>
  <div class="page-container">
    <van-nav-bar title="装备租赁" left-arrow @click-left="router.back()" />
    
    <van-tabs v-model:active="activeTab">
      <van-tab title="全部">
        <equipment-list :equipments="equipments" @add="addEquipment" />
      </van-tab>
      <van-tab title="帐篷">
        <equipment-list :equipments="tentEquipments" @add="addEquipment" />
      </van-tab>
      <van-tab title="桌椅">
        <equipment-list :equipments="chairEquipments" @add="addEquipment" />
      </van-tab>
      <van-tab title="其他">
        <equipment-list :equipments="otherEquipments" @add="addEquipment" />
      </van-tab>
    </van-tabs>

    <van-submit-bar
      :price="totalPrice * 100"
      button-text="加入预订"
      :disabled="selectedEquipments.length === 0"
      @submit="onSubmit"
    >
      <van-submit-bar-text>已选{{ selectedEquipments.length }}件</van-submit-bar-text>
    </van-submit-bar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getEquipments } from '@/api/equipments'
import EquipmentList from '@/components/EquipmentList.vue'

const router = useRouter()
const activeTab = ref(0)
const selectedEquipments = ref([])
const equipments = ref([])
const loading = ref(false)

const loadEquipments = async (category) => {
  try {
    loading.value = true
    const params = {}
    if (category) {
      params.category = category
    }
    const response = await getEquipments(params)
    if (response && response.success) {
      equipments.value = response.data || []
    }
  } catch (error) {
    console.error('加载装备失败:', error)
  } finally {
    loading.value = false
  }
}

const tentEquipments = computed(() => equipments.value.filter(e => e.category === 'tent'))
const chairEquipments = computed(() => equipments.value.filter(e => e.category === 'chair'))
const otherEquipments = computed(() => equipments.value.filter(e => e.category === 'other'))

const totalPrice = computed(() => {
  return selectedEquipments.value.reduce((sum, item) => {
    return sum + (item.price * item.quantity)
  }, 0)
})

const addEquipment = (equipment) => {
  const index = selectedEquipments.value.findIndex(e => e.id === equipment.id)
  if (index > -1) {
    selectedEquipments.value[index].quantity++
  } else {
    selectedEquipments.value.push({
      ...equipment,
      quantity: 1
    })
  }
  showToast('已添加')
}

const onSubmit = () => {
  router.back()
}

watch(activeTab, (newVal) => {
  if (newVal === 1) {
    loadEquipments('tent')
  } else if (newVal === 2) {
    loadEquipments('chair')
  } else if (newVal === 3) {
    loadEquipments('other')
  } else {
    loadEquipments()
  }
})

onMounted(() => {
  loadEquipments()
})
</script>
