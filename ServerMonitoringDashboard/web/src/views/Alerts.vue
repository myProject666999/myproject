<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">🔔 告警中心</h1>
      <button class="btn btn-primary" @click="showCreateRuleModal = true">+ 新建规则</button>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px">
      <div class="card">
        <h3 style="margin-bottom: 16px; font-size: 16px">告警规则</h3>
        <table>
          <thead>
            <tr>
              <th>节点</th>
              <th>指标</th>
              <th>条件</th>
              <th>阈值</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rules" :key="r.id">
              <td>{{ r.node_name || getNodeName(r.node_id) }}</td>
              <td>{{ metricLabel(r.metric) }}</td>
              <td>{{ r.condition }}</td>
              <td>{{ r.threshold }}%</td>
              <td>
                <button class="btn btn-sm" :class="r.enabled ? 'btn-primary' : ''" @click="toggleRule(r)">
                  {{ r.enabled ? '启用' : '禁用' }}
                </button>
              </td>
              <td>
                <button class="btn btn-sm btn-danger" @click="deleteRule(r)">删除</button>
              </td>
            </tr>
            <tr v-if="rules.length === 0">
              <td colspan="6" class="empty-state">暂无告警规则</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
          <h3 style="font-size: 16px">告警记录</h3>
          <div>
            <button class="btn btn-sm" @click="loadRecords">刷新</button>
            <button class="btn btn-sm btn-danger" @click="clearRecords" style="margin-left: 8px">清空</button>
          </div>
        </div>
        <div style="max-height: 480px; overflow-y: auto">
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>节点</th>
                <th>级别</th>
                <th>指标</th>
                <th>值/阈值</th>
                <th>消息</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in records" :key="r.id">
                <td style="font-size: 12px">{{ formatTime(r.created_at) }}</td>
                <td>{{ r.node_name || getNodeName(r.node_id) }}</td>
                <td><span :class="['level-badge', r.level === 'critical' ? 'level-critical' : 'level-warning']">{{ r.level === 'critical' ? '严重' : '警告' }}</span></td>
                <td>{{ metricLabel(r.metric) }}</td>
                <td style="font-size: 12px">{{ r.value.toFixed(1) }}% / {{ r.threshold }}%</td>
                <td style="font-size: 12px; max-width: 200px">{{ r.message }}</td>
              </tr>
              <tr v-if="records.length === 0">
                <td colspan="6" class="empty-state">暂无告警记录</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showCreateRuleModal" class="modal-overlay" @click.self="showCreateRuleModal = false">
      <div class="modal">
        <div class="modal-header">新建告警规则</div>
        <div class="form-group">
          <label class="form-label">节点 *</label>
          <select v-model="ruleForm.node_id" class="form-input">
            <option :value="0">请选择节点</option>
            <option v-for="n in nodes" :key="n.id" :value="n.id">{{ n.name }} ({{ n.ip }})</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">指标 *</label>
          <select v-model="ruleForm.metric" class="form-input">
            <option value="cpu">CPU 使用率</option>
            <option value="memory">内存使用率</option>
            <option value="disk">磁盘使用率</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">条件 *</label>
          <select v-model="ruleForm.condition" class="form-input">
            <option value=">">大于 (>)</option>
            <option value=">=">大于等于 (>=)</option>
            <option value="<">小于 (<)</option>
            <option value="<=">小于等于 (<=)</option>
            <option value="==">等于 (==)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">阈值 (%) *</label>
          <input v-model.number="ruleForm.threshold" type="number" class="form-input" placeholder="例如：80" />
        </div>
        <div class="form-actions">
          <button class="btn" @click="showCreateRuleModal = false">取消</button>
          <button class="btn btn-primary" @click="saveRule">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'

const nodes = ref([])
const rules = ref([])
const records = ref([])
const showCreateRuleModal = ref(false)
const ruleForm = ref({ node_id: 0, metric: 'cpu', condition: '>', threshold: 80 })

async function loadAll() {
  try {
    const [n, r, rec] = await Promise.all([
      api.getNodes(),
      api.getAlertRules(),
      api.getAlertRecords({ limit: 50 })
    ])
    nodes.value = n || []
    rules.value = r || []
    records.value = rec || []
  } catch (e) {
    console.error(e)
  }
}

async function loadRecords() {
  records.value = await api.getAlertRecords({ limit: 50 })
}

function getNodeName(nodeId) {
  const n = nodes.value.find(n => n.id === nodeId)
  return n ? n.name : '未知'
}

function metricLabel(m) {
  const map = { cpu: 'CPU', memory: '内存', disk: '磁盘' }
  return map[m] || m
}

function formatTime(t) {
  if (!t) return '-'
  return new Date(t).toLocaleString('zh-CN')
}

async function saveRule() {
  if (!ruleForm.value.node_id || ruleForm.value.threshold == null) {
    alert('请填写完整')
    return
  }
  try {
    await api.createAlertRule(ruleForm.value)
    showCreateRuleModal.value = false
    ruleForm.value = { node_id: 0, metric: 'cpu', condition: '>', threshold: 80 }
    loadAll()
  } catch (e) {
    alert('保存失败: ' + (e.response?.data?.error || e.message))
  }
}

async function toggleRule(r) {
  await api.toggleAlertRule(r.id)
  loadAll()
}

async function deleteRule(r) {
  if (!confirm(`确定删除此告警规则？`)) return
  await api.deleteAlertRule(r.id)
  loadAll()
}

async function clearRecords() {
  if (!confirm('确定清空所有告警记录？')) return
  await api.clearAlertRecords()
  records.value = []
}

onMounted(loadAll)
</script>
