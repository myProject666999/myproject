<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Power,
  FileText,
  ListChecks,
  ArrowLeft,
  GripVertical,
  Clock,
  Hash,
  Star,
  CheckCircle,
  Camera,
  AlignLeft,
  RefreshCw
} from 'lucide-vue-next'
import dayjs from 'dayjs'
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateItems,
  createItem,
  updateItem,
  deleteItem
} from '@/api/template'
import Empty from '@/components/Empty.vue'
import type { ChecklistTemplate, ChecklistItem } from '@/types'

type ViewMode = 'list' | 'items'

const loading = ref(false)
const templates = ref<ChecklistTemplate[]>([])
const total = ref(0)
const currentView = ref<ViewMode>('list')
const currentTemplate = ref<ChecklistTemplate | null>(null)
const templateItems = ref<ChecklistItem[]>([])
const itemLoading = ref(false)
const dragging = ref(false)

const filters = reactive({
  keyword: '',
  type: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 9
})

const typeOptions = [
  { label: '全部类型', value: '' },
  { label: '日常巡检', value: '日常巡检' },
  { label: '专项检查', value: '专项检查' },
  { label: '季度考核', value: '季度考核' },
  { label: '年度评估', value: '年度评估' }
]

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '已启用', value: '1' },
  { label: '已禁用', value: '0' }
]

const categoryOptions = [
  { label: '基础管理', value: '基础管理' },
  { label: '环境卫生', value: '环境卫生' },
  { label: '食品安全', value: '食品安全' },
  { label: '服务质量', value: '服务质量' },
  { label: '商品管理', value: '商品管理' },
  { label: '设备设施', value: '设备设施' },
  { label: '消防安全', value: '消防安全' }
]

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const formData = reactive({
  id: null as number | null,
  name: '',
  type: '日常巡检',
  description: '',
  category: '基础管理',
  version: '1.0',
  totalScore: 100,
  passScore: 60,
  status: 1
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
  category: [{ required: true, message: '请选择模板分类', trigger: 'change' }],
  version: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
  totalScore: [{ required: true, message: '请输入总分', trigger: 'blur' }],
  passScore: [{ required: true, message: '请输入及格分', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const itemDialogVisible = ref(false)
const itemDialogMode = ref<'create' | 'edit'>('create')
const itemFormRef = ref<FormInstance>()
const itemFormData = reactive({
  id: null as number | null,
  templateId: null as number | null,
  code: '',
  title: '',
  description: '',
  category: '基础管理',
  type: 'score' as 'text' | 'select' | 'multiple' | 'boolean' | 'score',
  scoreWeight: 10,
  sortOrder: 0,
  required: true,
  needPhoto: false,
  scoringStandard: ''
})

const itemFormRules: FormRules = {
  code: [{ required: true, message: '请输入检查项编码', trigger: 'blur' }],
  title: [{ required: true, message: '请输入检查项名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  scoreWeight: [{ required: true, message: '请输入分值', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

const typeConfig: Record<string, { label: string; type: string }> = {
  '日常巡检': { label: '日常巡检', type: 'primary' },
  '专项检查': { label: '专项检查', type: 'success' },
  '季度考核': { label: '季度考核', type: 'warning' },
  '年度评估': { label: '年度评估', type: 'info' }
}

const groupedItems = computed(() => {
  const groups: Record<string, ChecklistItem[]> = {}
  templateItems.value.forEach(item => {
    const category = item.category || '未分类'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(item)
  })
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => a.sortOrder - b.sortOrder)
  })
  return groups
})

const fetchTemplates = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword || undefined,
      type: filters.type || undefined,
      status: filters.status || undefined
    }
    const response = await getTemplates(params)
    if (response.code === 0) {
      templates.value = response.data.list.map((t: any) => ({
        ...t,
        totalScore: t.totalScore || 100,
        passScore: t.passScore || 60,
        type: t.type || t.category || '日常巡检'
      }))
      total.value = response.data.total
    }
  } catch (error) {
    ElMessage.error('获取模板列表失败')
  } finally {
    loading.value = false
  }
}

const fetchTemplateItems = async (templateId: number) => {
  itemLoading.value = true
  try {
    const response = await getTemplateItems(templateId)
    if (response.code === 0) {
      templateItems.value = response.data
    }
  } catch (error) {
    ElMessage.error('获取检查项列表失败')
  } finally {
    itemLoading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchTemplates()
}

const handleReset = () => {
  filters.keyword = ''
  filters.type = ''
  filters.status = ''
  pagination.page = 1
  fetchTemplates()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchTemplates()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchTemplates()
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  formData.id = null
  formData.name = ''
  formData.type = '日常巡检'
  formData.description = ''
  formData.category = '基础管理'
  formData.version = '1.0'
  formData.totalScore = 100
  formData.passScore = 60
  formData.status = 1
  dialogVisible.value = true
}

const openEditDialog = (row: ChecklistTemplate) => {
  dialogMode.value = 'edit'
  formData.id = row.id
  formData.name = row.name
  formData.type = row.type || row.category || '日常巡检'
  formData.description = row.description || ''
  formData.category = row.category
  formData.version = row.version
  formData.totalScore = row.totalScore
  formData.passScore = row.passScore
  formData.status = row.status
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const submitData = {
          name: formData.name,
          type: formData.type,
          description: formData.description,
          category: formData.category,
          version: formData.version,
          totalScore: formData.totalScore,
          passScore: formData.passScore,
          status: formData.status
        }

        let response
        if (dialogMode.value === 'create') {
          response = await createTemplate(submitData)
        } else {
          response = await updateTemplate(formData.id!, submitData)
        }

        if (response.code === 0) {
          ElMessage.success(dialogMode.value === 'create' ? '新增模板成功' : '编辑模板成功')
          dialogVisible.value = false
          fetchTemplates()
        }
      } catch (error) {
        ElMessage.error(dialogMode.value === 'create' ? '新增模板失败' : '编辑模板失败')
      }
    }
  })
}

const handleDelete = async (row: ChecklistTemplate) => {
  try {
    await ElMessageBox.confirm(`确定要删除模板「${row.name}」吗？删除后数据无法恢复。`, '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    const response = await deleteTemplate(row.id)
    if (response.code === 0) {
      ElMessage.success('删除模板成功')
      fetchTemplates()
    }
  } catch {
    // 用户取消
  }
}

const handleToggleStatus = async (row: ChecklistTemplate) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定要${action}模板「${row.name}」吗？`, `${action}确认`, {
      confirmButtonText: `确定${action}`,
      cancelButtonText: '取消',
      type: 'warning'
    })
    const response = await updateTemplate(row.id, { status: newStatus })
    if (response.code === 0) {
      ElMessage.success(`${action}模板成功`)
      fetchTemplates()
    }
  } catch {
    // 用户取消
  }
}

const enterItemManagement = async (template: ChecklistTemplate) => {
  currentTemplate.value = template
  currentView.value = 'items'
  await fetchTemplateItems(template.id)
}

const backToList = () => {
  currentView.value = 'list'
  currentTemplate.value = null
  templateItems.value = []
}

const openCreateItemDialog = () => {
  if (!currentTemplate.value) return
  itemDialogMode.value = 'create'
  itemFormData.id = null
  itemFormData.templateId = currentTemplate.value.id
  itemFormData.code = `ITEM${String(templateItems.value.length + 1).padStart(3, '0')}`
  itemFormData.title = ''
  itemFormData.description = ''
  itemFormData.category = '基础管理'
  itemFormData.type = 'score'
  itemFormData.scoreWeight = 10
  itemFormData.sortOrder = templateItems.value.length + 1
  itemFormData.required = true
  itemFormData.needPhoto = false
  itemFormData.scoringStandard = ''
  itemDialogVisible.value = true
}

const openEditItemDialog = (item: ChecklistItem) => {
  itemDialogMode.value = 'edit'
  itemFormData.id = item.id
  itemFormData.templateId = item.templateId
  itemFormData.code = item.code || ''
  itemFormData.title = item.title
  itemFormData.description = item.description || ''
  itemFormData.category = item.category || '基础管理'
  itemFormData.type = item.type
  itemFormData.scoreWeight = item.scoreWeight
  itemFormData.sortOrder = item.sortOrder
  itemFormData.required = item.required
  itemFormData.needPhoto = item.needPhoto || false
  itemFormData.scoringStandard = item.scoringStandard || ''
  itemDialogVisible.value = true
}

const handleItemSubmit = async () => {
  if (!itemFormRef.value) return
  await itemFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const submitData = {
          templateId: itemFormData.templateId,
          code: itemFormData.code,
          title: itemFormData.title,
          description: itemFormData.description,
          category: itemFormData.category,
          type: itemFormData.type,
          scoreWeight: itemFormData.scoreWeight,
          sortOrder: itemFormData.sortOrder,
          required: itemFormData.required,
          needPhoto: itemFormData.needPhoto,
          scoringStandard: itemFormData.scoringStandard
        }

        let response
        if (itemDialogMode.value === 'create') {
          response = await createItem(submitData)
        } else {
          response = await updateItem(itemFormData.id!, submitData)
        }

        if (response.code === 0) {
          ElMessage.success(itemDialogMode.value === 'create' ? '新增检查项成功' : '编辑检查项成功')
          itemDialogVisible.value = false
          if (currentTemplate.value) {
            fetchTemplateItems(currentTemplate.value.id)
          }
        }
      } catch (error) {
        ElMessage.error(itemDialogMode.value === 'create' ? '新增检查项失败' : '编辑检查项失败')
      }
    }
  })
}

const handleDeleteItem = async (item: ChecklistItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除检查项「${item.title}」吗？`, '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    const response = await deleteItem(item.id)
    if (response.code === 0) {
      ElMessage.success('删除检查项成功')
      if (currentTemplate.value) {
        fetchTemplateItems(currentTemplate.value.id)
      }
    }
  } catch {
    // 用户取消
  }
}

const handleDragStart = (item: ChecklistItem) => {
  dragging.value = true
}

const handleDragEnd = () => {
  dragging.value = false
}

const handleDrop = async (targetItem: ChecklistItem, draggedItem: ChecklistItem) => {
  if (draggedItem.id === targetItem.id) return
  
  const items = [...templateItems.value]
  const draggedIndex = items.findIndex(i => i.id === draggedItem.id)
  const targetIndex = items.findIndex(i => i.id === targetItem.id)
  
  if (draggedIndex !== -1 && targetIndex !== -1) {
    const temp = items[draggedIndex].sortOrder
    items[draggedIndex].sortOrder = items[targetIndex].sortOrder
    items[targetIndex].sortOrder = temp
    
    try {
      await Promise.all([
        updateItem(items[draggedIndex].id, { sortOrder: items[draggedIndex].sortOrder }),
        updateItem(items[targetIndex].id, { sortOrder: items[targetIndex].sortOrder })
      ])
      ElMessage.success('排序更新成功')
      if (currentTemplate.value) {
        fetchTemplateItems(currentTemplate.value.id)
      }
    } catch (error) {
      ElMessage.error('排序更新失败')
    }
  }
  
  dragging.value = false
}

const getStatusTag = (status: number) => {
  return status === 1
    ? { label: '已启用', type: 'success' }
    : { label: '已禁用', type: 'info' }
}

const getItemTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    text: '文本',
    select: '单选',
    multiple: '多选',
    boolean: '是非',
    score: '评分'
  }
  return labels[type] || type
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const getTotalWeight = computed(() => {
  return templateItems.value.reduce((sum, item) => sum + item.scoreWeight, 0)
})

const handleTemplateAction = (cmd: string, template: ChecklistTemplate) => {
  switch (cmd) {
    case 'edit':
      openEditDialog(template)
      break
    case 'items':
      enterItemManagement(template)
      break
    case 'enable':
    case 'disable':
      handleToggleStatus(template)
      break
    case 'delete':
      handleDelete(template)
      break
  }
}

onMounted(() => {
  fetchTemplates()
})
</script>

<template>
  <div class="template-management-container">
    <!-- 模板列表视图 -->
    <template v-if="currentView === 'list'">
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">
            <FileText class="title-icon" />
            检查表模板管理
          </h2>
          <p class="page-desc">管理巡检模板，配置检查项和评分标准</p>
        </div>
        <el-button type="primary" size="large" class="create-btn" @click="openCreateDialog">
          <Plus :size="18" />
          新增模板
        </el-button>
      </div>

      <el-card class="filter-card" shadow="never">
        <el-form :inline="true" class="filter-form">
          <el-form-item label="类型">
            <el-select v-model="filters.type" placeholder="全部类型" style="width: 140px">
              <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filters.status" placeholder="全部状态" style="width: 140px">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <div class="search-box">
              <el-input
                v-model="filters.keyword"
                placeholder="搜索模板名称/描述"
                clearable
                style="width: 240px"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <Search :size="16" />
                </template>
              </el-input>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <Filter :size="16" />
              筛选
            </el-button>
            <el-button @click="handleReset">
              <RefreshCw :size="16" />
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <div class="template-grid" v-loading="loading">
        <template v-if="templates.length > 0">
          <div v-for="template in templates" :key="template.id" class="template-card">
            <div class="card-header">
              <div class="template-title">{{ template.name }}</div>
              <div class="template-actions">
                <el-dropdown trigger="click" @command="(cmd: string) => handleTemplateAction(cmd, template)">
                  <el-button size="small" text>
                    <ListChecks :size="16" />
                    操作
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">
                        <Edit :size="14" /> 编辑
                      </el-dropdown-item>
                      <el-dropdown-item command="items">
                        <Eye :size="14" /> 查看检查项
                      </el-dropdown-item>
                      <el-dropdown-item :command="template.status === 1 ? 'disable' : 'enable'">
                        <Power :size="14" />
                        {{ template.status === 1 ? '禁用' : '启用' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided>
                        <Trash2 :size="14" class="text-danger" /> 删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div class="card-body">
              <div class="tags-row">
                <el-tag :type="typeConfig[template.type || template.category]?.type as any" effect="light" round size="small">
                  {{ typeConfig[template.type || template.category]?.label || template.category }}
                </el-tag>
                <el-tag :type="getStatusTag(template.status).type as any" effect="light" round size="small">
                  {{ getStatusTag(template.status).label }}
                </el-tag>
              </div>
              <p class="template-desc" v-if="template.description">{{ template.description }}</p>
              <p class="template-desc text-muted" v-else>暂无描述</p>
              
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-icon version-icon">
                    <Hash :size="16" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ template.version }}</div>
                    <div class="stat-label">版本</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon score-icon">
                    <Star :size="16" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ template.totalScore }}</div>
                    <div class="stat-label">总分</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon pass-icon">
                    <CheckCircle :size="16" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ template.passScore }}</div>
                    <div class="stat-label">及格分</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon items-icon">
                    <ListChecks :size="16" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ template.items?.length || 0 }}</div>
                    <div class="stat-label">检查项</div>
                  </div>
                </div>
              </div>

              <div class="card-footer-info">
                <div class="info-row">
                  <Clock :size="14" class="info-icon" />
                  <span>创建时间：{{ formatDate(template.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <el-button type="primary" size="small" @click="enterItemManagement(template)">
                <ListChecks :size="14" />
                管理检查项
              </el-button>
              <el-button size="small" @click="openEditDialog(template)">
                <Edit :size="14" />
                编辑
              </el-button>
            </div>
          </div>
        </template>
        <Empty v-else description="暂无模板数据" />
      </div>

      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[9, 18, 36]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </template>

    <!-- 检查项管理视图 -->
    <template v-else>
      <div class="items-header">
        <div class="back-btn" @click="backToList">
          <ArrowLeft :size="20" />
          <span>返回模板列表</span>
        </div>
        <div class="template-info">
          <h2 class="template-name">
            <FileText class="title-icon" />
            {{ currentTemplate?.name }}
          </h2>
          <div class="template-meta">
            <el-tag :type="typeConfig[currentTemplate?.type || '']?.type as any" effect="light" round size="small">
              {{ typeConfig[currentTemplate?.type || '']?.label || currentTemplate?.category }}
            </el-tag>
            <span class="meta-item">版本：{{ currentTemplate?.version }}</span>
            <span class="meta-item">总分：{{ currentTemplate?.totalScore }}</span>
            <span class="meta-item">及格分：{{ currentTemplate?.passScore }}</span>
            <span class="meta-item">已配置分值：<span class="text-primary font-medium">{{ getTotalWeight }}</span></span>
          </div>
        </div>
        <el-button type="primary" size="large" class="create-btn" @click="openCreateItemDialog">
          <Plus :size="18" />
          新增检查项
        </el-button>
      </div>

      <div class="items-container" v-loading="itemLoading">
        <template v-if="Object.keys(groupedItems).length > 0">
          <div v-for="(items, category) in groupedItems" :key="category" class="category-section">
            <div class="category-header">
              <h3 class="category-title">{{ category }}</h3>
              <span class="category-count">{{ items.length }} 项</span>
            </div>
            <div class="items-list">
              <div
                v-for="item in items"
                :key="item.id"
                class="item-card"
                draggable="true"
                @dragstart="handleDragStart(item)"
                @dragend="handleDragEnd"
                @dragover.prevent
                @drop="handleDrop(item, $event.dataTransfer?.getData('text/plain') as any)"
              >
                <div class="item-drag-handle">
                  <GripVertical :size="18" class="drag-icon" />
                </div>
                <div class="item-main">
                  <div class="item-header">
                    <div class="item-code">{{ item.code }}</div>
                    <div class="item-title">{{ item.title }}</div>
                    <div class="item-tags">
                      <el-tag size="small" type="primary" effect="light" v-if="item.required">必查</el-tag>
                      <el-tag size="small" type="warning" effect="light" v-if="item.needPhoto">
                        <Camera :size="12" class="tag-icon" />
                        需拍照
                      </el-tag>
                      <el-tag size="small" effect="light">{{ getItemTypeLabel(item.type) }}</el-tag>
                    </div>
                  </div>
                  <div class="item-desc" v-if="item.description">
                    <AlignLeft :size="14" class="desc-icon" />
                    <span>{{ item.description }}</span>
                  </div>
                  <div class="item-standard" v-if="item.scoringStandard">
                    <strong>评分标准：</strong>{{ item.scoringStandard }}
                  </div>
                  <div class="item-footer">
                    <div class="item-stats">
                      <span class="stat-badge score-badge">
                        <Star :size="12" />
                        {{ item.scoreWeight }} 分
                      </span>
                      <span class="stat-badge sort-badge">
                        排序：{{ item.sortOrder }}
                      </span>
                    </div>
                    <div class="item-actions">
                      <el-button type="primary" link size="small" @click="openEditItemDialog(item)">
                        <Edit :size="14" />
                        编辑
                      </el-button>
                      <el-button type="danger" link size="small" @click="handleDeleteItem(item)">
                        <Trash2 :size="14" />
                        删除
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <Empty v-else description="暂无检查项，点击右上角按钮新增" />
      </div>
    </template>

    <!-- 模板新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增模板' : '编辑模板'"
      width="600px"
      class="template-dialog"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="template-form"
      >
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入模板名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择模板类型" style="width: 100%">
                <el-option v-for="item in typeOptions.slice(1)" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板分类" prop="category">
              <el-select v-model="formData.category" placeholder="请选择模板分类" style="width: 100%">
                <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="模板描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="版本号" prop="version">
              <el-input v-model="formData.version" placeholder="如：1.0" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="总分" prop="totalScore">
              <el-input-number v-model="formData.totalScore" :min="1" :max="1000" style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="及格分" prop="passScore">
              <el-input-number v-model="formData.passScore" :min="0" :max="formData.totalScore" style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">已启用</el-radio>
            <el-radio :value="0">已禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ dialogMode === 'create' ? '确定新增' : '确定修改' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 检查项新增/编辑弹窗 -->
    <el-dialog
      v-model="itemDialogVisible"
      :title="itemDialogMode === 'create' ? '新增检查项' : '编辑检查项'"
      width="650px"
      class="item-dialog"
      destroy-on-close
    >
      <el-form
        ref="itemFormRef"
        :model="itemFormData"
        :rules="itemFormRules"
        label-width="100px"
        class="item-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检查项编码" prop="code">
              <el-input v-model="itemFormData.code" placeholder="请输入编码" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="itemFormData.category" placeholder="请选择分类" style="width: 100%">
                <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="检查项名称" prop="title">
          <el-input v-model="itemFormData.title" placeholder="请输入检查项名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="检查项描述" prop="description">
          <el-input
            v-model="itemFormData.description"
            type="textarea"
            :rows="2"
            placeholder="请输入检查项描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="类型" prop="type">
              <el-select v-model="itemFormData.type" placeholder="请选择类型" style="width: 100%">
                <el-option label="文本" value="text" />
                <el-option label="单选" value="select" />
                <el-option label="多选" value="multiple" />
                <el-option label="是非" value="boolean" />
                <el-option label="评分" value="score" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分值" prop="scoreWeight">
              <el-input-number v-model="itemFormData.scoreWeight" :min="0" :max="100" style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="itemFormData.sortOrder" :min="0" style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="设置">
          <el-checkbox v-model="itemFormData.required">必查项</el-checkbox>
          <el-checkbox v-model="itemFormData.needPhoto" class="ml-4">需拍照取证</el-checkbox>
        </el-form-item>
        <el-form-item label="评分标准" prop="scoringStandard">
          <el-input
            v-model="itemFormData.scoringStandard"
            type="textarea"
            :rows="3"
            placeholder="请输入评分标准，说明如何打分"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleItemSubmit">
          {{ itemDialogMode === 'create' ? '确定新增' : '确定修改' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.template-management-container {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: #F8FAFC;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
}

.title-icon {
  color: #165DFF;
  width: 28px;
  height: 28px;
}

.page-desc {
  font-size: 14px;
  color: #64748B;
  margin: 0;
}

.create-btn {
  height: 40px;
  padding: 0 24px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.filter-card {
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  margin-bottom: 24px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.template-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(22, 93, 255, 0.12);
  border-color: #165DFF;
}

.card-header {
  padding: 20px 20px 16px;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.template-title {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  line-height: 1.4;
  flex: 1;
  padding-right: 12px;
}

.card-body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tags-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.template-desc {
  font-size: 13px;
  color: #64748B;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #F8FAFC;
  border-radius: 10px;
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  flex-shrink: 0;
}

.version-icon {
  background: #6366F1;
}

.score-icon {
  background: #F59E0B;
}

.pass-icon {
  background: #10B981;
}

.items-icon {
  background: #165DFF;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1E293B;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: #94A3B8;
}

.card-footer-info {
  padding-top: 8px;
  border-top: 1px dashed #E2E8F0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94A3B8;
}

.info-icon {
  flex-shrink: 0;
}

.card-footer {
  padding: 16px 20px;
  border-top: 1px solid #F1F5F9;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  background: #FAFAFA;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

/* 检查项管理视图 */
.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #475569;
  flex-shrink: 0;
}

.back-btn:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
  color: #165DFF;
}

.template-info {
  flex: 1;
  text-align: center;
}

.template-name {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 8px 0;
}

.template-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 13px;
  color: #64748B;
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-section {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  overflow: hidden;
}

.category-header {
  padding: 16px 24px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
}

.category-count {
  font-size: 13px;
  color: #64748B;
  background: #E8F0FF;
  padding: 4px 12px;
  border-radius: 999px;
}

.items-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  transition: all 0.2s;
}

.item-card:hover {
  background: #FFFFFF;
  border-color: #CBD5E1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.item-drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.item-drag-handle:hover {
  background: #E2E8F0;
}

.item-drag-handle:active {
  cursor: grabbing;
}

.drag-icon {
  color: #94A3B8;
}

.item-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.item-code {
  font-family: 'SF Mono', monospace;
  font-size: 12px;
  color: #165DFF;
  background: #E8F0FF;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 500;
  flex-shrink: 0;
}

.item-title {
  font-size: 15px;
  font-weight: 600;
  color: #1E293B;
  flex: 1;
  min-width: 200px;
}

.item-tags {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.tag-icon {
  margin-right: 2px;
}

.item-desc {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  color: #64748B;
  line-height: 1.6;
}

.desc-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: #94A3B8;
}

.item-standard {
  font-size: 12px;
  color: #475569;
  background: #FEF3C7;
  padding: 8px 12px;
  border-radius: 8px;
  line-height: 1.6;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px dashed #E2E8F0;
}

.item-stats {
  display: flex;
  gap: 12px;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
}

.score-badge {
  background: #FEF3C7;
  color: #B45309;
  font-weight: 500;
}

.sort-badge {
  background: #E0E7FF;
  color: #4338CA;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.text-primary {
  color: #165DFF;
}

.text-muted {
  color: #94A3B8;
}

.text-danger {
  color: #EF4444;
}

.font-medium {
  font-weight: 500;
}

.ml-4 {
  margin-left: 16px;
}

:deep(.el-dialog) {
  border-radius: 16px;
}

:deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #F1F5F9;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 20px;
  border-top: 1px solid #F1F5F9;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #334155;
}

@media (max-width: 1200px) {
  .template-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-form .el-form-item {
    margin-right: 0 !important;
    margin-bottom: 12px;
  }

  .items-header {
    flex-direction: column;
    align-items: stretch;
  }

  .back-btn {
    align-self: flex-start;
  }

  .template-info {
    text-align: left;
  }

  .template-name {
    justify-content: flex-start;
  }

  .template-meta {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .template-management-container {
    padding: 16px;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .item-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
