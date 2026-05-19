<template>
  <div class="content-area">
    <div class="empty-state" v-if="notebooks.length === 0">
      <div class="empty-state-icon">📒</div>
      <h3>暂无笔记本</h3>
      <p>点击上方"新建"按钮创建第一个笔记本</p>
    </div>
    <div v-else>
      <h2 style="margin-bottom: 20px;">📚 所有笔记本</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
        <div 
          v-for="notebook in notebooks" 
          :key="notebook.id"
          style="background: #fff; padding: 20px; border-radius: 8px; cursor: pointer; transition: box-shadow 0.2s;"
          @click="$router.push(`/notebook/${notebook.id}`)"
        >
          <h3 style="margin-bottom: 8px;">📒 {{ notebook.name }}</h3>
          <p style="color: #666; font-size: 14px;">{{ notebook.description || '暂无描述' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { notebookApi } from '../api'

const notebooks = ref([])

onMounted(async () => {
  try {
    const res = await notebookApi.getAll()
    notebooks.value = res.data
  } catch (e) {
    console.error('Failed to load notebooks:', e)
  }
})
</script>
