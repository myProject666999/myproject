<template>
  <div class="target-tree">
    <div
      v-for="item in treeData"
      :key="item.id"
      class="tree-node"
    >
      <div class="node-content" :class="{ 'has-children': item.children && item.children.length > 0 }">
        <div class="node-left" @click="toggleExpand(item.id)">
          <el-icon v-if="item.children && item.children.length > 0" class="expand-icon">
            <CaretRight v-if="!expandedIds.includes(item.id)" />
            <CaretBottom v-else />
          </el-icon>
          <el-icon v-else class="placeholder-icon"><Circle /></el-icon>
          <el-tag
            :type="getPriorityType(item.priority)"
            size="small"
            effect="light"
            class="priority-tag"
          >
            {{ getPriorityText(item.priority) }}
          </el-tag>
          <span class="node-title" @click.stop="goToDetail(item.id)">{{ item.title }}</span>
        </div>
        <div class="node-right">
          <div class="progress-wrapper">
            <el-progress
              :percentage="item.progress"
              :stroke-width="6"
              :color="getProgressColor(item.progress)"
              :show-text="false"
              style="width: 100px"
            />
            <span class="progress-text">{{ item.progress }}%</span>
          </div>
          <el-dropdown @command="(cmd) => handleCommand(cmd, item)">
            <el-button type="primary" link :icon="MoreFilled" circle size="small" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="addChild">
                  <el-icon><Plus /></el-icon>新增子目标
                </el-dropdown-item>
                <el-dropdown-item command="edit">
                  <el-icon><Edit /></el-icon>编辑
                </el-dropdown-item>
                <el-dropdown-item command="delete" divided>
                  <el-icon><Delete /></el-icon>删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div v-if="expandedIds.includes(item.id) && item.children && item.children.length > 0" class="children-wrapper">
        <TargetTree :tree-data="item.children" @refresh="emit('refresh')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  CaretRight,
  CaretBottom,
  Circle,
  MoreFilled,
  Plus,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { deleteTarget } from '@/api/target'

const props = defineProps({
  treeData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

const router = useRouter()
const expandedIds = ref([])

const toggleExpand = (id) => {
  const index = expandedIds.value.indexOf(id)
  if (index > -1) {
    expandedIds.value.splice(index, 1)
  } else {
    expandedIds.value.push(id)
  }
}

const goToDetail = (id) => {
  router.push(`/target/${id}`)
}

const getPriorityType = (priority) => {
  const map = { 1: 'danger', 2: 'warning', 3: 'info' }
  return map[priority] || 'info'
}

const getPriorityText = (priority) => {
  const map = { 1: '高', 2: '中', 3: '低' }
  return map[priority] || '中'
}

const getProgressColor = (progress) => {
  if (progress >= 80) return '#10b981'
  if (progress >= 50) return '#3b82f6'
  if (progress >= 20) return '#f59e0b'
  return '#ef4444'
}

const handleCommand = async (cmd, item) => {
  if (cmd === 'delete') {
    try {
      await ElMessageBox.confirm('确定要删除该目标吗？所有子目标也将被删除。', '提示', {
        type: 'warning'
      })
      await deleteTarget(item.id)
      ElMessage.success('删除成功')
      emit('refresh')
    } catch (e) {
      if (e !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  } else if (cmd === 'edit') {
    goToDetail(item.id)
  } else if (cmd === 'addChild') {
    goToDetail(item.id)
  }
}
</script>

<style scoped>
.target-tree {
  padding-left: 8px;
}

.tree-node {
  margin-bottom: 8px;
}

.node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.2s;
}

.node-content:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.node-left {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.expand-icon {
  color: #909399;
  transition: transform 0.2s;
}

.placeholder-icon {
  color: #dcdfe6;
  width: 16px;
  height: 16px;
}

.priority-tag {
  flex-shrink: 0;
}

.node-title {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #606266;
  min-width: 35px;
  text-align: right;
}

.children-wrapper {
  margin-top: 8px;
  padding-left: 24px;
  border-left: 2px dashed #e4e7ed;
  margin-left: 12px;
}
</style>
