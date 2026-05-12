<template>
  <div class="page-container">
    <van-nav-bar title="消息通知" left-text="返回" @click-left="onClickLeft" />
    
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell-group v-for="item in notifications" :key="item.id" class="notification-card">
        <van-cell
          :title="item.title"
          :label="item.content"
          :value="item.createTime"
          :class="{ unread: !item.isRead }"
          @click="markRead(item)"
        >
          <template #icon>
            <van-icon :name="getIcon(item.type)" :color="item.isRead ? '#969799' : '#1989fa'" />
          </template>
        </van-cell>
      </van-cell-group>

      <van-empty v-if="!loading && notifications.length === 0" description="暂无消息" />
    </van-list>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const notifications = ref([])
const loading = ref(false)
const finished = ref(false)

const onClickLeft = () => {
  router.back()
}

const getIcon = (type) => {
  const iconMap = {
    order: 'orders-o',
    negotiation: 'chat-o',
    system: 'bell-o'
  }
  return iconMap[type] || 'bell-o'
}

const loadNotifications = async () => {
  try {
    const data = await request.get('/notification/list')
    notifications.value = data || []
    finished.value = true
  } catch (e) {
    console.error(e)
    finished.value = true
    notifications.value = []
  } finally {
    loading.value = false
  }
}

const markRead = async (item) => {
  if (!item.isRead) {
    try {
      await request.post(`/notification/read/${item.id}`)
      item.isRead = 1
    } catch (e) {
      console.error(e)
    }
  }
}

const onLoad = () => {
  loadNotifications()
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.notification-card {
  margin: 10px;
  border-radius: 8px;
}

.unread {
  background: #f0f9ff;
}
</style>
