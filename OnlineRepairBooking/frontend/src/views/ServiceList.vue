<template>
  <div class="service-list">
    <van-nav-bar
      title="服务列表"
      fixed
      placeholder
      @click-left="onClickLeft"
    >
      <template #right>
        <van-icon name="search" size="20" @click="showSearch = !showSearch" />
      </template>
    </van-nav-bar>

    <van-search
      v-if="showSearch"
      v-model="keyword"
      placeholder="搜索服务"
      shape="round"
      @search="onSearch"
      @clear="onSearch"
      class="search-bar"
    />

    <van-tabs
      v-model:active="activeCategory"
      sticky
      :offset-top="showSearch ? 104 : 52"
      class="category-tabs"
      @change="onCategoryChange"
    >
      <van-tab title="全部" name="0" />
      <van-tab
        v-for="category in categories"
        :key="category.id"
        :title="category.name"
        :name="String(category.id)"
      />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        :immediate-check="false"
        class="service-content"
      >
        <ServiceCard
          v-for="service in services"
          :key="service.id"
          :service="service"
        />
        <van-empty v-if="!loading && services.length === 0" description="暂无服务" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getCategories, getServices } from '@/api/service'
import ServiceCard from '@/components/ServiceCard.vue'

const router = useRouter()
const route = useRoute()

const showSearch = ref(false)
const keyword = ref('')
const categories = ref([])
const services = ref([])
const activeCategory = ref('0')
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10

const loadCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res.list || res || []
  } catch (err) {
    showToast('加载分类失败')
  }
}

const loadServices = async (reset = false) => {
  if (reset) {
    page.value = 1
    finished.value = false
    services.value = []
  }
  try {
    const params = {
      page: page.value,
      pageSize
    }
    if (activeCategory.value !== '0') {
      params.categoryId = activeCategory.value
    }
    if (keyword.value) {
      params.keyword = keyword.value
    }
    const res = await getServices(params)
    const list = res.list || res || []
    services.value = [...services.value, ...list]
    if (list.length < pageSize) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (err) {
    showToast('加载服务失败')
  }
}

const onRefresh = async () => {
  refreshing.value = true
  await loadServices(true)
  refreshing.value = false
}

const onLoad = async () => {
  await loadServices(false)
  loading.value = false
}

const onCategoryChange = () => {
  loadServices(true)
}

const onSearch = () => {
  loadServices(true)
}

const onClickLeft = () => {
  router.back()
}

onMounted(async () => {
  await loadCategories()
  if (route.query.categoryId) {
    activeCategory.value = String(route.query.categoryId)
  }
  if (route.query.keyword) {
    keyword.value = route.query.keyword
    showSearch.value = true
  }
  loadServices(true)
})

watch(() => route.query, (query) => {
  if (query.categoryId) {
    activeCategory.value = String(query.categoryId)
  }
  if (query.keyword) {
    keyword.value = query.keyword
    showSearch.value = true
  }
  loadServices(true)
})
</script>

<style lang="scss" scoped>
.service-list {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.search-bar {
  position: sticky;
  top: 52px;
  z-index: 100;
  padding: 8px 12px;
  background-color: #fff;
}

.category-tabs {
  :deep(.van-tabs__content) {
    display: none;
  }
}

.service-content {
  padding: 12px;
}
</style>
