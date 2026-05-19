<template>
  <div class="content-area">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>🗑️ 回收站</h2>
      <button class="btn btn-danger" @click="clearAll" v-if="items.length > 0">
        清空回收站
      </button>
    </div>
    <div v-if="items.length === 0" class="empty-state">
      <div class="empty-state-icon">🗑️</div>
      <h3>回收站为空</h3>
      <p>删除的笔记会出现在这里</p>
    </div>
    <div v-else>
      <div 
        v-for="item in items" 
        :key="item.id"
        style="background: #fff; padding: 16px; border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;"
      >
        <div style="flex: 1;">
          <h3 style="margin-bottom: 8px;">{{ item.title }}</h3>
          <p style="color: #666; font-size: 14px;">{{ getPreview(item.content) }}</p>
          <p style="margin-top: 8px; font-size: 12px; color: #999;">
            删除时间: {{ formatDate(item.deletedAt) }}
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary" @click="restoreItem(item.id)">恢复</button>
          <button class="btn btn-danger" @click="deletePermanent(item.id)">永久删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { recycleBinApi } from '../api'

const items = ref([])

const getPreview = (content) => {
  if (!content) return ''
  const text = content.replace(/[#*`]/g, '').substring(0, 100)
  return text + (text.length > 100 ? '...' : '')
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const loadItems = async () => {
  try {
    const res = await recycleBinApi.getAll()
    items.value = res.data
  } catch (e) {
    console.error('Failed to load recycle bin:', e)
  }
}

const restoreItem = async (id) => {
  if (confirm('确定要恢复这篇笔记吗？')) {
    try {
      await recycleBinApi.restore(id)
      alert('恢复成功！')
      loadItems()
    } catch (e) {
      console.error('Failed to restore:', e)
    }
  }
}

const deletePermanent = async (id) => {
  if (confirm('确定要永久删除这篇笔记吗？此操作不可恢复！')) {
    try {
      await recycleBinApi.permanentDelete(id)
      loadItems()
    } catch (e) {
      console.error('Failed to delete:', e)
    }
  }
}

const clearAll = async () => {
  if (confirm('确定要清空回收站吗？所有内容将被永久删除！')) {
    try {
      await recycleBinApi.clearAll()
      loadItems()
    } catch (e) {
      console.error('Failed to clear:', e)
    }
  }
}

onMounted(() => {
  loadItems()
})
</script>
