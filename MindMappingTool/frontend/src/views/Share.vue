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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { shareApi } from '../api'
import jsMind from 'jsmind'
import 'jsmind/style/jsmind.css'

const route = useRoute()
const title = ref('思维导图')
const viewCount = ref(0)
const jm = ref(null)

const loadShare = async () => {
  const code = route.params.code
  try {
    const res = await shareApi.get(code)
    if (res.data.code === 200) {
      const data = res.data.data
      title.value = data.title
      if (data.mindmapData) {
        try {
          let mindData
          if (typeof data.mindmapData === 'string') {
            mindData = JSON.parse(data.mindmapData)
          } else {
            mindData = data.mindmapData
          }
          await nextTick()
          initJsmind(mindData)
        } catch (parseError) {
          console.error('解析思维导图数据失败', parseError)
          alert('数据解析失败')
        }
      }
    } else {
      alert(res.data.message)
    }
  } catch (e) {
    console.error('加载分享失败', e)
    alert('加载失败：' + e.message)
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
  try {
    jm.value = new jsMind(options)
    jm.value.show(mindData)
  } catch (e) {
    console.error('jsMind 初始化失败', e)
    alert('jsMind 初始化失败：' + e.message)
  }
}

onMounted(() => {
  loadShare()
})

onUnmounted(() => {
  if (jm.value) {
    jm.value.destroy()
    jm.value = null
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
