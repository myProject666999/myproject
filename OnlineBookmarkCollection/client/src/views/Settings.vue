<template>
  <div class="page">
    <el-card shadow="never">
      <template #header><b>统计</b></template>
      <el-row :gutter="16">
        <el-col :span="6"><el-statistic title="书签总数" :value="stats.total" /></el-col>
        <el-col :span="6"><el-statistic title="正常" :value="stats.ok" /></el-col>
        <el-col :span="6"><el-statistic title="可疑" :value="stats.suspicious" /></el-col>
        <el-col :span="6"><el-statistic title="失效" :value="stats.dead" /></el-col>
        <el-col :span="6"><el-statistic title="文件夹数" :value="stats.folders" /></el-col>
        <el-col :span="6"><el-statistic title="标签数" :value="stats.tags" /></el-col>
      </el-row>
    </el-card>

    <el-card shadow="never" style="margin-top:16px">
      <template #header><b>标签管理</b></template>
      <el-form :inline="true">
        <el-input v-model="newTag" placeholder="新建标签" style="width:200px" />
        <el-button type="primary" @click="createTag">新建</el-button>
      </el-form>
      <div class="tag-cloud" style="margin-top:12px">
        <el-tag v-for="t in tags" :key="t.id" closable style="margin:4px" @close="delTag(t.id)">
          {{ t.name }}
        </el-tag>
      </div>
    </el-card>

    <el-card shadow="never" style="margin-top:16px">
      <template #header><b>导入/导出</b></template>
      <el-form :inline="true">
        <el-upload :auto-upload="false" :show-file-list="false" :on-change="readFile" accept=".html,.htm,.xml,.json">
          <el-button>选择书签文件</el-button>
        </el-upload>
        <el-select v-model="importFolder" clearable placeholder="导入到文件夹" style="width:200px">
          <el-option v-for="f in folders" :key="f.id" :label="f.name" :value="f.id" />
        </el-select>
        <el-button type="primary" :disabled="!importContent" @click="doImport">导入</el-button>
        <el-button type="success" @click="doExport">导出为HTML</el-button>
      </el-form>
      <div v-if="importContent" style="margin-top:10px">
        已选文件，{{ importContent.length }} 字符
      </div>
    </el-card>

    <el-card shadow="never" style="margin-top:16px">
      <template #header><b>失效链接</b></template>
      <p>定时任务默认每 6 小时自动检测一次。可在下方一键检测全部书签。</p>
      <el-button type="warning" :loading="checking" @click="runCheck">立即检测全部</el-button>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { api } from '../api';

const stats = ref({});
const tags = ref([]);
const folders = ref([]);
const newTag = ref('');
const importContent = ref('');
const importFolder = ref(null);
const checking = ref(false);

async function loadMeta() {
  stats.value = await api.stats();
  tags.value = await api.tags();
  folders.value = await api.folders();
}

async function createTag() {
  if (!newTag.value) return;
  await api.addTag({ name: newTag.value });
  newTag.value = '';
  ElMessage.success('已创建');
  loadMeta();
}

async function delTag(id) {
  await api.delTag(id);
  ElMessage.success('已删除');
  loadMeta();
}

function readFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => { importContent.value = e.target.result; };
  reader.readAsText(file.raw);
}

async function doImport() {
  if (!importContent.value) return;
  const r = await api.importBookmarks(importContent.value, importFolder.value || null);
  ElMessage.success(`已导入 ${r.imported} 条`);
  importContent.value = '';
  loadMeta();
}

async function doExport() {
  const blob = await api.exportBookmarks();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'bookmarks.html'; a.click();
  URL.revokeObjectURL(url);
}

async function runCheck() {
  checking.value = true;
  const list = await api.bookmarks({});
  let done = 0;
  for (const b of list) {
    try { await api.check(b.id); } catch (_) {}
    done++;
  }
  checking.value = false;
  ElMessage.success(`检测完成，共 ${done} 条`);
  loadMeta();
}

onMounted(loadMeta);
</script>
