<template>
  <div class="community-page">
    <van-nav-bar title="学员社区" />
    <van-sticky>
      <van-search
        v-model="keyword"
        placeholder="搜索动态"
        show-action
        @search="onSearch"
        @cancel="onCancel"
      >
        <template #action>
          <router-link to="/post-create" class="post-action">发布</router-link>
        </template>
      </van-search>
    </van-sticky>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-for="post in posts" :key="post.id" class="post-card" @click="$router.push(`/post-detail/${post.id}`)">
          <div class="post-header">
            <van-image
              round
              width="40"
              height="40"
              :src="post.User?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
            />
            <div class="post-user">
              <div class="user-name">{{ post.User?.name }}</div>
              <div class="post-time">{{ formatTime(post.createdAt) }}</div>
            </div>
          </div>
          <div class="post-content">{{ post.content }}</div>
          <div class="post-images" v-if="post.images?.length">
            <van-image
              v-for="(img, idx) in post.images.slice(0, 3)"
              :key="idx"
              width="100"
              height="100"
              :src="img"
              fit="cover"
              radius="4"
            />
          </div>
          <div class="post-actions flex-between">
            <div class="action-item" @click.stop="toggleLike(post)">
              <van-icon :name="post.hasLiked ? 'good-job' : 'good-job-o'" :color="post.hasLiked ? '#ee0a24' : '#969799'" />
              <span>{{ post.likesCount }}</span>
            </div>
            <div class="action-item">
              <van-icon name="comment-o" />
              <span>{{ post.commentsCount }}</span>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { communityAPI } from '@/api'

export default {
  setup() {
    const posts = ref([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const keyword = ref('')
    const page = ref(1)
    const limit = 10

    const formatTime = (time) => {
      const d = new Date(time)
      const now = new Date()
      const diff = now - d
      const minutes = Math.floor(diff / 60000)
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}小时前`
      return d.toLocaleDateString()
    }

    const loadPosts = async (isRefresh = false) => {
      if (isRefresh) {
        page.value = 1
        finished.value = false
        posts.value = []
      }
      try {
        const res = await communityAPI.getAll({ page: page.value, limit })
        const newPosts = res.posts || []
        posts.value = isRefresh ? newPosts : [...posts.value, ...newPosts]
        page.value++
        loading.value = false
        if (posts.value.length >= res.total) {
          finished.value = true
        }
      } catch (e) {
        console.error(e)
        loading.value = false
      }
    }

    const onLoad = () => loadPosts(false)
    const onRefresh = async () => {
      refreshing.value = true
      await loadPosts(true)
      refreshing.value = false
    }
    const onSearch = () => {
      loadPosts(true)
    }
    const onCancel = () => {
      keyword.value = ''
      loadPosts(true)
    }

    const toggleLike = async (post) => {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.hash = '#/login'
        return
      }
      try {
        const res = await communityAPI.toggleLike(post.id)
        post.hasLiked = res.hasLiked
        post.likesCount = res.likesCount
      } catch (e) {
        console.error(e)
      }
    }

    onMounted(() => loadPosts(true))

    return {
      posts, loading, finished, refreshing, keyword,
      formatTime, onLoad, onRefresh, onSearch, onCancel, toggleLike
    }
  }
}
</script>

<style scoped>
.community-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 60px;
}
.post-action {
  color: #1989fa;
  font-size: 14px;
}
.post-card {
  background: #fff;
  margin-bottom: 8px;
  padding: 16px;
}
.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.post-user {
  margin-left: 12px;
  flex: 1;
}
.user-name {
  font-size: 15px;
  font-weight: 500;
}
.post-time {
  font-size: 12px;
  color: #969799;
  margin-top: 2px;
}
.post-content {
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 12px;
  white-space: pre-wrap;
}
.post-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.post-actions {
  padding-top: 12px;
  border-top: 1px solid #ebedf0;
}
.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #969799;
}
</style>
