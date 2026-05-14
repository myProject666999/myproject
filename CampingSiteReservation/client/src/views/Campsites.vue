<template>
  <div class="page-container">
    <van-nav-bar title="营位列表" left-arrow @click-left="router.back()" />
    
    <van-tabs v-model:active="activeTab">
      <van-tab title="全部">
        <campsite-list :campsites="campsites" @select="selectCampsite" />
      </van-tab>
      <van-tab title="帐篷区">
        <campsite-list :campsites="tentCampsites" @select="selectCampsite" />
      </van-tab>
      <van-tab title="房车区">
        <campsite-list :campsites="rvCampsites" @select="selectCampsite" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getCampsites } from '@/api/campsites'
import CampsiteList from '@/components/CampsiteList.vue'

const router = useRouter()
const activeTab = ref(0)
const campsites = ref([])
const loading = ref(false)

const loadCampsites = async (type) => {
  try {
    loading.value = true
    const params = {}
    if (type) {
      params.type = type
    }
    const response = await getCampsites(params)
    if (response && response.success) {
      campsites.value = response.data || []
    }
  } catch (error) {
    console.error('加载营位失败:', error)
  } finally {
    loading.value = false
  }
}

const tentCampsites = computed(() => campsites.value.filter(c => c.type === 'tent'))
const rvCampsites = computed(() => campsites.value.filter(c => c.type === 'rv'))

const selectCampsite = (item) => {
  router.push('/campsite/' + item.id)
}

watch(activeTab, (newVal) => {
  if (newVal === 1) {
    loadCampsites('tent')
  } else if (newVal === 2) {
    loadCampsites('rv')
  } else {
    loadCampsites()
  }
})

onMounted(() => {
  loadCampsites()
})
</script>
