<template>
  <div class="page">
    <el-card shadow="never">
      <template #header>
        <div style="display:flex; justify-content:space-between; align-items:center">
          <b>添加书签</b>
          <el-button type="primary" @click="preview">抓取预览</el-button>
        </div>
      </template>
      <el-form :model="form" label-width="80px">
        <el-form-item label="URL" required>
          <el-input v-model="form.url" placeholder="https://example.com" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="文件夹">
          <el-select v-model="form.folder_id" clearable style="width:100%">
            <el-option v-for="f in folders" :key="f.id" :label="f.name" :value="f.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tags" multiple filterable allow-create default-first-option style="width:100%">
            <el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.name" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">保存</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-divider>预览</el-divider>
      <div v-if="previewData">
        <p><b>标题：</b>{{ previewData.title }}</p>
        <p><b>图标：</b><img v-if="previewData.icon" :src="previewData.icon" class="icon" /> {{ previewData.icon }}</p>
        <p><b>描述：</b>{{ previewData.description }}</p>
        <p><b>状态：</b>{{ previewData.ok ? '正常' : '异常' }} ({{ previewData.statusCode }})</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { api } from '../api';
import { useRouter } from 'vue-router';

const router = useRouter();
const folders = ref([]);
const tags = ref([]);
const form = ref({ url: '', title: '', icon: '', description: '', folder_id: null, tags: [] });
const previewData = ref(null);

async function loadMeta() {
  folders.value = await api.folders();
  tags.value = await api.tags();
}

async function preview() {
  if (!form.value.url) return ElMessage.warning('请输入URL');
  previewData.value = await api.preview(form.value.url);
  if (!form.value.title && previewData.value.title) form.value.title = previewData.value.title;
  if (!form.value.icon && previewData.value.icon) form.value.icon = previewData.value.icon;
  if (!form.value.description && previewData.value.description) form.value.description = previewData.value.description;
}

async function submit() {
  if (!form.value.url) return ElMessage.warning('请输入URL');
  await api.addBookmark({ ...form.value, autoFetch: !form.value.title });
  ElMessage.success('已添加');
  router.push('/');
}

function reset() {
  form.value = { url: '', title: '', icon: '', description: '', folder_id: null, tags: [] };
  previewData.value = null;
}

onMounted(loadMeta);
</script>

<style scoped>
.icon { width: 16px; height: 16px; vertical-align: middle; }
</style>
