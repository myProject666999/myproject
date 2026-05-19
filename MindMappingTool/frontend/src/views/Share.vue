<template>
  <div class="share-container">
    <div class="header">
      <h1>{{ title }}</h1>
      <span class="view-count">浏览次数：{{ viewCount }}</span>
    </div>
    <div id="jsmind-container" class="mindmap-area"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { shareApi } from '../api'
import 'jsmind'

const route = useRoute()
const title = ref('思维导图')
const viewCount = ref(0)
let jm = null

const loadShare = async () => {
  const code = route.params.code
  const res = await shareApi.get(code)
  if (res.data.code === 200) {
    const data = res.data.data
    title.value = data.title
    if (data.mindmapData) {
      initJsmind(data.mindmapData)
    }
  } else {
    alert(res.data.message)
  }
}

const initJsmind = (mindData) => {
  const options = {
    container: 'jsmind-container',
    editable: false,
    theme: 'asphalt',
    mode: 'full',
    view: {
      hmargin: 100,
      vmargin: 50,
      line_width: 2,
      line_color: '#ccc'
    },
    layout: {
      hspace: 30,
      vspace: 20
    }
  }
  jm = new jsMind(options)
  jm.show(mindData)
}

onMounted(() => {
  loadShare()
})

onUnmounted(() => {
  if (jm) {
    jm.destroy()
  }
})
</script>

<style scoped>
.share-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}
.header {
  background: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.header h1 {
  margin: 0;
  color: #333;
}
.view-count {
  color: #999;
  font-size: 14px;
}
.mindmap-area {
  flex: 1;
  overflow: auto;
}
</style>
