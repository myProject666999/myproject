<template>
  <div class="page-container">
    <div class="card">
      <div class="page-header">
        <div class="page-title">后台管理</div>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="公告管理" name="announcements">
          <div class="mb-20">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索公告标题"
              clearable
              style="width: 300px"
              @keyup.enter="loadAnnouncements"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" style="margin-left: 10px" @click="loadAnnouncements">
              搜索
            </el-button>
          </div>

          <el-table :data="announcementList" border stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="标题" min-width="250">
              <template #default="{ row }">
                <div class="ellipsis-text" :title="row.title">
                  <span v-if="row.priority === 1" class="tag-top mr-5">置顶</span>
                  <span v-if="row.type === 2" class="tag-emergency mr-5">紧急</span>
                  {{ row.title }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="publisherName" label="发布人" width="100" />
            <el-table-column prop="publishTime" label="发布时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.publishTime) }}
              </template>
            </el-table-column>
            <el-table-column label="已读情况" width="150">
              <template #default="{ row }">
                {{ row.readCount }}/{{ row.totalCount }}
                <el-progress
                  :percentage="row.totalCount ? Math.round(row.readCount * 100 / row.totalCount) : 0"
                  :stroke-width="6"
                  style="margin-top: 5px"
                />
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                  {{ row.status === 1 ? '已发布' : '草稿' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewDetail(row)">
                  查看
                </el-button>
                <el-button type="success" link size="small" @click="editAnnouncement(row)">
                  编辑
                </el-button>
                <el-button link size="small" @click="toggleTop(row)">
                  {{ row.priority === 1 ? '取消置顶' : '置顶' }}
                </el-button>
                <el-button type="danger" link size="small" @click="deleteAnnouncement(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.pageNum"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadAnnouncements"
              @current-change="loadAnnouncements"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="分类管理" name="categories">
          <div class="mb-20">
            <el-button type="primary" @click="showCategoryDialog()">
              <el-icon><Plus /></el-icon>
              新增分类
            </el-button>
          </div>

          <el-table :data="categoryList" border stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="分类名称" width="200" />
            <el-table-column prop="icon" label="图标" width="100">
              <template #default="{ row }">
                <span style="font-size: 20px">{{ row.icon }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="sortOrder" label="排序" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="showCategoryDialog(row)">
                  编辑
                </el-button>
                <el-button type="danger" link size="small" @click="deleteCategory(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="部门管理" name="departments">
          <div class="mb-20">
            <el-button type="primary" @click="showDeptDialog()">
              <el-icon><Plus /></el-icon>
              新增部门
            </el-button>
          </div>

          <el-table :data="departmentTree" border stripe row-key="id" :tree-props="{ children: 'children' }">
            <el-table-column prop="name" label="部门名称" min-width="200" />
            <el-table-column prop="sortOrder" label="排序" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="showDeptDialog(row)">
                  编辑
                </el-button>
                <el-button type="danger" link size="small" @click="deleteDepartment(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      v-model="categoryDialogVisible"
      :title="editingCategory ? '编辑分类' : '新增分类'"
      width="400px"
    >
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="categoryForm.icon" placeholder="请输入图标emoji" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="categoryForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="deptDialogVisible"
      :title="editingDept ? '编辑部门' : '新增部门'"
      width="400px"
    >
      <el-form :model="deptForm" label-width="80px">
        <el-form-item label="部门名称">
          <el-input v-model="deptForm.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="上级部门">
          <el-tree-select
            v-model="deptForm.parentId"
            :data="departmentTree"
            :props="{ label: 'name', children: 'children' }"
            placeholder="请选择上级部门（顶级不选）"
            style="width: 100%"
            clearable
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="deptForm.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="deptForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deptDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDepartment">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAnnouncements,
  updatePriority,
  deleteAnnouncement as apiDeleteAnnouncement,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory as apiDeleteCategory,
  getDepartmentTree
} from '@/api'
import dayjs from 'dayjs'

const router = useRouter()

const activeTab = ref('announcements')
const searchKeyword = ref('')

const announcementList = ref([])
const categoryList = ref([])
const departmentTree = ref([])

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const categoryDialogVisible = ref(false)
const editingCategory = ref(null)
const categoryForm = reactive({
  name: '',
  icon: '',
  sortOrder: 0,
  status: 1
})

const deptDialogVisible = ref(false)
const editingDept = ref(null)
const deptForm = reactive({
  name: '',
  parentId: 0,
  sortOrder: 0,
  status: 1
})

onMounted(() => {
  loadAnnouncements()
  loadCategories()
  loadDepartments()
})

async function loadAnnouncements() {
  try {
    const res = await getAnnouncements({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value || undefined
    })
    announcementList.value = res.data.list || []
    pagination.total = res.data.total || 0
  } catch (e) {}
}

async function loadCategories() {
  try {
    const res = await getCategories()
    categoryList.value = res.data
  } catch (e) {}
}

async function loadDepartments() {
  try {
    const res = await getDepartmentTree()
    departmentTree.value = res.data
  } catch (e) {}
}

function viewDetail(row) {
  router.push(`/announcements/${row.id}`)
}

function editAnnouncement(row) {
  router.push(`/publish?id=${row.id}`)
}

async function toggleTop(row) {
  try {
    await updatePriority(row.id, row.priority === 1 ? 0 : 1)
    ElMessage.success(row.priority === 1 ? '取消置顶成功' : '置顶成功')
    loadAnnouncements()
  } catch (e) {}
}

function deleteAnnouncement(row) {
  ElMessageBox.confirm('确定要删除该公告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiDeleteAnnouncement(row.id)
      ElMessage.success('删除成功')
      loadAnnouncements()
    } catch (e) {}
  }).catch(() => {})
}

function showCategoryDialog(row) {
  editingCategory.value = row
  if (row) {
    categoryForm.name = row.name
    categoryForm.icon = row.icon || ''
    categoryForm.sortOrder = row.sortOrder
    categoryForm.status = row.status
  } else {
    Object.assign(categoryForm, { name: '', icon: '', sortOrder: 0, status: 1 })
  }
  categoryDialogVisible.value = true
}

async function saveCategory() {
  try {
    if (editingCategory.value) {
      await updateCategory(editingCategory.value.id, categoryForm)
      ElMessage.success('更新成功')
    } else {
      await addCategory(categoryForm)
      ElMessage.success('添加成功')
    }
    categoryDialogVisible.value = false
    loadCategories()
  } catch (e) {}
}

function deleteCategory(row) {
  ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiDeleteCategory(row.id)
      ElMessage.success('删除成功')
      loadCategories()
    } catch (e) {}
  }).catch(() => {})
}

function showDeptDialog(row) {
  editingDept.value = row
  if (row) {
    deptForm.name = row.name
    deptForm.parentId = row.parentId
    deptForm.sortOrder = row.sortOrder
    deptForm.status = row.status
  } else {
    Object.assign(deptForm, { name: '', parentId: 0, sortOrder: 0, status: 1 })
  }
  deptDialogVisible.value = true
}

async function saveDepartment() {
  ElMessage.success('保存成功（演示）')
  deptDialogVisible.value = false
  loadDepartments()
}

function deleteDepartment(row) {
  ElMessageBox.confirm('确定要删除该部门吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    ElMessage.success('删除成功（演示）')
    loadDepartments()
  }).catch(() => {})
}

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}
</script>

<style scoped>
.ellipsis-text {
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mr-5 {
  margin-right: 5px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
