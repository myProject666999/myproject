<template>
  <div class="category-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="分类管理" name="categories">
        <div class="page-header">
          <h2 class="page-title">分类列表</h2>
          <el-button type="primary" @click="showCategoryDialog">
            <el-icon><Plus /></el-icon>
            新建分类
          </el-button>
        </div>

        <el-card shadow="hover">
          <el-table :data="categories" stripe style="width: 100%">
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="slug" label="Slug" />
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
            <el-table-column prop="articleCount" label="文章数" width="100" align="center" />
            <el-table-column label="操作" width="180" align="center">
              <template #default="{ row }">
                <el-button size="small" @click="editCategory(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteCategory(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="标签管理" name="tags">
        <div class="page-header">
          <h2 class="page-title">标签列表</h2>
          <el-button type="primary" @click="showTagDialog">
            <el-icon><Plus /></el-icon>
            新建标签
          </el-button>
        </div>

        <el-card shadow="hover">
          <el-table :data="tags" stripe style="width: 100%">
            <el-table-column prop="name" label="名称">
              <template #default="{ row }">
                <span :style="{ color: row.color }">#{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="slug" label="Slug" />
            <el-table-column label="颜色" width="100" align="center">
              <template #default="{ row }">
                <el-tag :color="row.color + '20'" :style="{ color: row.color }">{{ row.color }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="articleCount" label="文章数" width="100" align="center" />
            <el-table-column label="操作" width="180" align="center">
              <template #default="{ row }">
                <el-button size="small" @click="editTag(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteTag(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="categoryDialogVisible" :title="categoryForm.id ? '编辑分类' : '新建分类'" width="500px">
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="categoryForm.name" placeholder="分类名称" />
        </el-form-item>
        <el-form-item label="Slug">
          <el-input v-model="categoryForm.slug" placeholder="URL标识" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="categoryForm.description" type="textarea" :rows="2" placeholder="分类描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="tagDialogVisible" :title="tagForm.id ? '编辑标签' : '新建标签'" width="500px">
      <el-form :model="tagForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="tagForm.name" placeholder="标签名称" />
        </el-form-item>
        <el-form-item label="Slug">
          <el-input v-model="tagForm.slug" placeholder="URL标识" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="tagForm.color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTag">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { categoryApi } from '../../api/categories';
import type { Category, Tag } from '../../../shared/types';

const activeTab = ref('categories');
const categories = ref<Category[]>([]);
const tags = ref<Tag[]>([]);

const categoryDialogVisible = ref(false);
const tagDialogVisible = ref(false);

const categoryForm = ref({
  id: undefined as number | undefined,
  name: '',
  slug: '',
  description: '',
});

const tagForm = ref({
  id: undefined as number | undefined,
  name: '',
  slug: '',
  color: '#10b981',
});

async function loadData() {
  try {
    categories.value = await categoryApi.getAllCategories();
  } catch (_) { /* ignore */ }
  try {
    tags.value = await categoryApi.getAllTags();
  } catch (_) { /* ignore */ }
}

function resetCategoryForm() {
  categoryForm.value = { id: undefined, name: '', slug: '', description: '' };
}

function resetTagForm() {
  tagForm.value = { id: undefined, name: '', slug: '', color: '#10b981' };
}

function showCategoryDialog() {
  resetCategoryForm();
  categoryDialogVisible.value = true;
}

function editCategory(row: Category) {
  categoryForm.value = { id: row.id, name: row.name, slug: row.slug, description: row.description || '' };
  categoryDialogVisible.value = true;
}

async function saveCategory() {
  if (!categoryForm.value.name.trim() || !categoryForm.value.slug.trim()) {
    ElMessage.warning('请填写名称和Slug');
    return;
  }
  try {
    if (categoryForm.value.id) {
      await categoryApi.updateCategory(categoryForm.value.id, {
        name: categoryForm.value.name,
        slug: categoryForm.value.slug,
        description: categoryForm.value.description,
      });
    } else {
      await categoryApi.createCategory({
        name: categoryForm.value.name,
        slug: categoryForm.value.slug,
        description: categoryForm.value.description,
      });
    }
    ElMessage.success('保存成功');
    categoryDialogVisible.value = false;
    loadData();
  } catch (err: any) {
    ElMessage.error(err.message || '保存失败');
  }
}

async function deleteCategory(row: Category) {
  try {
    await ElMessageBox.confirm(`确定删除分类 "${row.name}" 吗？`, '提示', { type: 'warning' });
    await categoryApi.deleteCategory(row.id);
    ElMessage.success('删除成功');
    loadData();
  } catch (_) { /* cancelled */ }
}

function showTagDialog() {
  resetTagForm();
  tagDialogVisible.value = true;
}

function editTag(row: Tag) {
  tagForm.value = { id: row.id, name: row.name, slug: row.slug, color: row.color };
  tagDialogVisible.value = true;
}

async function saveTag() {
  if (!tagForm.value.name.trim() || !tagForm.value.slug.trim()) {
    ElMessage.warning('请填写名称和Slug');
    return;
  }
  try {
    if (tagForm.value.id) {
      await categoryApi.updateTag(tagForm.value.id, {
        name: tagForm.value.name,
        slug: tagForm.value.slug,
        color: tagForm.value.color,
      });
    } else {
      await categoryApi.createTag({
        name: tagForm.value.name,
        slug: tagForm.value.slug,
        color: tagForm.value.color,
      });
    }
    ElMessage.success('保存成功');
    tagDialogVisible.value = false;
    loadData();
  } catch (err: any) {
    ElMessage.error(err.message || '保存失败');
  }
}

async function deleteTag(row: Tag) {
  try {
    await ElMessageBox.confirm(`确定删除标签 "${row.name}" 吗？`, '提示', { type: 'warning' });
    await categoryApi.deleteTag(row.id);
    ElMessage.success('删除成功');
    loadData();
  } catch (_) { /* cancelled */ }
}

onMounted(loadData);
</script>

<style scoped>
.category-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}
</style>
