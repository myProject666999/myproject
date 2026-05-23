<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">🖥️ 节点管理</h1>
      <button class="btn btn-primary" @click="showCreateModal = true">+ 添加节点</button>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>IP</th>
            <th>分组</th>
            <th>Token</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in nodes" :key="n.id">
            <td>{{ n.id }}</td>
            <td><strong>{{ n.name }}</strong></td>
            <td style="font-family: monospace">{{ n.ip }}</td>
            <td>{{ n.group || '-' }}</td>
            <td>
              <code style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-size: 12px">{{ n.token }}</code>
            </td>
            <td><span :class="['status-badge', n.status === 'online' ? 'status-online' : 'status-offline']">{{ n.status === 'online' ? '在线' : '离线' }}</span></td>
            <td style="font-size: 12px">{{ n.created_at }}</td>
            <td>
              <button class="btn btn-sm" @click="editNode(n)">编辑</button>
              <button class="btn btn-sm" @click="regenToken(n)" style="margin-left: 4px">重置Token</button>
              <button class="btn btn-sm" @click="$router.push(`/nodes/${n.id}`)" style="margin-left: 4px">详情</button>
              <button class="btn btn-sm btn-danger" @click="deleteNode(n)" style="margin-left: 4px">删除</button>
            </td>
          </tr>
          <tr v-if="nodes.length === 0">
            <td colspan="8" class="empty-state">暂无节点，点击「添加节点」创建</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header">{{ editingNode ? '编辑节点' : '添加节点' }}</div>
        <div class="form-group">
          <label class="form-label">名称 *</label>
          <input v-model="form.name" class="form-input" placeholder="例如：Web-Server-01" />
        </div>
        <div class="form-group">
          <label class="form-label">IP 地址 *</label>
          <input v-model="form.ip" class="form-input" placeholder="例如：192.168.1.100" />
        </div>
        <div class="form-group">
          <label class="form-label">分组</label>
          <input v-model="form.group" class="form-input" placeholder="例如：生产环境（可选）" />
        </div>
        <div class="form-actions">
          <button class="btn" @click="showCreateModal = false; editingNode = null">取消</button>
          <button class="btn btn-primary" @click="saveNode">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'

const nodes = ref([])
const showCreateModal = ref(false)
const editingNode = ref(null)
const form = ref({ name: '', ip: '', group: '' })

async function loadNodes() {
  nodes.value = await api.getNodes()
}

function editNode(n) {
  editingNode.value = n
  form.value = { name: n.name, ip: n.ip, group: n.group || '' }
  showCreateModal.value = true
}

async function saveNode() {
  if (!form.value.name || !form.value.ip) {
    alert('名称和IP为必填项')
    return
  }
  try {
    if (editingNode.value) {
      await api.updateNode(editingNode.value.id, form.value)
    } else {
      await api.createNode(form.value)
    }
    showCreateModal.value = false
    editingNode.value = null
    form.value = { name: '', ip: '', group: '' }
    loadNodes()
  } catch (e) {
    alert('保存失败: ' + (e.response?.data?.error || e.message))
  }
}

async function regenToken(n) {
  if (!confirm(`确定要重置节点「${n.name}」的Token吗？Agent需要更新配置。`)) return
  try {
    const res = await api.regenerateToken(n.id)
    alert(`新Token: ${res.token}`)
    loadNodes()
  } catch (e) {
    alert('操作失败')
  }
}

async function deleteNode(n) {
  if (!confirm(`确定要删除节点「${n.name}」吗？此操作不可恢复。`)) return
  try {
    await api.deleteNode(n.id)
    loadNodes()
  } catch (e) {
    alert('删除失败')
  }
}

onMounted(loadNodes)
</script>
