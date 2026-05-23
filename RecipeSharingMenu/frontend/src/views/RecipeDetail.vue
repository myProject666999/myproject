<template>
  <div v-loading="loading">
    <template v-if="recipe">
      <div class="detail-hero">
        <div class="hero-image">
          <el-image
            v-if="recipe.cover_image"
            :src="recipe.cover_image"
            fit="cover"
            style="width: 100%; height: 100%"
          />
          <span v-else>🍳</span>
        </div>
        <div class="hero-content">
          <h1>{{ recipe.title }}</h1>
          <p v-if="recipe.description" class="description">{{ recipe.description }}</p>
          <div class="hero-meta">
            <span class="tag">{{ recipe.category }}</span>
            <span class="tag warning">{{ recipe.flavor }}</span>
            <span class="tag success">{{ recipe.difficulty }}</span>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              {{ recipe.cook_time }}分钟
            </span>
            <span class="meta-item">
              <el-icon><User /></el-icon>
              {{ recipe.servings }}人份
            </span>
          </div>
          <div class="hero-author" v-if="recipe.author">
            <el-avatar :size="36" :src="recipe.author.avatar">
              {{ recipe.author.username?.charAt(0) }}
            </el-avatar>
            <span>{{ recipe.author.username }}</span>
          </div>
          <div class="action-bar">
            <el-button
              :type="recipe.isLiked ? 'danger' : 'default'"
              :icon="recipe.isLiked ? StarFilled : Star"
              @click="handleToggleLike"
            >
              {{ recipe.likes_count }} 点赞
            </el-button>
            <el-button
              :type="recipe.isFavorited ? 'warning' : 'default'"
              :icon="recipe.isFavorited ? CollectionTag : Collection"
              @click="handleToggleFavorite"
            >
              {{ recipe.favorites_count }} 收藏
            </el-button>
            <el-button
              v-if="isOwner"
              type="primary"
              :icon="Edit"
              @click="$router.push(`/recipe/edit/${recipe.id}`)"
            >
              编辑
            </el-button>
            <el-button
              v-if="isOwner"
              type="danger"
              :icon="Delete"
              @click="handleDelete"
            >
              删除
            </el-button>
            <el-dropdown v-if="userStore.isLoggedIn" @command="handleAddToMenu">
              <el-button type="success" :icon="Plus">
                添加到菜单
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="day in weekDays"
                    :key="day"
                    :command="day"
                  >
                    {{ day }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h2 class="detail-section-title">
          <el-icon><Goods /></el-icon>
          食材清单
        </h2>
        <ul class="ingredient-list">
          <li
            v-for="ing in recipe.ingredients"
            :key="ing.id"
            class="ingredient-item"
          >
            <span>
              {{ ing.name }}
              <span v-if="ing.is_optional" class="tag">可选</span>
            </span>
            <span class="ingredient-amount">
              {{ ing.amount }}{{ ing.unit || '' }}
            </span>
          </li>
        </ul>
      </div>

      <div class="detail-section">
        <h2 class="detail-section-title">
          <el-icon><List /></el-icon>
          做法步骤
        </h2>
        <div class="steps-list">
          <div
            v-for="(step, index) in recipe.steps"
            :key="step.id"
            class="step-item"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <p>{{ step.content }}</p>
              <el-image
                v-if="step.image"
                :src="step.image"
                fit="cover"
                class="step-image"
                lazy
              >
                <template #placeholder>
                  <div class="step-image-placeholder">
                    <el-icon :size="32"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h2 class="detail-section-title">
          <el-icon><ChatDotRound /></el-icon>
          评论 ({{ recipe.comments_count }})
        </h2>
        <div v-if="userStore.isLoggedIn" class="comment-input">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="写下您的评论..."
          />
          <el-button
            type="primary"
            style="margin-top: 12px"
            :loading="commentLoading"
            @click="handleAddComment"
          >
            发表评论
          </el-button>
        </div>
        <div v-else class="comment-login-tip">
          <el-link type="primary" @click="$router.push('/login')">登录</el-link>
          后可以发表评论
        </div>
        <div class="comments-list">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
          >
            <div class="comment-header">
              <div class="comment-avatar">
                {{ comment.author?.username?.charAt(0) }}
              </div>
              <div>
                <div class="comment-author">{{ comment.author?.username }}</div>
                <div class="comment-time">{{ formatTime(comment.created_at) }}</div>
              </div>
              <el-button
                v-if="comment.author?.id === userStore.userInfo?.id"
                link
                type="danger"
                size="small"
                @click="handleDeleteComment(comment.id)"
              >
                删除
              </el-button>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </div>
          <div v-if="comments.length === 0 && !commentsLoading" class="empty-state">
            <p>暂无评论，快来发表第一条评论吧！</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Star,
  StarFilled,
  Collection,
  CollectionTag,
  Edit,
  Delete,
  Plus,
  Clock,
  User,
  Goods,
  List,
  ChatDotRound,
  Picture
} from '@element-plus/icons-vue'
import { recipeAPI, commentAPI, menuAPI } from '../api'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const recipe = ref(null)
const comments = ref([])
const commentsLoading = ref(false)
const newComment = ref('')
const commentLoading = ref(false)

const weekDays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']

const isOwner = computed(() => {
  return recipe.value?.author?.id === userStore.userInfo?.id
})

const fetchRecipe = async () => {
  loading.value = true
  try {
    const res = await recipeAPI.getDetail(route.params.id)
    recipe.value = res.data
    fetchComments()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  commentsLoading.value = true
  try {
    const res = await commentAPI.getList(route.params.id, { pageSize: 50 })
    comments.value = res.data.list
  } catch (error) {
    console.error(error)
  } finally {
    commentsLoading.value = false
  }
}

const handleToggleLike = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  try {
    const res = await recipeAPI.toggleLike(route.params.id)
    recipe.value.isLiked = res.data.isLiked
    recipe.value.likes_count += res.data.isLiked ? 1 : -1
    ElMessage.success(res.data.isLiked ? '点赞成功' : '取消点赞成功')
  } catch (error) {
    console.error(error)
  }
}

const handleToggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  try {
    const res = await recipeAPI.toggleFavorite(route.params.id)
    recipe.value.isFavorited = res.data.isFavorited
    recipe.value.favorites_count += res.data.isFavorited ? 1 : -1
    ElMessage.success(res.data.isFavorited ? '收藏成功' : '取消收藏成功')
  } catch (error) {
    console.error(error)
  }
}

const handleAddToMenu = async (day) => {
  try {
    await menuAPI.addToMenu({
      recipe_id: recipe.value.id,
      week_day: day,
      meal_type: '晚餐'
    })
    ElMessage.success(`已添加到${day}菜单`)
  } catch (error) {
    console.error(error)
  }
}

const handleAddComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  commentLoading.value = true
  try {
    await commentAPI.create(route.params.id, { content: newComment.value })
    newComment.value = ''
    fetchComments()
    recipe.value.comments_count++
    ElMessage.success('评论成功')
  } catch (error) {
    console.error(error)
  } finally {
    commentLoading.value = false
  }
}

const handleDeleteComment = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      type: 'warning'
    })
    await commentAPI.delete(id)
    fetchComments()
    recipe.value.comments_count--
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个菜谱吗？', '提示', {
      type: 'warning'
    })
    await recipeAPI.delete(route.params.id)
    ElMessage.success('删除成功')
    router.push('/')
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchRecipe()
})
</script>

<style scoped>
.detail-hero {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.hero-image {
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
}

.hero-content {
  padding: 24px;
}

.hero-content h1 {
  font-size: 28px;
  margin-bottom: 12px;
  color: #303133;
}

.description {
  color: #606266;
  margin-bottom: 16px;
  line-height: 1.6;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 14px;
}

.hero-author {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  margin-bottom: 16px;
}

.comment-input {
  margin-bottom: 24px;
}

.comment-login-tip {
  text-align: center;
  padding: 20px;
  color: #909399;
  margin-bottom: 20px;
}

.ingredient-amount {
  color: #606266;
}

@media (max-width: 768px) {
  .hero-image {
    height: 200px;
    font-size: 48px;
  }

  .hero-content h1 {
    font-size: 22px;
  }
}
</style>
