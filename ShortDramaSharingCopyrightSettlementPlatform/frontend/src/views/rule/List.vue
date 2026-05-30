<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">分账规则</span>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增规则
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="rule_no" label="规则编号" width="180" />
        <el-table-column prop="rule_name" label="规则名称" min-width="200" />
        <el-table-column prop="rule_type" label="规则类型" width="120">
          <template #default="{ row }">
            {{ row.rule_type === 1 ? '固定比例' : '阶梯比例' }}
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleBind(row)">绑定剧集</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" title="新增规则" width="600px">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item label="规则名称">
          <el-input v-model="form.rule_name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="规则类型">
          <el-select v-model="form.rule_type" style="width: 100%">
            <el-option label="固定比例" :value="1" />
            <el-option label="阶梯比例" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="form.priority" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="DSL配置">
          <el-input
            v-model="dslText"
            type="textarea"
            :rows="6"
            placeholder='{"base_ratio": 70, "platform_ratio": 30}'
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRuleList, createRule, deleteRule } from '@/api/rule'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)

const form = reactive({
  rule_name: '',
  rule_type: 1,
  priority: 10
})

const dslText = ref('{"base_ratio": 70, "platform_ratio": 30}')

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRuleList({ page_size: 100 })
    if (res) {
      tableData.value = res.list || []
    }
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogVisible.value = true
}

const handleEdit = (row) => {
  ElMessage.info('编辑功能开发中')
}

const handleBind = (row) => {
  ElMessage.info('绑定剧集功能开发中')
}

const handleSubmit = async () => {
  try {
    const dslContent = JSON.parse(dslText.value)
    await createRule({
      ...form,
      dsl_content: dslContent
    })
    ElMessage.success('创建成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('DSL格式错误或创建失败')
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该规则吗？', '提示', { type: 'warning' })
    await deleteRule(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
    }
  }
}

onMounted(() => {
  loadData()
})
</script>
