<template>
  <div class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog">
      <div class="dialog-header">
        <h3>{{ getDialogTitle() }}</h3>
        <button class="btn-icon" @click="$emit('close')">✕</button>
      </div>
      <div class="dialog-body">
        <div class="form-group">
          <label>{{ getLabel() }}</label>
          <input 
            type="text" 
            v-model="formData.name" 
            :placeholder="getPlaceholder()"
            @keyup.enter="handleSubmit"
            ref="inputRef"
          />
        </div>
        <div class="form-group" v-if="type === 'notebook'">
          <label>描述（可选）</label>
          <textarea v-model="formData.description" placeholder="输入描述..." rows="3"></textarea>
        </div>
        <div v-if="parentData" class="parent-info">
          <span>位置: {{ getParentName() }}</span>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-secondary" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" @click="handleSubmit" :disabled="!formData.name.trim()">创建</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { notebookApi, sectionApi, pageApi } from '../api'

const props = defineProps({
  type: {
    type: String,
    default: 'page'
  },
  parentData: Object
})

const emit = defineEmits(['close', 'created'])
const router = useRouter()
const inputRef = ref(null)

const formData = reactive({
  name: '',
  description: ''
})

const getDialogTitle = () => {
  switch (props.type) {
    case 'notebook': return '📒 新建笔记本'
    case 'section': return '📁 新建分区'
    case 'page': return '📄 新建页面'
    default: return '新建'
  }
}

const getLabel = () => {
  switch (props.type) {
    case 'notebook': return '笔记本名称'
    case 'section': return '分区名称'
    case 'page': return '页面标题'
    default: return '名称'
  }
}

const getPlaceholder = () => {
  switch (props.type) {
    case 'notebook': return '输入笔记本名称...'
    case 'section': return '输入分区名称...'
    case 'page': return '输入页面标题...'
    default: return '请输入名称...'
  }
}

const getParentName = () => {
  if (!props.parentData) return ''
  const name = props.parentData.name || props.parentData.title
  const icon = props.parentData.type === 'notebook' ? '📒' : '📁'
  return `${icon} ${name}`
}

const handleSubmit = async () => {
  if (!formData.name.trim()) return
  
  try {
    let response
    switch (props.type) {
      case 'notebook':
        response = await notebookApi.create({
          name: formData.name.trim(),
          description: formData.description.trim()
        })
        break
      case 'section':
        response = await sectionApi.create({
          name: formData.name.trim(),
          notebookId: props.parentData.notebookId || props.parentData.id,
          parentId: props.parentData.type === 'section' ? props.parentData.id : null
        })
        break
      case 'page':
        let sectionId
        if (props.parentData.type === 'section') {
          sectionId = props.parentData.id
        } else if (props.parentData.type === 'notebook') {
          const sectionsRes = await sectionApi.getByNotebook(props.parentData.id)
          if (sectionsRes.data.length > 0) {
            sectionId = sectionsRes.data[0].id
          } else {
            const newSection = await sectionApi.create({
              name: '默认分区',
              notebookId: props.parentData.id,
              parentId: null
            })
            sectionId = newSection.data.id
          }
        }
        response = await pageApi.create({
          title: formData.name.trim(),
          content: '',
          sectionId: sectionId
        })
        emit('created')
        router.push(`/page/${response.data.id}`)
        return
    }
    emit('created')
  } catch (e) {
    console.error('Create failed:', e)
    alert('创建失败，请检查网络连接')
  }
}

onMounted(() => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
})
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: #fff;
  border-radius: 8px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1976d2;
}

.parent-info {
  padding: 10px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
}

.dialog-footer {
  padding: 12px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
