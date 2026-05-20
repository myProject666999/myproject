<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1>📓 笔记本</h1>
      <button class="btn-icon" title="新建笔记本" @click="handleNewNotebook">➕</button>
    </div>
    <div class="sidebar-nav">
      <div 
        class="nav-item" 
        :class="{ active: currentRoute === '/notebooks' }"
        @click="handleNavClick('notebooks')"
      >
        📚 所有笔记本
      </div>
      <div 
        class="nav-item" 
        :class="{ active: currentRoute === '/favorites' }"
        @click="handleNavClick('favorites')"
      >
        ⭐ 收藏夹
      </div>
      <div 
        class="nav-item" 
        :class="{ active: currentRoute === '/recycle-bin' }"
        @click="handleNavClick('recycle-bin')"
      >
        🗑️ 回收站
      </div>
    </div>
    <div class="tree-container">
      <TreeNode 
        v-for="notebook in notebooks" 
        :key="notebook.id" 
        :node="notebook" 
        :type="'notebook'"
        @new-page="handleNewPage"
        @new-section="handleNewSection"
      />
    </div>
    <NewItemDialog 
      v-if="showDialog" 
      :type="dialogType"
      :parent-data="dialogParentData"
      @close="showDialog = false"
      @created="handleItemCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { notebookApi } from '../api'
import { store } from '../store'
import TreeNode from './TreeNode.vue'
import NewItemDialog from './NewItemDialog.vue'

const route = useRoute()
const router = useRouter()
const notebooks = ref([])
const showDialog = ref(false)
const dialogType = ref('page')
const dialogParentData = ref(null)

const currentRoute = computed(() => route.path)

const handleNavClick = (path) => {
  store.clearSelectedNode()
  router.push(`/${path}`)
}

const handleNewNotebook = () => {
  dialogType.value = 'notebook'
  dialogParentData.value = null
  showDialog.value = true
}

const handleNewPage = (data) => {
  dialogType.value = 'page'
  dialogParentData.value = data
  showDialog.value = true
}

const handleNewSection = (data) => {
  dialogType.value = 'section'
  dialogParentData.value = data
  showDialog.value = true
}

const handleItemCreated = () => {
  showDialog.value = false
  loadNotebooks()
}

const loadNotebooks = async () => {
  try {
    const res = await notebookApi.getAll()
    notebooks.value = res.data
  } catch (e) {
    console.error('Failed to load notebooks:', e)
  }
}

onMounted(() => {
  loadNotebooks()
})

defineExpose({
  handleNewPage,
  handleNewSection,
  handleNewNotebook
})
</script>
