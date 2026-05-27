<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import dayjs from 'dayjs';
import { articleApi } from '../../api/articles';
import { commentApi } from '../../api/comments';
import type { Article, Comment, CreateCommentRequest } from '../../../shared/types';

const route = useRoute();
const router = useRouter();

const article = ref<Article | null>(null);
const prevArticle = ref<Article | null>(null);
const nextArticle = ref<Article | null>(null);
const comments = ref<Comment[]>([]);
const loading = ref(false);
const commentsLoading = ref(false);
const submitting = ref(false);

const commentFormRef = ref<FormInstance>();
const commentForm = reactive<CreateCommentRequest>({
  authorName: '',
  authorEmail: '',
  content: '',
});

const commentRules: FormRules = {
  authorName: [
    { required: true, message: '请输入昵�?, trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度�?2 �?20 个字�?, trigger: 'blur' },
  ],
  content: [
    { required: true, message: '请输入评论内�?, trigger: 'blur' },
    { min: 2, max: 500, message: '评论内容长度�?2 �?500 个字�?, trigger: 'blur' },
  ],
};

const formatDate = (date: Date) => {
  return dayjs(date).format('YYYY年MM月DD�?);
};

const formatDateTime = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

const loadArticle = async () => {
  const id = Number(route.params.id);
  if (!id) return;

  loading.value = true;
  try {
    const response = await articleApi.getDetail(id);
    article.value = response.article;
    prevArticle.value = response.prev;
    nextArticle.value = response.next;
    loadComments(id);
  } catch (error) {
    ElMessage.error('加载文章失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const loadComments = async (articleId: number) => {
  commentsLoading.value = true;
  try {
    const response = await commentApi.getApproved(articleId);
    comments.value = response;
  } catch (error) {
    console.error('加载评论失败', error);
  } finally {
    commentsLoading.value = false;
  }
};

const submitComment = async () => {
  if (!article.value) return;

  await commentFormRef.value?.validate();
  submitting.value = true;
  try {
    await commentApi.create(article.value.id, commentForm);
    ElMessage.success('评论提交成功，审核通过后将显示');
    commentForm.authorName = '';
    commentForm.authorEmail = '';
    commentForm.content = '';
    commentFormRef.value?.resetFields();
  } catch (error) {
    ElMessage.error('评论提交失败');
    console.error(error);
  } finally {
    submitting.value = false;
  }
};

const goToArticle = (id: number) => {
  router.push(`/article/${id}`);
};

const goToCategory = (id: number) => {
  router.push(`/category/${id}`);
};

onMounted(() => {
  loadArticle();
});
</script>

<template>
  <div class="article-detail-page">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <div v-if="loading" class="flex justify-center py-20">
        <el-icon class="is-loading text-4xl text-gray-400">
          <Loading />
        </el-icon>
      </div>

      <template v-else-if="article">
        <article class="bg-white rounded-xl shadow-sm p-8 mb-8">
          <header class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ article.title }}</h1>

            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              <span v-if="article.category" class="flex items-center gap-1">
                <el-icon><Folder /></el-icon>
                <span class="cursor-pointer hover:text-primary" @click="goToCategory(article.category!.id)">
                  {{ article.category.name }}
                </span>
              </span>

              <span class="flex items-center gap-1">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(article.publishedAt || article.createdAt) }}
              </span>

              <span class="flex items-center gap-1">
                <el-icon><View /></el-icon>
                {{ article.viewCount }} 次阅�?
              </span>
            </div>

            <div v-if="article.tags.length > 0" class="flex flex-wrap gap-2">
              <el-tag
                v-for="tag in article.tags"
                :key="tag.id"
                :style="{ backgroundColor: tag.color + '20', borderColor: tag.color, color: tag.color }"
                effect="plain"
                size="small"
              >
                {{ tag.name }}
              </el-tag>
            </div>
          </header>

          <div class="markdown-body" v-html="article.contentHtml"></div>
        </article>

        <el-divider />

        <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div class="flex justify-between items-center">
            <div v-if="prevArticle" class="flex-1 cursor-pointer group" @click="goToArticle(prevArticle.id)">
              <div class="text-sm text-gray-400 mb-1 flex items-center gap-1">
                <el-icon><ArrowLeft /></el-icon>
                上一�?
              </div>
              <div class="text-gray-700 group-hover:text-primary transition-colors truncate">
                {{ prevArticle.title }}
              </div>
            </div>
            <div v-else class="flex-1"></div>

            <div class="flex-1 text-right">
              <div v-if="nextArticle" class="cursor-pointer group" @click="goToArticle(nextArticle.id)">
                <div class="text-sm text-gray-400 mb-1 flex items-center gap-1 justify-end">
                  下一�?
                  <el-icon><ArrowRight /></el-icon>
                </div>
                <div class="text-gray-700 group-hover:text-primary transition-colors truncate">
                  {{ nextArticle.title }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <el-icon><ChatDotRound /></el-icon>
            评论 ({{ comments.length }})
          </h2>

          <div class="mb-8">
            <el-form
              ref="commentFormRef"
              :model="commentForm"
              :rules="commentRules"
              label-position="top"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <el-form-item label="昵称" prop="authorName">
                  <el-input
                    v-model="commentForm.authorName"
                    placeholder="请输入昵�?
                    :disabled="submitting"
                  />
                </el-form-item>
                <el-form-item label="邮箱 (选填)" prop="authorEmail">
                  <el-input
                    v-model="commentForm.authorEmail"
                    placeholder="请输入邮箱（用于回复通知�?
                    :disabled="submitting"
                  />
                </el-form-item>
              </div>
              <el-form-item label="评论内容" prop="content">
                <el-input
                  v-model="commentForm.content"
                  type="textarea"
                  :rows="4"
                  placeholder="写下你的评论..."
                  :disabled="submitting"
                />
              </el-form-item>
              <div class="flex justify-end">
                <el-button type="primary" :loading="submitting" @click="submitComment">
                  发表评论
                </el-button>
              </div>
            </el-form>
          </div>

          <el-divider />

          <div v-if="commentsLoading" class="flex justify-center py-10">
            <el-icon class="is-loading text-2xl text-gray-400">
              <Loading />
            </el-icon>
          </div>

          <div v-else-if="comments.length === 0" class="text-center py-10 text-gray-400">
            <el-icon class="text-4xl mb-2"><ChatDotRound /></el-icon>
            <p>暂无评论，来抢沙发吧~</p>
          </div>

          <div v-else class="space-y-6">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="flex gap-4">
                <el-avatar :size="40" class="flex-shrink-0">
                  {{ comment.authorName.charAt(0) }}
                </el-avatar>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-gray-900">{{ comment.authorName }}</span>
                    <span class="text-xs text-gray-400">{{ formatDateTime(comment.createdAt) }}</span>
                  </div>
                  <p class="text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>

                  <div v-if="comment.replies && comment.replies.length > 0" class="mt-4 ml-4 pl-4 border-l-2 border-gray-100 space-y-4">
                    <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                      <div class="flex gap-3">
                        <el-avatar :size="32" class="flex-shrink-0">
                          {{ reply.authorName.charAt(0) }}
                        </el-avatar>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="font-medium text-gray-900 text-sm">{{ reply.authorName }}</span>
                            <span class="text-xs text-gray-400">{{ formatDateTime(reply.createdAt) }}</span>
                          </div>
                          <p class="text-gray-700 text-sm whitespace-pre-wrap">{{ reply.content }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="text-center py-20 text-gray-400">
        <el-icon class="text-5xl mb-4"><Document /></el-icon>
        <p>文章不存在或已被删除</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-detail-page {
  min-height: calc(100vh - 200px);
}

.comment-item {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.reply-item {
  padding-bottom: 1rem;
}

.reply-item:last-child {
  padding-bottom: 0;
}
</style>

