<template>
  <div class="view">
    <header class="view-header">
      <h2>📂 文件管理</h2>
      <div class="actions">
        <button class="btn" @click="showMkdir = true">📁 新建目录</button>
        <label class="btn btn-primary">
          ⬆ 上传文件
          <input type="file" multiple hidden @change="onUploadClick" />
        </label>
        <button class="btn" @click="loadList">🔄 刷新</button>
      </div>
    </header>

    <nav class="breadcrumb">
      <span class="crumb" @click="goTo('')">🏠 根目录</span>
      <template v-for="(part, idx) in breadcrumbs" :key="idx">
        <span class="sep">/</span>
        <span class="crumb" @click="goTo(breadcrumbs.slice(0, idx + 1).join('/'))">
          {{ part }}
        </span>
      </template>
    </nav>

    <div v-if="uploading" class="progress-bar">
      <div class="progress-fill" :style="{ width: (progress * 100).toFixed(1) + '%' }"></div>
      <span>上传中 {{ (progress * 100).toFixed(1) }}%</span>
    </div>

    <table class="file-table">
      <thead>
        <tr>
          <th>名称</th>
          <th class="col-size">大小</th>
          <th class="col-time">修改时间</th>
          <th class="col-actions">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="currentPath !== ''">
          <td class="clickable" @click="goUp">⬆ ..</td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr v-for="item in items" :key="item.path">
          <td class="clickable" @click="handleItemClick(item)">
            <span class="icon">{{ item.is_dir ? '📁' : '📄' }}</span>
            {{ item.name }}
          </td>
          <td class="col-size">{{ item.is_dir ? '-' : formatSize(item.size) }}</td>
          <td class="col-time">{{ formatTime(item.mod_time) }}</td>
          <td class="col-actions">
            <button class="btn-sm" @click.stop="onRename(item)">重命名</button>
            <button v-if="!item.is_dir" class="btn-sm" @click.stop="onDownload(item)">下载</button>
            <button class="btn-sm btn-share" @click.stop="onShare(item)">分享</button>
            <button class="btn-sm btn-danger" @click.stop="onDelete(item)">删除</button>
          </td>
        </tr>
        <tr v-if="items.length === 0 && currentPath === ''">
          <td colspan="4" class="empty">目录为空</td>
        </tr>
      </tbody>
    </table>

    <Modal v-if="showMkdir" title="新建目录" @close="showMkdir = false" @confirm="doMkdir">
      <input v-model="newDirName" placeholder="目录名" class="input" />
    </Modal>

    <Modal v-if="showRename" title="重命名" @close="showRename = false" @confirm="doRename">
      <input v-model="renameName" class="input" />
    </Modal>

    <Modal v-if="showShare" title="创建分享链接" @close="showShare = false" @confirm="doShare">
      <div class="form-row">
        <label>过期秒数（0 = 永不过期）</label>
        <input v-model.number="shareForm.expire_sec" type="number" min="0" class="input" />
      </div>
      <div class="form-row">
        <label>最大访问次数（0 = 无限制）</label>
        <input v-model.number="shareForm.max_access" type="number" min="0" class="input" />
      </div>
      <div v-if="shareResult" class="share-result">
        <p>✅ 分享已创建！</p>
        <p>令牌：<code>{{ shareResult.token }}</code></p>
        <p>
          访问：<a :href="shareUrl" target="_blank">{{ shareUrl }}</a>
        </p>
        <button class="btn-sm" @click="copyText(shareUrl)">复制链接</button>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { filesApi, sharesApi } from '@/api'
import Modal from '@/components/Modal.vue'

const currentPath = ref('')
const items = ref([])
const showMkdir = ref(false)
const newDirName = ref('')
const showRename = ref(false)
const renameTarget = ref(null)
const renameName = ref('')
const showShare = ref(false)
const shareTarget = ref(null)
const shareForm = ref({ expire_sec: 0, max_access: 0 })
const shareResult = ref(null)
const uploading = ref(false)
const progress = ref(0)

const breadcrumbs = computed(() =>
  currentPath.value ? currentPath.value.split('/').filter(Boolean) : []
)

function loadList() {
  filesApi.list(currentPath.value).then((res) => {
    items.value = res.data.items || []
  })
}

function goTo(p) {
  currentPath.value = p
  loadList()
}

function goUp() {
  const parts = currentPath.value.split('/').filter(Boolean)
  parts.pop()
  currentPath.value = parts.join('/')
  loadList()
}

function handleItemClick(item) {
  if (item.is_dir) {
    currentPath.value = item.path
    loadList()
  } else {
    onDownload(item)
  }
}

function onDownload(item) {
  const a = document.createElement('a')
  a.href = filesApi.downloadUrl(item.path)
  a.download = item.name
  a.click()
}

function onDelete(item) {
  if (!confirm(`确定删除 "${item.name}" ？`)) return
  filesApi.remove(item.path).then(() => loadList())
}

function onRename(item) {
  renameTarget.value = item
  renameName.value = item.name
  showRename.value = true
}

function doRename() {
  if (!renameName.value) return
  filesApi.rename(renameTarget.value.path, renameName.value).then(() => {
    showRename.value = false
    loadList()
  })
}

function onShare(item) {
  shareTarget.value = item
  shareForm.value = { expire_sec: 0, max_access: 0 }
  shareResult.value = null
  showShare.value = true
}

function doShare() {
  sharesApi.create({
    path: shareTarget.value.path,
    ...shareForm.value
  }).then((res) => {
    shareResult.value = res.data
  })
}

const shareUrl = computed(() =>
  shareResult.value ? `${location.origin}/#/share/${shareResult.value.token}` : ''
)

function copyText(text) {
  navigator.clipboard?.writeText(text).then(() => alert('已复制'))
}

function doMkdir() {
  if (!newDirName.value) return
  filesApi.mkdir(currentPath.value, newDirName.value).then(() => {
    showMkdir.value = false
    newDirName.value = ''
    loadList()
  })
}

function onUploadClick(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return
  uploading.value = true
  progress.value = 0
  uploadAll(files)
  e.target.value = ''
}

async function uploadAll(files) {
  for (const f of files) {
    await filesApi.upload(currentPath.value, f, (p) => {
      progress.value = p
    }).catch((err) => alert(`上传 ${f.name} 失败：${err.message}`))
  }
  uploading.value = false
  progress.value = 0
  loadList()
}

function formatSize(s) {
  if (s < 1024) return s + ' B'
  if (s < 1024 ** 2) return (s / 1024).toFixed(1) + ' KB'
  if (s < 1024 ** 3) return (s / 1024 ** 2).toFixed(1) + ' MB'
  return (s / 1024 ** 3).toFixed(2) + ' GB'
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

onMounted(loadList)
</script>

<style scoped>
.view { padding: 8px 0; }
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.view-header h2 { font-size: 20px; }
.actions { display: flex; gap: 8px; }
.btn {
  padding: 8px 14px;
  background: #ecf0f1;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 14px;
  color: #2c3e50;
}
.btn:hover { background: #dfe6e9; }
.btn-primary { background: #3498db; color: #fff; border-color: #3498db; }
.btn-primary:hover { background: #2980b9; }
.breadcrumb {
  margin-bottom: 14px;
  font-size: 14px;
  color: #7f8c8d;
}
.crumb { cursor: pointer; color: #3498db; }
.crumb:hover { text-decoration: underline; }
.sep { margin: 0 6px; }
.progress-bar {
  position: relative;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  height: 26px;
  margin-bottom: 12px;
}
.progress-fill {
  background: #2ecc71;
  height: 100%;
  transition: width .2s;
}
.progress-bar span {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #2c3e50;
}
.file-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
.file-table th, .file-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
  font-size: 14px;
}
.file-table th { background: #f8f9fb; font-weight: 600; color: #7f8c8d; }
.file-table tr:last-child td { border-bottom: none; }
.clickable { cursor: pointer; }
.clickable:hover { background: #f5f9fc; }
.icon { margin-right: 6px; }
.col-size, .col-time { color: #7f8c8d; }
.col-actions { display: flex; gap: 4px; flex-wrap: wrap; }
.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
  background: #ecf0f1;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  color: #2c3e50;
}
.btn-sm:hover { background: #dfe6e9; }
.btn-share { background: #fff3cd; border-color: #ffeaa7; }
.btn-danger { background: #ffe0e0; border-color: #ffb3b3; color: #c0392b; }
.empty { text-align: center; color: #95a5a6; padding: 40px !important; }
.form-row { margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 13px; color: #7f8c8d; }
.input {
  padding: 8px 12px;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
}
.share-result {
  margin-top: 10px;
  padding: 10px;
  background: #eafaf1;
  border: 1px solid #a0d4b0;
  border-radius: 6px;
  font-size: 13px;
}
.share-result p { margin: 4px 0; }
code {
  background: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}
</style>
