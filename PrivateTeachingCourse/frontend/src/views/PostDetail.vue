<template>
  <div class="post-detail-page">
    <van-nav-bar title="动态详情" left-arrow @click-left="$router.back()" />
    <van-loading v-if="loading" class="flex-center" style="padding: 40px" />
    <div v-else-if="post" class="detail-content">
      <div class="post-card">
        <div class="post-header">
          <van-image
            round
            width="44"
            height="44"
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
            v-for="(img, idx) in post.images"
            :key="idx"
            width="100%"
            height="auto"
            :src="img"
            fit="cover"
            radius="8"
          />
        </div>
        <div class="post-stats">
          <span>{{ post.likesCount }} 赞</span>
          <span>{{ post.commentsCount }} 评论</span>
        </div>
      </div>

      <div class="comments-section">
        <div class="comments-header">评论</div>
        <div v-if="!post.Comments?.length" class="empty-comments">暂无评论</div>
        <div v-else>
          <div v-for="comment in post.Comments" :key="comment.id" class="comment-item">
            <van-image
              round
              width="32"
              height="32"
              :src="comment.User?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
            />
            <div class="comment-content">
              <div class="comment-user">{{ comment.User?.name }}</div>
              <div class="comment-text">{{ comment.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="comment-bar">
      <van-field
        v-model="commentText"
        placeholder="写评论..."
        class="comment-input"
      />
      <van-button type="primary" size="small" @click="addComment">发送</van-button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { communityAPI } from '@/api'

export default {
  setup() {
    const route = useRoute()
    const loading = ref(true)
    const post = ref(null)
    const commentText = ref('')

    const formatTime = (time) => {
      const d = new Date(time)
      return d.toLocaleString()
    }

    const loadPost = async () => {
      try {
        const res = await communityAPI.getById(route.params.id)
        post.value = res.post
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    const addComment = async () => {
      if (!commentText.value.trim()) {
        showFailToast('请输入评论内容')
        return
      }
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.hash = '#/login'
        return
      }
      try {
        await communityAPI.addComment(route.params.id, commentText.value)
        showSuccessToast('评论成功')
        commentText.value = ''
        loadPost()
      } catch (e) {
        console.error(e)
      }
    }

    onMounted(loadPost)
    return { loading, post, commentText, formatTime, addComment }
  }
}
</script>

<style scoped>
.post-detail-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 60px;
}
.post-card {
  background: #fff;
  padding: 16px;
}
.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.post-user {
  margin-left: 12px;
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
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.post-stats {
  padding-top: 12px;
  border-top: 1px solid #ebedf0;
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #969799;
}
.comments-section {
  background: #fff;
  margin-top: 8px;
  padding: 16px;
}
.comments-header {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
}
.empty-comments {
  text-align: center;
  color: #969799;
  padding: 20px;
}
.comment-item {
  display: flex;
  margin-bottom: 16px;
}
.comment-content {
  margin-left: 12px;
  flex: 1;
}
.comment-user {
  font-size: 14px;
  font-weight: 500;
}
.comment-text {
  font-size: 14px;
  color: #323233;
  margin-top: 4px;
}
.comment-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-top: 1px solid #ebedf0;
}
.comment-input {
  flex: 1;
}
</style>
