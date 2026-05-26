<template>
  <div class="home">
    <van-nav-bar title="在线维修预约" fixed placeholder>
      <template #right>
        <van-icon name="user-o" size="20" @click="goToProfile" />
      </template>
    </van-nav-bar>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        :immediate-check="false"
      >
        <van-search
          v-model="searchValue"
          placeholder="搜索维修服务"
          shape="round"
          @search="onSearch"
          class="search-bar"
        />

        <div class="section categories-section">
          <div class="section-title">服务分类</div>
          <van-grid :column-num="4" :border="false">
            <van-grid-item
              v-for="category in categories"
              :key="category.id"
              :icon="category.icon || 'wap-home-o'"
              :text="category.name"
              @click="goToServiceList(category.id)"
            />
          </van-grid>
        </div>

        <div class="section">
          <div class="section-header">
            <div class="section-title">推荐服务</div>
            <van-button type="default" size="small" plain @click="goToServiceList()">
              查看更多
            </van-button>
          </div>
          <ServiceCard
            v-for="service in services"
            :key="service.id"
            :service="service"
          />
        </div>

        <div class="section workers-section">
          <div class="section-header">
            <div class="section-title">优秀师傅</div>
            <van-button type="default" size="small" plain>
              查看更多
            </van-button>
          </div>
          <div class="workers-list">
            <van-cell
              v-for="worker in workers"
              :key="worker.id"
              :title="worker.name"
              :label="worker.skill"
              :value="`评分 ${worker.rating || 5.0}`"
              is-link
              @click="goToWorkerDetail(worker.id)"
            >
              <template #icon>
                <van-image
                  round
                  width="48"
                  height="48"
                  :src="worker.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
                />
              </template>
              <template #right-icon>
                <van-rate v-model="worker.rating" readonly size="14" color="#ffd21e" />
              </template>
            </van-cell>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getCategories, getServices } from '@/api/service'
import { getWorkerList } from '@/api/worker'
import ServiceCard from '@/components/ServiceCard.vue'

const router = useRouter()
const searchValue = ref('')
const categories = ref([])
const services = ref([])
const workers = ref([])
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
    const res = await getServices({
      page: page.value,
      pageSize,
      sort: 'recommend'
    })
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

const loadWorkers = async () => {
  try {
    const res = await getWorkerList({
      page: 1,
      pageSize: 5,
      sort: 'rating'
    })
    workers.value = res.list || res || []
  } catch (err) {
    showToast('加载师傅列表失败')
  }
}

const onRefresh = async () => {
  refreshing.value = true
  await Promise.all([
    loadCategories(),
    loadServices(true),
    loadWorkers()
  ])
  refreshing.value = false
}

const onLoad = async () => {
  await loadServices(false)
  loading.value = false
}

const onSearch = () => {
  if (searchValue.value.trim()) {
    router.push({
      path: '/services',
      query: { keyword: searchValue.value }
    })
  }
}

const goToServiceList = (categoryId) => {
  const query = categoryId ? { categoryId } : {}
  router.push({ path: '/services', query })
}

const goToWorkerDetail = (workerId) => {
  router.push(`/worker/${workerId}`)
}

const goToProfile = () => {
  router.push('/profile')
}

onMounted(() => {
  loadCategories()
  loadServices(true)
  loadWorkers()
})
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.search-bar {
  padding: 12px;
  background-color: #fff;
}

.section {
  background-color: #fff;
  margin-bottom: 12px;
  padding: 12px;
}

.categories-section {
  margin-top: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}

.section-header .section-title {
  margin-bottom: 0;
}

.workers-section {
  :deep(.van-cell) {
    padding: 12px 0;
  }
  
  :deep(.van-cell__title) {
    font-weight: 500;
  }
  
  :deep(.van-cell__label) {
    margin-top: 4px;
    color: #969799;
  }
}
</style>
