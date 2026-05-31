<template>
  <div class="page-container route-page">
    <PageHeader title="路由编排" description="管理微前端应用的路由配置、菜单结构和权限控制">
      <template #actions>
        <el-select v-model="selectedAppId" placeholder="选择应用" style="width: 200px" @change="fetchRouteTree">
          <el-option
            v-for="app in apps"
            :key="app.id"
            :label="`${app.appName} (${app.appCode})`"
            :value="app.id"
          />
        </el-select>
        <el-button :icon="Refresh" @click="fetchRouteTree">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openAddDialog(null)">新增根路由</el-button>
        <el-button :icon="View" @click="openPreviewDialog">路由预览</el-button>
      </template>
    </PageHeader>

    <div class="route-content">
      <div class="route-tree-panel">
        <div class="panel-header">
          <span>路由树</span>
          <el-tag size="small" type="info">拖拽排序</el-tag>
        </div>
        <div class="tree-container" ref="treeContainer">
          <el-tree
            ref="treeRef"
            :data="routeTree"
            node-key="id"
            default-expand-all
            :expand-on-click-node="false"
            :props="{ label: 'title', children: 'children' }"
            :allow-drop="allowDrop"
            :allow-drag="allowDrag"
            @node-click="handleNodeClick"
            @node-drop="handleNodeDrop"
            draggable
            highlight-current
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <el-icon v-if="data.icon"><component :is="data.icon" /></el-icon>
                <span class="node-title">{{ data.title }}</span>
                <el-tag v-if="data.visible === 0" size="small" type="info">隐藏</el-tag>
                <span class="node-path">{{ data.path }}</span>
              </span>
            </template>
          </el-tree>
        </div>
      </div>

      <div class="route-form-panel">
        <div class="panel-header">
          <span>路由详情</span>
          <div class="header-actions">
            <el-button
              v-if="selectedRoute"
              type="primary"
              size="small"
              :icon="Plus"
              @click="openAddDialog(selectedRoute)"
            >
              新增子路由
            </el-button>
            <el-button
              v-if="selectedRoute"
              type="danger"
              size="small"
              :icon="Delete"
              @click="handleDelete"
            >
              删除
            </el-button>
          </div>
        </div>
        <div v-if="selectedRoute" class="form-container">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="100px"
          >
            <el-form-item label="路由路径" prop="path">
              <el-input v-model="formData.path" placeholder="如：/user/list" />
            </el-form-item>
            <el-form-item label="路由名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入路由名称" />
            </el-form-item>
            <el-form-item label="菜单标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入菜单标题" />
            </el-form-item>
            <el-form-item label="菜单图标" prop="icon">
              <el-select v-model="formData.icon" placeholder="选择图标" clearable>
                <el-option
                  v-for="icon in iconList"
                  :key="icon"
                  :label="icon"
                  :value="icon"
                >
                  <el-icon><component :is="icon" /></el-icon>
                  <span style="margin-left: 8px">{{ icon }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="formData.sort" :min="0" style="width: 100%" />
            </el-form-item>
            <el-form-item label="是否显示" prop="visible">
              <el-radio-group v-model="formData.visible">
                <el-radio :value="1">显示</el-radio>
                <el-radio :value="0">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="权限标识" prop="permission">
              <el-input v-model="formData.permission" placeholder="如：user:view" />
            </el-form-item>
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="formData.component" placeholder="如：/user/List" />
            </el-form-item>
            <el-form-item label="所属应用">
              <el-select v-model="formData.appId" style="width: 100%">
                <el-option
                  v-for="app in apps"
                  :key="app.id"
                  :label="`${app.appName} (${app.appCode})`"
                  :value="app.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <div class="form-footer">
                <el-button @click="resetForm">重置</el-button>
                <el-button type="primary" @click="handleSave">保存</el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
        <div v-else class="empty-tip">
          <el-empty description="请选择左侧路由节点查看详情" />
        </div>
      </div>
    </div>

    <el-dialog v-model="addDialogVisible" :title="isEdit ? '编辑路由' : '新增路由'" width="500px" destroy-on-close>
      <el-form ref="addFormRef" :model="addFormData" :rules="formRules" label-width="100px">
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="addFormData.path" placeholder="如：/user/list" />
        </el-form-item>
        <el-form-item label="路由名称" prop="name">
          <el-input v-model="addFormData.name" placeholder="请输入路由名称" />
        </el-form-item>
        <el-form-item label="菜单标题" prop="title">
          <el-input v-model="addFormData.title" placeholder="请输入菜单标题" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-select v-model="addFormData.icon" placeholder="选择图标" clearable style="width: 100%">
            <el-option
              v-for="icon in iconList"
              :key="icon"
              :label="icon"
              :value="icon"
            >
              <el-icon><component :is="icon" /></el-icon>
              <span style="margin-left: 8px">{{ icon }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="addFormData.sort" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="是否显示" prop="visible">
          <el-radio-group v-model="addFormData.visible">
            <el-radio :value="1">显示</el-radio>
            <el-radio :value="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限标识" prop="permission">
          <el-input v-model="addFormData.permission" placeholder="如：user:view" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="addFormData.component" placeholder="如：/user/List" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="form-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="previewVisible" title="路由预览" width="600px">
      <el-tree :data="previewRoutes" node-key="id" default-expand-all :props="{ label: 'title', children: 'children' }">
        <template #default="{ node, data }">
          <span class="preview-node">
            <el-icon v-if="data.icon"><component :is="data.icon" /></el-icon>
            <span>{{ data.title }}</span>
            <span class="preview-path">{{ data.path }}</span>
          </span>
        </template>
      </el-tree>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, View, Delete, Menu, User, Setting, DataBoard, Document, List } from '@element-plus/icons-vue'
import * as routeApi from '@/api/route'
import * as appApi from '@/api/app'
import { createRules, validateRequired } from '@/utils/validate'
import type { RouteConfig, MicroApp } from '@/types'

const iconList = ['Menu', 'User', 'Setting', 'DataBoard', 'Document', 'List', 'Grid', 'Histogram', 'Monitor']

const treeRef = ref()
const treeContainer = ref()
const formRef = ref()
const addFormRef = ref()

const apps = ref<MicroApp[]>([])
const selectedAppId = ref<number | null>(null)
const routeTree = ref<RouteConfig[]>([])
const selectedRoute = ref<RouteConfig | null>(null)
const addDialogVisible = ref(false)
const previewVisible = ref(false)
const previewRoutes = ref<RouteConfig[]>([])
const isEdit = ref(false)
const parentRoute = ref<RouteConfig | null>(null)

const formData = reactive<Partial<RouteConfig>>({
  path: '',
  name: '',
  title: '',
  icon: '',
  sort: 0,
  visible: 1,
  permission: '',
  component: '',
  appId: null,
  parentId: 0
})

const addFormData = reactive<Partial<RouteConfig>>({
  path: '',
  name: '',
  title: '',
  icon: '',
  sort: 0,
  visible: 1,
  permission: '',
  component: '',
  appId: null,
  parentId: 0
})

const formRules = createRules({
  path: [validateRequired('请输入路由路径')],
  name: [validateRequired('请输入路由名称')],
  title: [validateRequired('请输入菜单标题')]
})

async function fetchApps() {
  apps.value = await appApi.getAllApps()
  if (apps.value.length > 0 && !selectedAppId.value) {
    selectedAppId.value = apps.value[0].id
    fetchRouteTree()
  }
}

async function fetchRouteTree() {
  if (!selectedAppId.value) return
  routeTree.value = await routeApi.getRouteTree(selectedAppId.value)
}

function handleNodeClick(data: RouteConfig) {
  selectedRoute.value = data
  Object.assign(formData, data)
}

function allowDrop(draggingNode: any, dropNode: any, type: string) {
  return type !== 'inner' || draggingNode.data.appId === dropNode.data.appId
}

function allowDrag() {
  return true
}

async function handleNodeDrop(draggingNode: any, dropNode: any, dropType: string) {
  const routes = collectSortData(routeTree.value)
  await routeApi.updateRouteSort(routes)
  ElMessage.success('排序已更新')
}

function collectSortData(nodes: RouteConfig[], parentId: number = 0): { id: number; sort: number; parentId: number }[] {
  const result: { id: number; sort: number; parentId: number }[] = []
  nodes.forEach((node, index) => {
    result.push({ id: node.id, sort: index, parentId })
    if (node.children && node.children.length > 0) {
      result.push(...collectSortData(node.children, node.id))
    }
  })
  return result
}

function openAddDialog(parent: RouteConfig | null) {
  isEdit.value = false
  parentRoute.value = parent
  Object.assign(addFormData, {
    path: '',
    name: '',
    title: '',
    icon: '',
    sort: 0,
    visible: 1,
    permission: '',
    component: '',
    appId: selectedAppId.value,
    parentId: parent?.id || 0
  })
  addDialogVisible.value = true
}

async function handleAddSubmit() {
  const valid = await addFormRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    await routeApi.createRoute(addFormData)
    ElMessage.success('创建成功')
    addDialogVisible.value = false
    fetchRouteTree()
  } catch (e: any) {
    ElMessage.error(e.message || '创建失败')
  }
}

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || !selectedRoute.value) return

  try {
    await routeApi.updateRoute(selectedRoute.value.id, formData)
    ElMessage.success('保存成功')
    fetchRouteTree()
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  }
}

async function handleDelete() {
  if (!selectedRoute.value) return

  try {
    await ElMessageBox.confirm('确定要删除该路由吗？子路由也将被删除', '确认操作', {
      type: 'warning'
    })
    await routeApi.deleteRoute(selectedRoute.value.id)
    ElMessage.success('删除成功')
    selectedRoute.value = null
    fetchRouteTree()
  } catch {
  }
}

function resetForm() {
  if (selectedRoute.value) {
    Object.assign(formData, selectedRoute.value)
  }
}

async function openPreviewDialog() {
  if (!selectedAppId.value) {
    ElMessage.warning('请先选择应用')
    return
  }
  previewRoutes.value = await routeApi.previewRoutes(selectedAppId.value)
  previewVisible.value = true
}

onMounted(() => {
  fetchApps()
})
</script>

<style lang="scss" scoped>
.route-page {
  .route-content {
    display: flex;
    gap: 20px;
    height: calc(100vh - 280px);
    min-height: 500px;
  }

  .route-tree-panel,
  .route-form-panel {
    background: #fff;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .route-tree-panel {
    width: 380px;
    flex-shrink: 0;
  }

  .route-form-panel {
    flex: 1;
  }

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid #e6e6e6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .tree-container {
    flex: 1;
    overflow: auto;
    padding: 12px;

    :deep(.el-tree) {
      background: transparent;
    }
  }

  .tree-node {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;

    .node-title {
      flex: 1;
    }

    .node-path {
      color: #909399;
      font-size: 12px;
      margin-left: auto;
    }

    .el-icon {
      color: #409eff;
    }
  }

  .form-container {
    flex: 1;
    overflow: auto;
    padding: 20px;
  }

  .empty-tip {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-node {
    display: flex;
    align-items: center;
    gap: 8px;

    .preview-path {
      color: #909399;
      font-size: 12px;
      margin-left: auto;
    }

    .el-icon {
      color: #409eff;
    }
  }
}
</style>
