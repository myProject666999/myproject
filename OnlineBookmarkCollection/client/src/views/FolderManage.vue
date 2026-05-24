<template>
  <div class="page">
    <el-card shadow="never">
      <template #header>
        <div style="display:flex; justify-content:space-between">
          <b>文件夹管理</b>
          <el-button type="primary" @click="openCreate">新建</el-button>
        </div>
      </template>
      <el-table :data="folders" row-key="id">
        <el-table-column prop="name" label="名称" />
        <el-table-column label="父级">
          <template #default="{ row }">{{ parentName(row.parent_id) }}</template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="created_at" label="创建时间" width="170" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" :disabled="row.id===1" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="visible" :title="form.id ? '编辑' : '新建' + '文件夹'" width="420px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="父级">
          <el-select v-model="form.parent_id" clearable style="width:100%">
            <el-option v-for="f in selectableParents" :key="f.id" :label="f.name" :value="f.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible=false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { api } from '../api';

const folders = ref([]);
const visible = ref(false);
const form = ref({ name: '', parent_id: null, sort: 0 });

const selectableParents = computed(() =>
  folders.value.filter((f) => !form.value.id || f.id !== form.value.id)
);

async function load() { folders.value = await api.folders(); }

function parentName(pid) {
  if (!pid) return '-';
  return folders.value.find((f) => f.id === pid)?.name || '-';
}

function openCreate() {
  form.value = { name: '', parent_id: null, sort: 0 };
  visible.value = true;
}

function openEdit(row) {
  form.value = { ...row };
  visible.value = true;
}

async function submit() {
  if (!form.value.name) return ElMessage.warning('请输入名称');
  if (form.value.id) {
    await api.updateFolder(form.value.id, form.value);
  } else {
    await api.addFolder(form.value);
  }
  visible.value = false;
  ElMessage.success('已保存');
  load();
}

async function remove(row) {
  try {
    await ElMessageBox.confirm('删除此文件夹将把其中书签移至“未分类”，是否继续？', '提示', { type: 'warning' });
    await api.delFolder(row.id);
    ElMessage.success('已删除');
    load();
  } catch (_) {}
}

onMounted(load);
</script>
