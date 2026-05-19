<template>
  <div class="target-tree-page">
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <div class="stat-card gradient-blue">
          <div class="stat-icon">
            <el-icon size="32"><Flag /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总目标数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card gradient-green">
          <div class="stat-icon">
            <el-icon size="32"><VideoPlay /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.inProgress }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card gradient-purple">
          <div class="stat-icon">
            <el-icon size="32"><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card gradient-orange">
          <div class="stat-icon">
            <el-icon size="32"><FolderOpened /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.archived }}</div>
            <div class="stat-label">已归档</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="card">
      <div class="card-header">
        <h3>目标树</h3>
        <el-button type="primary" :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
      <div class="tree-container" v-loading="loading">
        <TreeNode
          v-for="node in treeData"
          :key="node.id"
          :node="node"
          @refresh="loadData"
          @edit="handleEdit"
        />
        <el-empty v-if="!loading && treeData.length === 0" description="暂无目标，点击右上角新增第一个目标吧" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="editForm.isEdit ? '编辑目标' : '新增子目标'" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="目标标题">
          <el-input v-model="editForm.title" placeholder="请输入目标标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入目标描述" />
        </el-form-item>
        <el-form-item label="进度">
          <el-slider v-model="editForm.progress" :min="0" :max="100" :step="5" show-input />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="editForm.priority">
            <el-option label="高" :value="1" />
            <el-option label="中" :value="2" />
            <el-option label="低" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status">
            <el-option label="进行中" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已暂停" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="editForm.startDate" type="date" placeholder="选择开始日期" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker v-model="editForm.endDate" type="date" placeholder="选择结束日期" value-format="YYYY-MM-DD" />
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
import { ElMessage } from 'element-plus'
import { Flag, VideoPlay, CircleCheck, FolderOpened, Refresh } from '@element-plus/icons-vue'
import TreeNode from '@/components/TreeNode.vue'
import { getTargetList, addTarget, updateTarget } from '@/api/target'

const loading = ref(false)
const treeData = ref([])
const dialogVisible = ref(false)

const stats = reactive({
  total: 0,
  inProgress: 0,
  completed: 0,
  archived: 0
})

const editForm = reactive({
  id: null,
  parentId: null,
  title: '',
  description: '',
  progress: 0,
  priority: 2,
  status: 1,
  startDate: '',
  endDate: '',
  isEdit: false
})

const buildTree = (list) => {
  const map = {}
  const roots = []
  
  list.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })
  
  list.forEach(item => {
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(map[item.id])
    } else if (!item.parentId) {
      roots.push(map[item.id])
    }
  })
  
  return roots
}

const loadData = async () => {
  loading.value = true
  try {
    const list = await getTargetList()
    treeData.value = buildTree(list)
    
    stats.total = list.length
    stats.inProgress = list.filter(t => t.status === 1).length
    stats.completed = list.filter(t => t.status === 2).length
    stats.archived = list.filter(t => t.status === 4).length
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleEdit = (data) => {
  Object.assign(editForm, {
    id: data.id || null,
    parentId: data.parentId || null,
    title: data.title || '',
    description: data.description || '',
    progress: data.progress || 0,
    priority: data.priority || 2,
    status: data.status || 1,
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    isEdit: !!data.isEdit
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!editForm.title) {
    ElMessage.warning('请输入目标标题')
    return
  }
  
  try {
    if (editForm.isEdit) {
      await updateTarget(editForm.id, editForm)
      ElMessage.success('更新成功')
    } else {
      await addTarget(editForm)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.target-tree-page {
  min-height: 100%;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 24px;
  border-radius: 12px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.gradient-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.gradient-purple {
  background: linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%);
}

.gradient-orange {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon {
  margin-right: 16px;
  opacity: 0.9;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.tree-container {
  min-height: 400px;
}
</style>
