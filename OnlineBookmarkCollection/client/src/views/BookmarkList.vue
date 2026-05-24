<template>
  <div class="page">
    <el-card shadow="never" class="filter-bar">
      <div class="row">
        <el-select v-model="folderId" placeholder="全部文件夹" clearable style="width: 200px" @change="load">
          <el-option v-for="f in folders" :key="f.id" :label="f.name" :value="f.id" />
        </el-select>
        <el-select v-model="tagId" placeholder="全部标签" clearable style="width: 180px" @change="load">
          <el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.id" />
        </el-select>
        <el-select v-model="status" placeholder="全部状态" clearable style="width: 140px" @change="load">
          <el-option label="正常" :value="1" />
          <el-option label="可疑" :value="2" />
          <el-option label="失效" :value="3" />
        </el-select>
        <el-input v-model="keyword" placeholder="搜索关键词" style="width: 220px" clearable @keyup.enter="load" @clear="load" />
        <el-button type="primary" @click="load">查询</el-button>
        <el-button type="danger" :disabled="!selection.length" @click="batchDelete">
          批量删除 ({{ selection.length }})
        </el-button>
        <div style="flex:1"></div>
        <el-tag type="success">总数 {{ stats.total }}</el-tag>
        <el-tag type="warning">可疑 {{ stats.suspicious }}</el-tag>
        <el-tag type="danger">失效 {{ stats.dead }}</el-tag>
      </div>
    </el-card>

    <el-table :data="list" row-key="id" @selection-change="selection=$event" style="margin-top:16px">
      <el-table-column type="selection" width="48" />
      <el-table-column label="图标" width="60">
        <template #default="{ row }">
          <img v-if="row.icon" :src="row.icon" class="icon" @error="$event.target.style.display='none'" />
          <el-icon v-else><Link /></el-icon>
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="220">
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
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.status===1" type="success">正常</el-tag>
          <el-tag v-else-if="row.status===2" type="warning">可疑</el-tag>
          <el-tag v-else type="danger">失效</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="170" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="edit(row)">编辑</el-button>
          <el-button size="small" type="info" @click="checkOne(row)">检测</el-button>
          <el-button size="small" type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="editVisible" title="编辑书签" width="520px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="URL"><el-input v-model="form.url" /></el-form-item>
        <el-form-item label="图标"><el-input v-model="form.icon" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="2" /></el-form-item>
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
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="2">可疑</el-radio>
            <el-radio :value="3">失效</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible=false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { api } from '../api';

const list = ref([]);
const folders = ref([]);
const tags = ref([]);
const folderId = ref(null);
const tagId = ref(null);
const status = ref(null);
const keyword = ref('');
const selection = ref([]);
const stats = ref({ total: 0, ok: 0, suspicious: 0, dead: 0 });

const editVisible = ref(false);
const form = ref({});

async function load() {
  const params = {};
  if (folderId.value) params.folder_id = folderId.value;
  if (tagId.value) params.tag_id = tagId.value;
  if (status.value) params.status = status.value;
  if (keyword.value) params.keyword = keyword.value;
  list.value = await api.bookmarks(params);
  stats.value = await api.stats();
}

async function loadMeta() {
  folders.value = await api.folders();
  tags.value = await api.tags();
}

function edit(row) {
  form.value = { ...row, tags: (row.tags || []).map((t) => t.name) };
  editVisible.value = true;
}

async function save() {
  await api.updateBookmark(form.value.id, form.value);
  editVisible.value = false;
  ElMessage.success('已保存');
  load();
  loadMeta();
}

async function remove(row) {
  try {
    await ElMessageBox.confirm(`确定删除书签《${row.title}》？`, '提示', { type: 'warning' });
    await api.delBookmark(row.id);
    ElMessage.success('已删除');
    load();
  } catch (_) {}
}

async function batchDelete() {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selection.value.length} 个书签？`, '提示', { type: 'warning' });
    await api.batchDelete(selection.value.map((x) => x.id));
    ElMessage.success('批量删除成功');
    load();
  } catch (_) {}
}

async function checkOne(row) {
  const r = await api.check(row.id);
  ElMessage.info(`检测结果：status=${r.status} code=${r.statusCode}`);
  load();
}

onMounted(() => { loadMeta(); load(); });
</script>

<style scoped>
.filter-bar .row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.title { color: #409eff; }
.url { color: #999; font-size: 12px; margin-top: 4px; word-break: break-all; }
.icon { width: 18px; height: 18px; vertical-align: middle; }
</style>
