<template>
  <div class="page">
    <el-card shadow="never">
      <template #header><b>搜索</b></template>
      <el-form :inline="true">
        <el-input v-model="keyword" placeholder="标题 / URL / 描述" style="width: 320px" clearable />
        <el-select v-model="tagId" placeholder="标签" clearable style="width:180px">
          <el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.id" />
        </el-select>
        <el-button type="primary" @click="search">搜索</el-button>
      </el-form>
    </el-card>
    <el-table :data="list" style="margin-top:16px" row-key="id">
      <el-table-column label="标题" min-width="260">
        <template #default="{ row }">
          <a :href="row.url" target="_blank" class="title">{{ row.title }}</a>
          <div class="url">{{ row.url }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="folder_name" label="文件夹" width="120" />
      <el-table-column label="标签" width="200">
        <template #default="{ row }">
          <el-tag v-for="t in row.tags" :key="t.id" size="small" style="margin-right:4px">{{ t.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="170" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../api';

const list = ref([]);
const tags = ref([]);
const keyword = ref('');
const tagId = ref(null);

async function search() {
  const params = {};
  if (keyword.value) params.keyword = keyword.value;
  if (tagId.value) params.tag_id = tagId.value;
  list.value = await api.bookmarks(params);
}

onMounted(async () => { tags.value = await api.tags(); search(); });
</script>

<style scoped>
.title { color: #409eff; }
.url { color: #999; font-size: 12px; margin-top: 4px; word-break: break-all; }
</style>
