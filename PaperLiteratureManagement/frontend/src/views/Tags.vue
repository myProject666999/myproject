<template>
  <div class="tags-page">
    <div class="page-header">
      <h1 class="page-title">标签管理</h1>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        新建标签
      </el-button>
    </div>

    <div class="card">
      <div class="tags-grid">
        <div 
          v-for="tag in tags" 
          :key="tag.id"
          class="tag-card"
        >
          <div class="tag-card-header">
            <div class="tag-info">
              <span 
                class="tag-color"
                :style="{ backgroundColor: tag.color }"
              ></span>
              <span class="tag-name">{{ tag.name }}</span>
            </div>
            <div class="tag-actions">
              <el-button 
                size="small"
                @click="editTag(tag)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button 
                size="small" 
                type="danger"
                @click="deleteTag(tag)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tags.length === 0" class="empty-state">
        <el-empty description="暂无标签，点击上方按钮创建第一个标签" />
      </div>
    </div>

    <el-dialog 
      v-model="showAddDialog" 
      :title="editingTag ? '编辑标签' : '新建标签'"
      width="400px"
    >
      <el-form :model="tagForm" label-width="80px">
        <el-form-item label="标签名称" required>
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="tagForm.color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="saveTag">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { tagApi } from '@/api'

const tags = ref([])
const showAddDialog = ref(false)
const editingTag = ref(null)

const tagForm = ref({
  name: '',
  color: '#3b82f6'
})

const loadTags = async () => {
  try {
    const res = await tagApi.getAll()
    if (res.success) {
      tags.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载标签失败')
  }
}

const editTag = (tag) => {
  editingTag.value = tag
  tagForm.value = {
    name: tag.name,
    color: tag.color
  }
  showAddDialog.value = true
}

const saveTag = async () => {
  if (!tagForm.value.name) {
    ElMessage.warning('请输入标签名称')
    return
  }
  
  try {
    if (editingTag.value) {
      await tagApi.update(editingTag.value.id, tagForm.value)
      ElMessage.success('更新成功')
    } else {
      await tagApi.create(tagForm.value)
      ElMessage.success('创建成功')
    }
    closeDialog()
    loadTags()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const deleteTag = async (tag) => {
  try {
    await ElMessageBox.confirm(`确定要删除标签"${tag.name}"吗？`, '确认删除', {
      type: 'warning'
    })
    await tagApi.delete(tag.id)
    ElMessage.success('删除成功')
    loadTags()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const closeDialog = () => {
  showAddDialog.value = false
  editingTag.value = null
  tagForm.value = {
    name: '',
    color: '#3b82f6'
  }
}

onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.tags-page {
  min-height: 100%;
}

.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.tag-card {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.tag-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.tag-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tag-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.tag-name {
  font-weight: 500;
  color: #303133;
}

.tag-actions {
  display: flex;
  gap: 4px;
}
</style>
