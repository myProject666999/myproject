<template>
  <div class="app-container">
    <Sidebar ref="sidebarRef" />
    <div class="main-content">
      <Toolbar 
        @search="handleSearch"
        @new-notebook="handleNewNotebook"
        @new-page="handleNewPage"
        @new-section="handleNewSection"
      />
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Toolbar from './components/Toolbar.vue'

const router = useRouter()
const sidebarRef = ref(null)

const handleSearch = (keyword) => {
  if (keyword && keyword.trim()) {
    router.push({ path: '/search', query: { q: keyword } })
  }
}

const handleNewNotebook = () => {
  if (sidebarRef.value) {
    sidebarRef.value.handleNewNotebook()
  }
}

const handleNewPage = (data) => {
  if (sidebarRef.value) {
    sidebarRef.value.handleNewPage(data)
  }
}

const handleNewSection = (data) => {
  if (sidebarRef.value) {
    sidebarRef.value.handleNewSection(data)
  }
}
</script>
