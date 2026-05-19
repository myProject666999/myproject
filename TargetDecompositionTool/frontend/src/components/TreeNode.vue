<template>
  <div class="tree-node">
    <div class="node-content" :style="{ paddingLeft: level * 24 + 'px' }">
      <div class="node-left" @click="toggleExpand">
        <el-icon v-if="hasChildren" class="expand-icon" :class="{ expanded: expanded }">
          <ArrowRight />
        </el-icon>
        <span v-else class="placeholder"></span>
        <el-icon class="target-icon" :color="getPriorityColor(node.priority)">
          <Flag />
        </el-icon>
        <span class="node-title" @click.stop="goDetail">{{ node.title }}</span>
      </div>
      <div class="node-right">
        <el-progress
          :percentage="node.progress"
          :stroke-width="8"
          :color="getProgressColor(node.progress)"
          class="progress-bar"
        />
        <el-tag :type="getStatusType(node.status)" size="small" class="status-tag">
          {{ getStatusText(node.status) }}
        </el-tag>
        <el-dropdown @command="handleCommand">
          <el-button type="primary" text :icon="MoreFilled" circle size="small" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="add">
                <el-icon><Plus /></el-icon>新增子目标
              </el-dropdown-item>
              <el-dropdown-item command="edit">
                <el-icon><Edit /></el-icon>编辑
              </el-dropdown-item>
              <el-dropdown-item command="progress">
                <el-icon><TrendCharts /></el-icon>调整进度
              </el-dropdown-item>
              <el-dropdown-item command="archive" divided>
                <el-icon><Folder /></el-icon>归档
              </el-dropdown-item>
              <el-dropdown-item command="delete" divided>
                <el-icon><Delete /></el-icon>删除
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div v-if="hasChildren && expanded" class="children">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        @refresh="$emit('refresh')"
        @edit="$emit('edit', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowRight,
  Flag,
  MoreFilled,
  Plus,
  Edit,
  TrendCharts,
  Folder,
  Delete
} from '@element-plus/icons-vue'
import { deleteTarget } from '@/api/target'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['refresh', 'edit'])

const router = useRouter()
const expanded = ref(true)

const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

const toggleExpand = () => {
  if (hasChildren.value) {
    expanded.value = !expanded.value
  }
}

const goDetail = () => {
  router.push(`/target/${props.node.id}`)
}

const getPriorityColor = (priority) => {
  const colors = { 1: '#ef4444', 2: '#f59e0b', 3: '#6b7280' }
  return colors[priority] || '#6b7280'
}

const getProgressColor = (progress) => {
  if (progress >= 80) return '#10b981'
  if (progress >= 50) return '#3b82f6'
  if (progress >= 20) return '#f59e0b'
  return '#ef4444'
}

const getStatusType = (status) => {
  const types = { 1: 'success', 2: 'primary', 3: 'warning', 4: 'info' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 1: '进行中', 2: '已完成', 3: '已暂停', 4: '已归档' }
  return texts[status] || '未知'
}

const handleCommand = (command) => {
  switch (command) {
    case 'add':
      emit('edit', { parentId: props.node.id, isEdit: false })
      break
    case 'edit':
      emit('edit', { ...props.node, isEdit: true })
      break
    case 'progress':
      emit('edit', { ...props.node, isEdit: true, focusProgress: true })
      break
    case 'archive':
      handleArchive()
      break
    case 'delete':
      handleDelete()
      break
  }
}

const handleArchive = async () => {
  try {
    await ElMessageBox.confirm('确定要归档该目标吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteTarget(props.node.id)
    ElMessage.success('归档成功')
    emit('refresh')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('归档失败')
    }
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该目标吗？删除后无法恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    await deleteTarget(props.node.id)
    ElMessage.success('删除成功')
    emit('refresh')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.tree-node {
  border-bottom: 1px solid #f0f0f0;
}

.node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  transition: background-color 0.2s;
}

.node-content:hover {
  background-color: #f5f7fa;
}

.node-left {
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.expand-icon {
  transition: transform 0.2s;
  margin-right: 4px;
  font-size: 14px;
  color: #909399;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.placeholder {
  width: 18px;
  margin-right: 4px;
}

.target-icon {
  margin-right: 8px;
  font-size: 16px;
}

.node-title {
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-title:hover {
  color: #3b82f6;
}

.node-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.progress-bar {
  width: 120px;
}

.status-tag {
  margin-left: 8px;
}
</style>
