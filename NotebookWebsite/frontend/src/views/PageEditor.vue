<template>
  <div class="content-area">
    <div v-if="page" style="height: 100%; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <input 
          type="text" 
          v-model="page.title" 
          class="page-title-input"
          placeholder="输入页面标题..."
        />
        <div style="display: flex; gap: 8px;">
          <button 
            class="btn btn-secondary" 
            @click="toggleFavorite"
          >
            {{ page.isFavorite ? '⭐ 已收藏' : '☆ 收藏' }}
          </button>
          <button class="btn btn-primary" @click="savePage">💾 保存</button>
          <button class="btn btn-danger" @click="deletePage">🗑️ 删除</button>
        </div>
      </div>
      <div class="editor-container" style="flex: 1;">
        <div class="editor-pane">
          <div class="pane-header">📝 Markdown 编辑</div>
          <textarea 
            v-model="page.content" 
            placeholder="在此输入 Markdown 内容..."
          ></textarea>
        </div>
        <div class="preview-pane">
          <div class="pane-header">👁️ 预览</div>
          <div class="preview-content" v-html="renderedContent"></div>
        </div>
      </div>
    </div>
    <div class="empty-state" v-else>
      <div class="empty-state-icon">📄</div>
      <h3>加载中...</h3>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { pageApi } from '../api'

const route = useRoute()
const router = useRouter()
const page = ref(null)

marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

const renderedContent = computed(() => {
  if (!page.value || !page.value.content) return '<p style="color: #999;">预览区域</p>'
  return marked(page.value.content)
})

const loadPage = async () => {
  try {
    const res = await pageApi.getById(route.params.pageId)
    page.value = res.data
  } catch (e) {
    console.error('Failed to load page:', e)
  }
}

const savePage = async () => {
  try {
    await pageApi.update(page.value.id, page.value)
    alert('保存成功！')
  } catch (e) {
    console.error('Failed to save page:', e)
    alert('保存失败！')
  }
}

const toggleFavorite = async () => {
  try {
    const res = await pageApi.toggleFavorite(page.value.id)
    page.value.isFavorite = res.data.isFavorite
  } catch (e) {
    console.error('Failed to toggle favorite:', e)
  }
}

const deletePage = async () => {
  if (confirm('确定要删除这篇笔记吗？它会被移动到回收站。')) {
    try {
      await pageApi.delete(page.value.id)
      router.push('/notebooks')
    } catch (e) {
      console.error('Failed to delete page:', e)
    }
  }
}

onMounted(() => {
  loadPage()
})

watch(() => route.params.pageId, () => {
  loadPage()
})
</script>
