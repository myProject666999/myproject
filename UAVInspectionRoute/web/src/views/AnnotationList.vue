<template>
  <div class="annotation-container">
    <div class="annotation-left">
      <div class="image-toolbar">
        <el-select v-model="currentMediaId" placeholder="选择影像" style="width: 240px" @change="loadImageAndAnnotations">
          <el-option v-for="m in mediaList" :key="m.id" :label="m.fileName" :value="m.id" />
        </el-select>
        <el-select v-model="filterTaskId" placeholder="按任务筛选" clearable style="width: 180px; margin-left: 8px" @change="loadMediaList">
          <el-option v-for="t in taskList" :key="t.id" :label="t.title" :value="t.id" />
        </el-select>
        <div style="flex: 1"></div>
        <el-button-group>
          <el-button size="small" :type="drawMode ? 'primary' : 'default'" @click="toggleDrawMode">
            <el-icon><EditPen /></el-icon>{{ drawMode ? '绘制中' : '绘制标注' }}
          </el-button>
          <el-button size="small" @click="clearDrawing" :disabled="!drawMode">清除当前</el-button>
        </el-button-group>
      </div>
      <div class="image-canvas-wrapper" ref="canvasWrapperRef">
        <img v-if="imageUrl" :src="imageUrl" ref="imageRef" class="source-image" @load="onImageLoad" />
        <canvas
          v-if="imageUrl"
          ref="canvasRef"
          class="annotation-canvas"
          @mousedown="onCanvasMouseDown"
          @mousemove="onCanvasMouseMove"
          @mouseup="onCanvasMouseUp"
        />
        <el-empty v-else description="请选择影像进行标注" style="margin-top: 100px" />
      </div>
    </div>

    <div class="annotation-right">
      <el-card shadow="never">
        <template #header><span>标注列表</span></template>
        <div v-for="ann in annotations" :key="ann.id" class="annotation-item" :class="{ active: activeAnnotationId === ann.id }" @click="locateAnnotation(ann)">
          <div class="ann-header">
            <span class="ann-title">{{ ann.title }}</span>
            <el-tag :type="severityTagMap[ann.severity] || 'info'" size="small">{{ severityLabelMap[ann.severity] || ann.severity }}</el-tag>
          </div>
          <div class="ann-meta">
            <el-tag size="small" type="warning">{{ categoryLabelMap[ann.category] || ann.category }}</el-tag>
          </div>
          <div class="ann-actions">
            <el-button type="primary" link size="small" @click.stop="openEditDialog(ann)">编辑</el-button>
            <el-button type="danger" link size="small" @click.stop="handleDelete(ann)">删除</el-button>
          </div>
        </div>
        <el-empty v-if="annotations.length === 0" description="暂无标注" :image-size="60" />
      </el-card>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑标注' : '新增标注'" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="标注标题" />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-select v-model="form.category" placeholder="选择类别" style="width: 100%">
            <el-option label="裂纹" value="crack" />
            <el-option label="锈蚀" value="rust" />
            <el-option label="变形" value="deformation" />
            <el-option label="缺失" value="missing" />
            <el-option label="异物" value="foreign_object" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="严重程度" prop="severity">
          <el-select v-model="form.severity" placeholder="选择严重程度" style="width: 100%">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="严重" value="critical" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAnnotationList, createAnnotation, updateAnnotation, deleteAnnotation } from '../api/annotation'
import { getMediaList } from '../api/media'
import { getTaskList } from '../api/task'

const severityTagMap = { low: 'info', medium: '', high: 'warning', critical: 'danger' }
const severityLabelMap = { low: '低', medium: '中', high: '高', critical: '严重' }
const categoryLabelMap = { crack: '裂纹', rust: '锈蚀', deformation: '变形', missing: '缺失', foreign_object: '异物', other: '其他' }

const canvasWrapperRef = ref(null)
const imageRef = ref(null)
const canvasRef = ref(null)

const mediaList = ref([])
const taskList = ref([])
const filterTaskId = ref('')
const currentMediaId = ref('')
const imageUrl = ref('')
const annotations = ref([])
const activeAnnotationId = ref(null)

const drawMode = ref(false)
const drawing = ref(false)
const drawStart = ref({ x: 0, y: 0 })
const currentRect = ref(null)

const dialogVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({ title: '', category: '', severity: 'medium', description: '' })
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  severity: [{ required: true, message: '请选择严重程度', trigger: 'change' }]
}

let imgWidth = 0
let imgHeight = 0

async function loadTaskList() {
  try {
    const res = await getTaskList({ pageSize: 100 })
    taskList.value = res.data.list || res.data || []
  } catch {}
}

async function loadMediaList() {
  try {
    const res = await getMediaList({ pageSize: 100, taskId: filterTaskId.value })
    mediaList.value = res.data.list || []
  } catch {}
}

async function loadImageAndAnnotations() {
  const media = mediaList.value.find(m => m.id === currentMediaId.value)
  if (!media) return
  imageUrl.value = media.url || media.thumbnailUrl
  await nextTick()
  loadAnnotations()
}

async function loadAnnotations() {
  if (!currentMediaId.value) return
  try {
    const res = await getAnnotationList({ mediaId: currentMediaId.value })
    annotations.value = res.data.list || res.data || []
    await nextTick()
    redrawCanvas()
  } catch {}
}

function onImageLoad() {
  const img = imageRef.value
  if (!img) return
  imgWidth = img.naturalWidth
  imgHeight = img.naturalHeight
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = img.clientWidth
  canvas.height = img.clientHeight
  redrawCanvas()
}

function redrawCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  annotations.value.forEach(ann => {
    if (!ann.rect) return
    const x = ann.rect.x * canvas.width
    const y = ann.rect.y * canvas.height
    const w = ann.rect.w * canvas.width
    const h = ann.rect.h * canvas.height
    const isActive = ann.id === activeAnnotationId.value
    ctx.strokeStyle = isActive ? '#f56c6c' : '#e6a23c'
    ctx.lineWidth = isActive ? 3 : 2
    ctx.strokeRect(x, y, w, h)
    ctx.fillStyle = isActive ? 'rgba(245,108,108,0.1)' : 'rgba(230,162,60,0.1)'
    ctx.fillRect(x, y, w, h)
    ctx.font = '12px sans-serif'
    ctx.fillStyle = isActive ? '#f56c6c' : '#e6a23c'
    ctx.fillText(ann.title, x, y - 4)
  })
  if (currentRect.value) {
    const { x, y, w, h } = currentRect.value
    ctx.strokeStyle = '#409eff'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 4])
    ctx.strokeRect(x, y, w, h)
    ctx.setLineDash([])
  }
}

function toggleDrawMode() {
  drawMode.value = !drawMode.value
  if (!drawMode.value) {
    currentRect.value = null
    redrawCanvas()
  }
}

function clearDrawing() {
  currentRect.value = null
  drawing.value = false
  redrawCanvas()
}

function onCanvasMouseDown(e) {
  if (!drawMode.value) return
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  drawing.value = true
  drawStart.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function onCanvasMouseMove(e) {
  if (!drawing.value) return
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  const cx = e.clientX - rect.left
  const cy = e.clientY - rect.top
  currentRect.value = {
    x: Math.min(drawStart.value.x, cx),
    y: Math.min(drawStart.value.y, cy),
    w: Math.abs(cx - drawStart.value.x),
    h: Math.abs(cy - drawStart.value.y)
  }
  redrawCanvas()
}

async function onCanvasMouseUp() {
  if (!drawing.value) return
  drawing.value = false
  if (!currentRect.value || currentRect.value.w < 5 || currentRect.value.h < 5) {
    currentRect.value = null
    redrawCanvas()
    return
  }
  const canvas = canvasRef.value
  const savedRect = {
    x: currentRect.value.x / canvas.width,
    y: currentRect.value.y / canvas.height,
    w: currentRect.value.w / canvas.width,
    h: currentRect.value.h / canvas.height
  }
  currentRect.value = null
  redrawCanvas()
  Object.assign(form, { title: '', category: '', severity: 'medium', description: '' })
  form.rect = savedRect
  form.mediaId = currentMediaId.value
  editingId.value = null
  dialogVisible.value = true
}

function openEditDialog(ann) {
  editingId.value = ann.id
  Object.assign(form, {
    title: ann.title,
    category: ann.category,
    severity: ann.severity,
    description: ann.description,
    rect: ann.rect,
    mediaId: ann.mediaId || currentMediaId.value
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (editingId.value) {
      await updateAnnotation(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createAnnotation({ ...form })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadAnnotations()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(ann) {
  await ElMessageBox.confirm(`确定删除标注「${ann.title}」？`, '提示', { type: 'warning' })
  await deleteAnnotation(ann.id)
  ElMessage.success('删除成功')
  loadAnnotations()
}

function locateAnnotation(ann) {
  activeAnnotationId.value = ann.id
  redrawCanvas()
}

onMounted(() => {
  loadTaskList()
  loadMediaList()
})
</script>

<style scoped>
.annotation-container {
  display: flex;
  height: calc(100vh - 120px);
  gap: 16px;
}

.annotation-left {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.image-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 4px;
}

.image-canvas-wrapper {
  position: relative;
  flex: 1;
  overflow: auto;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.source-image {
  display: block;
  max-width: 100%;
}

.annotation-canvas {
  position: absolute;
  top: 0;
  left: 0;
  cursor: crosshair;
}

.annotation-right {
  width: 320px;
  overflow-y: auto;
}

.annotation-item {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background 0.2s;
}

.annotation-item:hover,
.annotation-item.active {
  background: #ecf5ff;
}

.ann-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ann-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.ann-meta {
  margin-top: 4px;
}

.ann-actions {
  margin-top: 6px;
  text-align: right;
}
</style>
