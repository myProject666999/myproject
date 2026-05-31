<template>
  <div>
    <div class="page-header">
      <span class="page-title">机器人配置</span>
      <el-button type="primary" @click="openDialog">新建机器人</el-button>
    </div>
    
    <div class="card-wrapper">
      <el-table :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="webhook_url" label="Webhook地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="is_default" label="默认" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.is_default === 1" type="success" size="small">是</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteRobot(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑机器人' : '新建机器人'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="机器人名称" required>
          <el-input v-model="form.name" placeholder="请输入机器人名称" />
        </el-form-item>
        <el-form-item label="机器人类型" required>
          <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%;">
            <el-option label="钉钉" value="dingtalk" />
            <el-option label="企业微信" value="wechat" />
            <el-option label="飞书" value="feishu" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="Webhook地址" required>
          <el-input v-model="form.webhook_url" placeholder="请输入Webhook地址" />
        </el-form-item>
        <el-form-item label="签名密钥">
          <el-input v-model="form.secret" placeholder="请输入签名密钥(可选)" />
        </el-form-item>
        <el-form-item label="访问令牌">
          <el-input v-model="form.token" placeholder="请输入访问令牌(可选)" />
        </el-form-item>
        <el-form-item label="@手机号">
          <el-select v-model="form.at_mobiles" multiple placeholder="请输入手机号" style="width: 100%;" allow-create filterable />
        </el-form-item>
        <el-form-item label="@所有人">
          <el-radio-group v-model="form.at_all">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设为默认">
          <el-radio-group v-model="form.is_default">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRobot" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRobots, createRobot, updateRobot, deleteRobot as deleteRobotApi } from '@/api'

const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)

const form = ref({
  name: '',
  type: 'dingtalk',
  webhook_url: '',
  secret: '',
  token: '',
  at_mobiles: [],
  at_all: 0,
  is_default: 0,
  status: 1
})

const resetForm = () => {
  form.value = {
    name: '',
    type: 'dingtalk',
    webhook_url: '',
    secret: '',
    token: '',
    at_mobiles: [],
    at_all: 0,
    is_default: 0,
    status: 1
  }
}

const loadData = async () => {
  try {
    const res = await getRobots({ page: 1, page_size: 100 })
    tableData.value = res.list || []
  } catch (error) {
    console.error(error)
  }
}

const openDialog = (row = null) => {
  resetForm()
  isEdit.value = !!row
  if (row) {
    Object.assign(form.value, JSON.parse(JSON.stringify(row)))
  }
  dialogVisible.value = true
}

const saveRobot = async () => {
  try {
    saving.value = true
    if (isEdit.value) {
      await updateRobot(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createRobot(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  } finally {
    saving.value = false
  }
}

const handleDeleteRobot = (row) => {
  ElMessageBox.confirm(`确定要删除机器人"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRobotApi(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>
