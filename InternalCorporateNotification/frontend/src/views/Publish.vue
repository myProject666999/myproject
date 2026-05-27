<template>
  <div class="page-container">
    <div class="card">
      <div class="page-header">
        <div class="page-title">{{ isEdit ? '编辑公告' : '发布新公告' }}</div>
        <el-button link @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="publish-form"
      >
        <el-form-item label="公告标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入公告标题"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="公告分类" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
                <el-option
                  v-for="cat in categories"
                  :key="cat.id"
                  :label="cat.name"
                  :value="cat.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="公告类型" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio :value="1">普通公告</el-radio>
                <el-radio :value="2">紧急公告</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否置顶" prop="priority">
              <el-radio-group v-model="form.priority">
                <el-radio :value="0">否</el-radio>
                <el-radio :value="1">是</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="可见范围" prop="isAllDepartments">
          <el-radio-group v-model="form.isAllDepartments">
            <el-radio :value="1">全部部门</el-radio>
            <el-radio :value="0">指定部门</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="选择部门"
          prop="targetDepartments"
          v-if="form.isAllDepartments === 0"
        >
          <el-tree-select
            v-model="selectedDepartments"
            :data="departmentTree"
            :props="{ label: 'name', children: 'children' }"
            multiple
            check-strictly
            placeholder="请选择可见部门"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="公告内容" prop="content">
          <div class="editor-wrapper">
            <div class="editor-toolbar">
              <el-button-group>
                <el-button size="small" @click="formatText('bold')">
                  <el-icon><Bold /></el-icon>
                </el-button>
                <el-button size="small" @click="formatText('italic')">
                  <el-icon><Italic /></el-icon>
                </el-button>
                <el-button size="small" @click="formatText('underline')">
                  <el-icon><Underline /></el-icon>
                </el-button>
              </el-button-group>
              <el-button-group class="ml-10">
                <el-button size="small" @click="formatText('insertUnorderedList')">
                  <el-icon><List /></el-icon>
                </el-button>
                <el-button size="small" @click="formatText('insertOrderedList')">
                  <el-icon><Operation /></el-icon>
                </el-button>
              </el-button-group>
              <el-button-group class="ml-10">
                <el-button size="small" @click="formatText('justifyLeft')">
                  <el-icon><AlignLeft /></el-icon>
                </el-button>
                <el-button size="small" @click="formatText('justifyCenter')">
                  <el-icon><AlignCenter /></el-icon>
                </el-button>
                <el-button size="small" @click="formatText('justifyRight')">
                  <el-icon><AlignRight /></el-icon>
                </el-button>
              </el-button-group>
            </div>
            <div
              ref="editorRef"
              class="editor-content"
              contenteditable="true"
              placeholder="请输入公告内容..."
              @input="onEditorInput"
            ></div>
          </div>
        </el-form-item>

        <el-form-item label="附件上传">
          <el-upload
            action="#"
            :auto-upload="false"
            multiple
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              选择文件
            </el-button>
            <template #tip>
              <div class="el-upload__tip">支持上传多个文件，单个文件不超过50MB</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '立即发布' }}
          </el-button>
          <el-button size="large" @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getCategories,
  getDepartmentTree,
  publishAnnouncement,
  updateAnnouncement,
  getAnnouncement,
  uploadAttachment
} from '@/api'

const route = useRoute()
const router = useRouter()

const formRef = ref()
const editorRef = ref()
const loading = ref(false)
const categories = ref([])
const departmentTree = ref([])
const fileList = ref([])
const selectedDepartments = ref([])

const isEdit = computed(() => !!route.query.id)
const editId = route.query.id

const form = reactive({
  id: null,
  title: '',
  content: '',
  categoryId: null,
  type: 1,
  priority: 0,
  status: 1,
  isAllDepartments: 1,
  targetDepartments: ''
})

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadDepartments()])
  if (isEdit.value) {
    await loadAnnouncement()
  }
})

async function loadCategories() {
  try {
    const res = await getCategories()
    categories.value = res.data
  } catch (e) {}
}

async function loadDepartments() {
  try {
    const res = await getDepartmentTree()
    departmentTree.value = res.data
  } catch (e) {}
}

async function loadAnnouncement() {
  try {
    const res = await getAnnouncement(editId)
    const data = res.data
    form.id = data.id
    form.title = data.title
    form.content = data.content
    form.categoryId = data.categoryId
    form.type = data.type
    form.priority = data.priority
    form.isAllDepartments = data.isAllDepartments
    form.targetDepartments = data.targetDepartments
    if (data.targetDepartments) {
      selectedDepartments.value = data.targetDepartments.split(',').map(Number)
    }
    if (editorRef.value) {
      editorRef.value.innerHTML = data.content
    }
  } catch (e) {}
}

function formatText(command) {
  document.execCommand(command, false, null)
  editorRef.value?.focus()
}

function onEditorInput() {
  form.content = editorRef.value.innerHTML
}

function handleFileChange(file) {
  fileList.value.push(file.raw)
}

function handleFileRemove(file) {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
  } catch (e) {
    return
  }

  if (!form.content.trim()) {
    ElMessage.warning('请输入公告内容')
    return
  }

  if (form.isAllDepartments === 0 && selectedDepartments.value.length === 0) {
    ElMessage.warning('请至少选择一个部门')
    return
  }

  form.targetDepartments = selectedDepartments.value.join(',')

  loading.value = true
  try {
    let announcementId
    if (isEdit.value) {
      await updateAnnouncement(form.id, form)
      announcementId = form.id
      ElMessage.success('修改成功')
    } else {
      const res = await publishAnnouncement(form)
      announcementId = res.data.id
      ElMessage.success('发布成功')
    }

    for (const file of fileList.value) {
      try {
        await uploadAttachment(file, announcementId)
      } catch (e) {
        console.error('上传附件失败', e)
      }
    }

    router.push('/announcements')
  } catch (e) {
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.publish-form {
  max-width: 1200px;
}

.editor-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.ml-10 {
  margin-left: 10px;
}

.editor-content {
  min-height: 400px;
  padding: 15px;
  font-size: 14px;
  line-height: 1.8;
  outline: none;
}

.editor-content:empty::before {
  content: attr(placeholder);
  color: #c0c4cc;
}
</style>
