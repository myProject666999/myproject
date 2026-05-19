<template>
  <div class="editor-container">
    <div class="toolbar">
      <div class="left">
        <button class="btn btn-primary" @click="back">返回列表</button>
        <input v-model="title" class="title-input" placeholder="请输入导图标题" />
      </div>
      <div class="right">
        <select v-model="theme" class="theme-select">
          <option value="primary">默认主题</option>
          <option value="success">清新绿</option>
          <option value="warning">活力橙</option>
          <option value="danger">热情红</option>
          <option value="info">沉稳蓝</option>
        </select>
        <button class="btn btn-primary" @click="addNode">添加节点</button>
        <button class="btn btn-warning" @click="editNode">编辑节点</button>
        <button class="btn btn-danger" @click="removeNode">删除节点</button>
        <button class="btn btn-success" @click="save">保存</button>
        <button class="btn btn-primary" @click="exportImage">导出图片</button>
      </div>
    </div>
    <div id="jsmind-container" class="mindmap-area"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mindmapApi } from '../api'
import jsMind from 'jsmind'
import 'jsmind/style/jsmind.css'
import html2canvas from 'html2canvas'

const route = useRoute()
const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')
const mindmapId = ref(route.params.id)
const title = ref('新建思维导图')
const theme = ref('primary')
const jm = ref(null)
const isReady = ref(false)

const defaultMindData = {
  meta: {
    name: 'jsmind',
    version: '0.4.7'
  },
  data: {
    id: 'root',
    topic: '思维导图中心',
    children: []
  }
}

const mindData = ref({ ...defaultMindData })

const themeColors = {
  primary: { background: '#f5f7fa', rootBg: '#409eff', nodeBg: '#ecf5ff' },
  success: { background: '#f0f9eb', rootBg: '#67c23a', nodeBg: '#f0f9eb' },
  warning: { background: '#fdf6ec', rootBg: '#e6a23c', nodeBg: '#fdf6ec' },
  danger: { background: '#fef0f0', rootBg: '#f56c6c', nodeBg: '#fef0f0' },
  info: { background: '#ecf5ff', rootBg: '#909399', nodeBg: '#ecf5ff' }
}

const initJsmind = async () => {
  await nextTick()
  const container = document.getElementById('jsmind-container')
  if (!container) return
  
  const colors = themeColors[theme.value]
  container.style.backgroundColor = colors.background
  
  const options = {
    container: 'jsmind-container',
    editable: true,
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
    jm.value.show(mindData.value)
    isReady.value = true
  } catch (e) {
    console.error('jsMind 初始化失败', e)
    alert('jsMind 初始化失败：' + e.message)
  }
}

const loadMindmap = async () => {
  if (mindmapId.value) {
    try {
      const res = await mindmapApi.get(mindmapId.value)
      if (res.data.code === 200) {
        const data = res.data.data
        title.value = data.title
        theme.value = data.theme
        if (data.mindmapData) {
          try {
            let parsedData
            if (typeof data.mindmapData === 'string') {
              parsedData = JSON.parse(data.mindmapData)
            } else {
              parsedData = data.mindmapData
            }
            if (parsedData.meta && parsedData.data) {
              mindData.value = parsedData
            } else {
              console.warn('数据格式不正确，使用默认数据', parsedData)
              mindData.value = {
                meta: defaultMindData.meta,
                data: parsedData.data || parsedData || defaultMindData.data
              }
            }
          } catch (parseError) {
            console.error('解析思维导图数据失败', parseError)
            mindData.value = { ...defaultMindData }
          }
        }
      }
    } catch (e) {
      console.error('加载思维导图失败', e)
    }
  }
}

const addNode = () => {
  if (!jm.value) {
    alert('编辑器未初始化完成，请稍候')
    return
  }
  const selected = jm.value.get_selected_node()
  if (!selected) {
    alert('请先选择一个节点')
    return
  }
  const topic = prompt('请输入节点内容：')
  if (topic) {
    const nodeId = 'node_' + Date.now()
    jm.value.add_node(selected, nodeId, topic)
  }
}

const editNode = () => {
  if (!jm.value) {
    alert('编辑器未初始化完成，请稍候')
    return
  }
  const selected = jm.value.get_selected_node()
  if (!selected) {
    alert('请先选择一个节点')
    return
  }
  const topic = prompt('请输入新的节点内容：', selected.topic)
  if (topic) {
    jm.value.update_node(selected.id, topic)
  }
}

const removeNode = () => {
  if (!jm.value) {
    alert('编辑器未初始化完成，请稍候')
    return
  }
  const selected = jm.value.get_selected_node()
  if (!selected) {
    alert('请先选择一个节点')
    return
  }
  if (selected.id === 'root') {
    alert('根节点不能删除')
    return
  }
  if (confirm('确定删除此节点及其子节点吗？')) {
    jm.value.remove_node(selected.id)
  }
}

const save = async () => {
  if (!jm.value) {
    alert('编辑器未初始化完成，请稍候')
    return
  }
  if (!user.id) {
    alert('用户未登录，请重新登录')
    router.push('/login')
    return
  }
  try {
    const data = jm.value.get_data()
    const mindMapData = {
      meta: mindData.value.meta || defaultMindData.meta,
      data: data
    }
    console.log('保存数据：', mindMapData)
    const params = {
      userId: user.id,
      title: title.value || '未命名思维导图',
      mindmapData: JSON.stringify(mindMapData),
      theme: theme.value
    }
    if (mindmapId.value) {
      params.id = parseInt(mindmapId.value)
      await mindmapApi.update(params)
      alert('保存成功')
    } else {
      const res = await mindmapApi.save(params)
      mindmapId.value = res.data.data.id
      alert('保存成功')
    }
  } catch (e) {
    console.error('保存失败', e)
    alert('保存失败：' + e.message)
  }
}

const exportImage = async () => {
  if (!jm.value) {
    alert('编辑器未初始化完成，请稍候')
    return
  }
  const container = document.getElementById('jsmind-container')
  try {
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2
    })
    const link = document.createElement('a')
    link.download = title.value + '.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (e) {
    alert('导出失败：' + e.message)
  }
}

const back = () => {
  router.push('/list')
}

onMounted(async () => {
  if (!user.id) {
    router.push('/login')
    return
  }
  await loadMindmap()
  await initJsmind()
})

onUnmounted(() => {
  if (jm.value) {
    jm.value.destroy()
    jm.value = null
  }
})
</script>

<style scoped>
.editor-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.toolbar {
  background: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}
.left {
  display: flex;
  align-items: center;
  gap: 15px;
}
.right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.title-input {
  width: 300px;
  font-size: 16px;
  font-weight: bold;
}
.theme-select {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}
.mindmap-area {
  flex: 1;
  overflow: auto;
}
</style>
