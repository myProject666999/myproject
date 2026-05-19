<template>
  <div class="list-container">
    <div class="header">
      <h1>我的思维导图</h1>
      <div class="user-info">
        <span>{{ user.nickname || user.username }}</span>
        <button class="btn btn-primary" @click="createNew">新建导图</button>
        <button class="btn btn-warning" @click="logout">退出</button>
      </div>
    </div>
    <div class="content">
      <div class="grid">
        <div v-for="item in list" :key="item.id" class="mindmap-card card">
          <div class="card-header">
            <h3>{{ item.title }}</h3>
          </div>
          <p class="desc">{{ item.description || '暂无描述' }}</p>
          <div class="card-footer">
            <span class="time">{{ formatTime(item.updatedAt) }}</span>
            <div class="actions">
              <button class="btn btn-primary" @click="edit(item.id)">编辑</button>
              <button class="btn btn-success" @click="share(item.id)">分享</button>
              <button class="btn btn-danger" @click="remove(item.id)">删除</button>
            </div>
          </div>
        </div>
        <div v-if="list.length === 0" class="empty">
          暂无思维导图，点击右上角新建
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { mindmapApi, shareApi } from '../api'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const list = ref([])

const loadList = async () => {
  const res = await mindmapApi.list(user.value.id)
  if (res.data.code === 200) {
    list.value = res.data.data
  }
}

const createNew = () => {
  router.push('/editor')
}

const edit = (id) => {
  router.push(`/editor/${id}`)
}

const share = async (id) => {
  const res = await shareApi.create(id)
  if (res.data.code === 200) {
    const url = `${window.location.origin}/#/share/${res.data.data.shareCode}`
    const fullUrl = window.location.origin + '/share/' + res.data.data.shareCode
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert('分享链接已复制到剪贴板：\n' + fullUrl)
    }).catch(() => {
      alert('分享链接：\n' + fullUrl)
    })
  }
}

const remove = async (id) => {
  if (confirm('确定删除此思维导图吗？')) {
    await mindmapApi.delete(id)
    loadList()
  }
}

const logout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}

const formatTime = (time) => {
  return new Date(time).toLocaleString()
}

onMounted(() => {
  if (!user.value.id) {
    router.push('/login')
    return
  }
  loadList()
})
</script>

<style scoped>
.list-container {
  min-height: 100vh;
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
.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}
.content {
  padding: 40px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.mindmap-card {
  display: flex;
  flex-direction: column;
  transition: transform 0.3s, box-shadow 0.3s;
}
.mindmap-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
.card-header h3 {
  margin: 0 0 10px 0;
  color: #333;
}
.desc {
  color: #666;
  flex: 1;
  margin-bottom: 15px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
}
.time {
  color: #999;
  font-size: 12px;
}
.actions {
  display: flex;
  gap: 8px;
}
.actions .btn {
  padding: 6px 12px;
  font-size: 12px;
}
.empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px;
  color: #999;
}
</style>
