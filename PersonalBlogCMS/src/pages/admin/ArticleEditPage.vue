<template>
  <div class="article-edit-page">
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑文章' : '新建文章' }}</h2>
      <div class="header-actions">
        <el-button @click="saveDraft">保存草稿</el-button>
        <el-button type="primary" @click="publishArticle">
          {{ isEdit ? '更新文章' : '发布文章' }}
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :md="16">
        <el-card shadow="hover">
          <el-form :model="form" label-width="80px">
            <el-form-item label="标题">
              <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="255" show-word-limit />
            </el-form-item>
            <el-form-item label="摘要">
              <el-input
                v-model="form.summary"
                type="textarea"
                :rows="3"
                placeholder="请输入文章摘要"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="内容">
              <div class="editor-wrapper">
                <el-tabs v-model="editorTab">
                  <el-tab-pane label="编辑" name="edit">
                    <el-input
                      v-model="form.contentMd"
                      type="textarea"
                      :rows="18"
                      placeholder="请使用 Markdown 格式编写文章内容"
                      class="markdown-editor"
                    />
                  </el-tab-pane>
                  <el-tab-pane label="预览" name="preview">
                    <div class="markdown-body" v-html="renderedContent"></div>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8">
        <el-card shadow="hover">
          <template #header>
            <span>分类与标签</span>
          </template>
          <el-form label-width="60px">
            <el-form-item label="分类">
              <el-select v-model="form.categoryId" placeholder="选择分类" clearable style="width: 100%">
                <el-option
                  v-for="cat in categories"
                  :key="cat.id"
                  :label="cat.name"
                  :value="cat.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="标签">
              <el-select
                v-model="form.tagIds"
                multiple
                placeholder="选择标签"
                style="width: 100%"
              >
                <el-option
                  v-for="tag in tags"
                  :key="tag.id"
                  :label="tag.name"
                  :value="tag.id"
                >
                  <span :style="{ color: tag.color }">#{{ tag.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="封面">
              <el-input v-model="form.coverImage" placeholder="封面图片URL" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { marked } from 'marked';
import { articleApi } from '../../api/articles';
import { categoryApi } from '../../api/categories';
import type { Article, Category, Tag, CreateArticleRequest, UpdateArticleRequest } from '../../../shared/types';

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => !!route.params.id);
const articleId = computed(() => parseInt(route.params.id as string));

const editorTab = ref('edit');

const form = ref({
  title: '',
  summary: '',
  contentMd: '',
  coverImage: '',
  categoryId: undefined as number | undefined,
  tagIds: [] as number[],
});

const categories = ref<Category[]>([]);
const tags = ref<Tag[]>([]);

const renderedContent = computed(() => {
  if (!form.value.contentMd) return '';
  try {
    return marked.parse(form.value.contentMd) as string;
  } catch {
    return '';
  }
});

async function loadOptions() {
  try {
    categories.value = await categoryApi.getAllCategories();
  } catch (_) { /* ignore */ }
  try {
    tags.value = await categoryApi.getAllTags();
  } catch (_) { /* ignore */ }
}

async function loadArticle() {
  if (!isEdit.value) return;
  try {
    const { article } = await articleApi.getAdminDetail(articleId.value);
    if (article) {
      form.value.title = article.title;
      form.value.summary = article.summary || '';
      form.value.contentMd = article.contentMd || '';
      form.value.coverImage = article.coverImage || '';
      form.value.categoryId = article.categoryId;
      form.value.tagIds = article.tags ? article.tags.map((t) => t.id) : [];
    }
  } catch (err: any) {
    ElMessage.error(err.message || '加载文章失败');
  }
}

function validate(): boolean {
  if (!form.value.title.trim()) {
    ElMessage.warning('请输入文章标题');
    return false;
  }
  if (!form.value.contentMd.trim()) {
    ElMessage.warning('请输入文章内容');
    return false;
  }
  return true;
}

async function saveDraft() {
  if (!validate()) return;
  try {
    if (isEdit.value) {
      await articleApi.update(articleId.value, {
        ...form.value,
        id: articleId.value,
        status: 'draft',
      } as UpdateArticleRequest);
    } else {
      await articleApi.create({
        ...form.value,
        status: 'draft',
      } as CreateArticleRequest);
    }
    ElMessage.success('草稿已保存');
    router.push('/admin/articles');
  } catch (err: any) {
    ElMessage.error(err.message || '保存失败');
  }
}

async function publishArticle() {
  if (!validate()) return;
  try {
    if (isEdit.value) {
      await articleApi.update(articleId.value, {
        ...form.value,
        id: articleId.value,
        status: 'published',
      } as UpdateArticleRequest);
    } else {
      await articleApi.create({
        ...form.value,
        status: 'published',
      } as CreateArticleRequest);
    }
    ElMessage.success(isEdit.value ? '更新成功' : '发布成功');
    router.push('/admin/articles');
  } catch (err: any) {
    ElMessage.error(err.message || (isEdit.value ? '更新失败' : '发布失败'));
  }
}

onMounted(() => {
  loadOptions();
  loadArticle();
});
</script>

<style scoped>
.article-edit-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.editor-wrapper {
  width: 100%;
}

.markdown-editor :deep(.el-textarea__inner) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.markdown-body {
  min-height: 400px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}
</style>
