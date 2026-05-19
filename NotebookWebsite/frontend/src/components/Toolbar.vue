<template>
  <div class="toolbar">
    <div class="search-box">
      <input 
        type="text" 
        v-model="searchKeyword" 
        placeholder="搜索笔记内容..."
        @keyup.enter="handleSearch"
      />
      <button class="btn btn-primary" @click="handleSearch">搜索</button>
    </div>
    <div class="toolbar-actions">
      <div class="dropdown" v-if="store.selectedNode">
        <button class="btn btn-primary" @click="toggleDropdown">
          + 新建 ▼
        </button>
        <div class="dropdown-menu" v-show="showDropdown" @click="showDropdown = false">
          <button class="dropdown-item" @click="handleNewPage" v-if="canCreatePage">📄 新建页面</button>
          <button class="dropdown-item" @click="handleNewSection" v-if="canCreateSection">📁 新建分区</button>
        </div>
      </div>
      <button class="btn btn-secondary" v-else @click="handleNewNotebook">
        + 新建笔记本
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store'

const emit = defineEmits(['search', 'new-notebook', 'new-page', 'new-section'])

const searchKeyword = ref('')
const showDropdown = ref(false)

const canCreatePage = computed(() => {
  return store.selectedNode && 
         store.selectedNode.type !== 'page'
})

const canCreateSection = computed(() => {
  return store.selectedNode && 
         store.selectedNode.type !== 'page'
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleSearch = () => {
  emit('search', searchKeyword.value)
}

const handleNewNotebook = () => {
  emit('new-notebook')
}

const handleNewPage = () => {
  if (store.selectedNode) {
    emit('new-page', store.selectedNode)
  }
}

const handleNewSection = () => {
  if (store.selectedNode) {
    emit('new-section', store.selectedNode)
  }
}
</script>

<style scoped>
.toolbar-actions {
  position: relative;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  min-width: 150px;
  z-index: 100;
  margin-top: 4px;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary:hover {
  background: #bdbdbd;
}
</style>
