<template>
  <div class="reader-container" :class="{ 'fullscreen': isFullscreen }">
    <div class="reader-header" v-show="showControls">
      <div class="header-left">
        <el-button text @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="chapter-title">{{ chapter?.title }}</span>
      </div>
      <div class="header-right">
        <el-button text @click="toggleFullscreen">
          <el-icon><FullScreen /></el-icon>
        </el-button>
      </div>
    </div>

    <div 
      class="reader-content" 
      v-loading="loading"
      @click="toggleControls"
      @mousemove="handleMouseMove"
    >
      <div 
        v-if="chapter"
        class="images-container"
        :style="{ transform: `translateX(-${currentPage * 100}%)` }"
      >
        <div 
          v-for="(image, index) in chapter.images" 
          :key="index"
          class="image-page"
        >
          <LazyImage 
            :src="image" 
            :alt="`第${index + 1}页`"
          />
        </div>
      </div>

      <div 
        class="nav-left" 
        v-show="showControls && currentPage > 0"
        @click.stop="prevPage"
      >
        <el-icon :size="40"><ArrowLeft /></el-icon>
      </div>
      <div 
        class="nav-right" 
        v-show="showControls && chapter && currentPage < chapter.images.length - 1"
        @click.stop="nextPage"
      >
        <el-icon :size="40"><ArrowRight /></el-icon>
      </div>
    </div>

    <div class="reader-footer" v-show="showControls">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <div class="footer-info">
        <span>第 {{ currentPage + 1 }} / {{ chapter?.images.length || 0 }} 页</span>
        <div class="chapter-nav">
          <el-button 
            size="small" 
            :disabled="!chapter?.prev_chapter"
            @click="goToPrevChapter"
          >
            <el-icon><DArrowLeft /></el-icon>
            上一话
          </el-button>
          <el-button 
            size="small"
            :disabled="!chapter?.next_chapter"
            @click="goToNextChapter"
          >
            下一话
            <el-icon><DArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <div 
      class="thumbnail-panel" 
      v-show="showThumbnails && chapter"
      @click.stop
    >
      <div class="thumbnail-header">
        <span>章节目录</span>
        <el-button text @click="showThumbnails = false">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      <div class="thumbnail-list">
        <div 
          v-for="(image, index) in chapter.images" 
          :key="index"
          :class="['thumbnail-item', { active: index === currentPage }]"
          @click="jumpToPage(index)"
        >
          <img :src="image" :alt="`第${index + 1}页`" />
          <span>第{{ index + 1 }}页</span>
        </div>
      </div>
    </div>

    <el-button 
      class="thumbnail-toggle"
      v-show="showControls && chapter"
      @click="showThumbnails = !showThumbnails"
      circle
    >
      <el-icon><Grid /></el-icon>
    </el-button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chapterApi } from '@/api'
import LazyImage from '@/components/LazyImage.vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const comicId = route.params.comicId
const chapterId = route.params.chapterId

const chapter = ref(null)
const loading = ref(false)
const currentPage = ref(0)
const showControls = ref(true)
const showThumbnails = ref(false)
const isFullscreen = ref(false)
let controlsTimer = null

const progress = computed(() => {
  if (!chapter.value?.images?.length) return 0
  return ((currentPage.value + 1) / chapter.value.images.length) * 100
})

onMounted(() => {
  fetchChapter()
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
  clearTimeout(controlsTimer)
  if (isFullscreen.value) {
    document.exitFullscreen?.()
  }
})

watch(() => route.params.chapterId, (newId) => {
  if (newId !== chapterId) {
    fetchChapter()
  }
})

async function fetchChapter() {
  loading.value = true
  try {
    const res = await chapterApi.getDetail(comicId, chapterId)
    chapter.value = res.chapter
    currentPage.value = 0
  } catch (error) {
    console.error('获取章节内容失败', error)
    ElMessage.error('获取章节内容失败')
  } finally {
    loading.value = false
  }
}

function handleBack() {
  router.push(`/comic/${comicId}`)
}

function toggleControls() {
  showControls.value = !showControls.value
  if (showControls.value) {
    resetControlsTimer()
  }
}

function handleMouseMove() {
  if (!showControls.value) {
    showControls.value = true
  }
  resetControlsTimer()
}

function resetControlsTimer() {
  clearTimeout(controlsTimer)
  controlsTimer = setTimeout(() => {
    showControls.value = false
    showThumbnails.value = false
  }, 3000)
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value--
  } else if (chapter.value?.prev_chapter) {
    goToPrevChapter()
  }
}

function nextPage() {
  if (currentPage.value < chapter.value.images.length - 1) {
    currentPage.value++
  } else if (chapter.value?.next_chapter) {
    goToNextChapter()
  }
}

function jumpToPage(page) {
  currentPage.value = page
  showThumbnails.value = false
}

function goToPrevChapter() {
  if (chapter.value?.prev_chapter) {
    router.push(`/read/${comicId}/chapter/${chapter.value.prev_chapter.id}`)
  }
}

function goToNextChapter() {
  if (chapter.value?.next_chapter) {
    router.push(`/read/${comicId}/chapter/${chapter.value.next_chapter.id}`)
  }
}

function handleKeydown(e) {
  switch (e.key) {
    case 'ArrowLeft':
      prevPage()
      break
    case 'ArrowRight':
      nextPage()
      break
    case 'Escape':
      if (showThumbnails.value) {
        showThumbnails.value = false
      } else if (isFullscreen.value) {
        toggleFullscreen()
      }
      break
    case 'f':
    case 'F':
      toggleFullscreen()
      break
  }
}

function handleResize() {
  if (!document.fullscreenElement && isFullscreen.value) {
    isFullscreen.value = false
  }
}

async function toggleFullscreen() {
  try {
    if (!isFullscreen.value) {
      await document.documentElement.requestFullscreen()
      isFullscreen.value = true
    } else {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  } catch (error) {
    console.error('全屏切换失败', error)
  }
}
</script>

<style scoped>
.reader-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.reader-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 100;
  transition: opacity 0.3s;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chapter-title {
  color: white;
  font-size: 16px;
  font-weight: 500;
}

.reader-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.images-container {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.image-page {
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.image-page :deep(img) {
  max-width: 100%;
  max-height: calc(100vh - 140px);
  object-fit: contain;
}

.nav-left,
.nav-right {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 50;
}

.nav-left {
  left: 20px;
}

.nav-right {
  right: 20px;
}

.nav-left:hover,
.nav-right:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: translateY(-50%) scale(1.1);
}

.reader-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px;
  z-index: 100;
  transition: opacity 0.3s;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: #409eff;
  transition: width 0.3s;
}

.footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.chapter-nav {
  display: flex;
  gap: 8px;
}

.thumbnail-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  height: 100%;
  background: rgba(26, 26, 26, 0.95);
  z-index: 200;
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.thumbnail-header {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-weight: 500;
}

.thumbnail-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.thumbnail-item {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
}

.thumbnail-item.active {
  border-color: #409eff;
}

.thumbnail-item img {
  width: 100%;
  display: block;
}

.thumbnail-item span {
  display: block;
  text-align: center;
  padding: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.thumbnail-toggle {
  position: absolute;
  bottom: 80px;
  right: 20px;
  z-index: 150;
}
</style>
