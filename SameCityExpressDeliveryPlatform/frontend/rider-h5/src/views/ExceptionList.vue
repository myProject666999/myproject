<template>
  <div class="exception-list-page page-container">
    <van-nav-bar
      title="异常工单"
      left-arrow
      @click-left="$router.back()"
    />

    <van-tabs v-model:active="activeTab">
      <van-tab title="全部" />
      <van-tab title="待处理" />
      <van-tab title="处理中" />
      <van-tab title="已解决" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell-group
          v-for="exception in exceptions"
          :key="exception.id"
          inset
          style="margin: 10px 15px"
        >
          <van-cell
            title="异常类型"
            :value="getTypeText(exception.type)"
          />
          <van-cell title="状态">
            <template #value>
              <span :class="['status-tag', getStatusClass(exception.status)]">
                {{ getStatusText(exception.status) }}
              </span>
            </template>
          </van-cell>
          <van-cell title="描述" :value="exception.description" />
          <van-cell title="创建时间" :value="formatTime(exception.created_at)" />
        </van-cell-group>

        <van-empty v-if="exceptions.length === 0 && !loading" description="暂无异常工单" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getExceptions } from '@/api/exception'
import request from '@/api/request'

async function getExceptions(params: any = {}) {
  return request.get('/rider/exception', { params })
}

const activeTab = ref(0)
const exceptions = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const statusMap = [null, 0, 1, 2]

const typeTextMap: Record<number, string> = {
  1: '丢件',
  2: '超时',
  3: '损坏',
  4: '其他'
}

const statusTextMap: Record<number, string> = {
  0: '待处理',
  1: '处理中',
  2: '已解决',
  3: '已驳回'
}

function getTypeText(type: number) {
  return typeTextMap[type] || '其他'
}

function getStatusText(status: number) {
  return statusTextMap[status] || '未知'
}

function getStatusClass(status: number) {
  if (status === 0) return 'status-pending'
  if (status === 1) return 'status-accepted'
  if (status === 2) return 'status-completed'
  return 'status-cancelled'
}

function formatTime(timeStr: string) {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN')
}

async function onLoad() {
  if (loading.value) return

  loading.value = true
  try {
    const params: any = {
      page: page.value,
      page_size: pageSize
    }
    if (statusMap[activeTab.value] !== null) {
      params.status = statusMap[activeTab.value]
    }

    const res = await getExceptions(params)
    exceptions.value = [...exceptions.value, ...(res.exceptions || [])]

    if ((res.exceptions || []).length < pageSize) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (error) {
    console.error('加载异常工单失败', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function onRefresh() {
  page.value = 1
  exceptions.value = []
  finished.value = false
  await onLoad()
}

onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.exception-list-page {
  padding-bottom: 20px;
}
</style>
