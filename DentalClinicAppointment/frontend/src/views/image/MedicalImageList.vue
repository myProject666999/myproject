<template>
  <div class="image-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>影像资料管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 上传影像
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="影像类型">
          <el-select v-model="searchForm.imageType" placeholder="全部类型" clearable style="width: 150px">
            <el-option label="X光" value="X_RAY" />
            <el-option label="CT" value="CT" />
            <el-option label="口腔全景" value="CBCT" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-empty v-if="!loading && tableData.length === 0" description="暂无影像资料" />
      <el-row :gutter="20" v-else>
        <el-col :span="6" v-for="item in tableData" :key="item.id">
          <el-card class="image-card">
            <div class="image-wrapper">
              <img :src="getImageUrl(item.imagePath)" alt="" />
            </div>
            <div class="image-info">
              <div class="image-name">{{ item.imageName }}</div>
              <div class="image-meta">
                <el-tag size="small">{{ getImageTypeText(item.imageType) }}</el-tag>
                <span class="date">{{ item.takeDate }}</span>
              </div>
              <div class="image-actions">
                <el-button type="primary" link size="small" @click="handleView(item)">查看</el-button>
                <el-button type="danger" link size="small" @click="handleDelete(item)">删除</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="上传影像" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="患者" prop="patientId">
          <el-select v-model="form.patientId" placeholder="请选择患者" filterable style="width: 100%">
            <el-option v-for="patient in patients" :key="patient.id" :label="patient.name" :value="patient.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="影像类型" prop="imageType">
          <el-select v-model="form.imageType" placeholder="请选择影像类型" style="width: 100%">
            <el-option label="X光" value="X_RAY" />
            <el-option label="CT" value="CT" />
            <el-option label="口腔全景" value="CBCT" />
          </el-select>
        </el-form-item>
        <el-form-item label="影像名称" prop="imageName">
          <el-input v-model="form.imageName" placeholder="请输入影像名称" />
        </el-form-item>
        <el-form-item label="影像文件" prop="imagePath">
          <el-upload
            class="upload-demo"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :show-file-list="false"
            accept="image/*"
          >
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 jpg/png 文件，且不超过 50MB
              </div>
            </template>
          </el-upload>
          <div v-if="form.imagePath" class="preview">
            <img :src="getImageUrl(form.imagePath)" alt="" />
          </div>
        </el-form-item>
        <el-form-item label="拍摄日期">
          <el-date-picker
            v-model="form.takeDate"
            type="datetime"
            placeholder="选择拍摄日期"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="涉及牙位">
          <el-input v-model="form.toothPositions" placeholder="如:11,12,21" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewDialogVisible" title="查看影像" width="800px">
      <div class="view-image">
        <img :src="viewImageUrl" alt="" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMedicalImages, createMedicalImage, deleteMedicalImage, getPatients } from '../../api'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()
const loading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const formRef = ref()

const uploadUrl = computed(() => 'http://localhost:8080/api/medical-images/upload')
const uploadHeaders = computed(() => ({
  'Authorization': 'Bearer ' + localStorage.getItem('token')
}))

const viewImageUrl = ref('')

const searchForm = reactive({
  imageType: ''
})

const pagination = reactive({
  current: 1,
  size: 12,
  total: 0
})

const tableData = ref([])
const patients = ref([])

const form = reactive({
  id: null,
  patientId: null,
  imageType: '',
  imageName: '',
  imagePath: '',
  takeDate: '',
  toothPositions: '',
  description: ''
})

const rules = {
  patientId: [{ required: true, message: '请选择患者', trigger: 'change' }],
  imageType: [{ required: true, message: '请选择影像类型', trigger: 'change' }],
  imageName: [{ required: true, message: '请输入影像名称', trigger: 'blur' }],
  imagePath: [{ required: true, message: '请上传影像文件', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      size: pagination.size,
      imageType: searchForm.imageType
    }
    const res = await getMedicalImages(params)
    tableData.value = res.data.records
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

const loadPatients = async () => {
  try {
    const res = await getPatients({ current: 1, size: 1000, clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1 })
    patients.value = res.data.records
  } catch (e) {
    console.error(e)
  }
}

const resetSearch = () => {
  searchForm.imageType = ''
  pagination.current = 1
  loadData()
}

const getImageUrl = (path) => {
  if (!path) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSI+5b2x5YOPngL/vvIjnvZHnu5zwrnJtZTwvdGV4dD48L3N2Zz4='
  if (path.startsWith('http')) return path
  return 'http://localhost:8080/api' + path
}

const getImageTypeText = (type) => {
  const map = {
    X_RAY: 'X光',
    CT: 'CT',
    CBCT: '口腔全景'
  }
  return map[type] || type
}

const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

const handleUploadSuccess = (response) => {
  form.imagePath = response.data
  ElMessage.success('上传成功')
}

const handleUploadError = () => {
  ElMessage.error('上传失败')
}

const handleView = (item) => {
  viewImageUrl.value = getImageUrl(item.imagePath)
  viewDialogVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该影像吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await deleteMedicalImage(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    patientId: null,
    imageType: '',
    imageName: '',
    imagePath: '',
    takeDate: '',
    toothPositions: '',
    description: ''
  })
}

const handleSubmit = async () => {
  await formRef.value.validate()
  await createMedicalImage(form)
  ElMessage.success('保存成功')
  dialogVisible.value = false
  loadData()
}

onMounted(() => {
  loadData()
  loadPatients()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-card {
  margin-bottom: 20px;

  .image-wrapper {
    height: 180px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
    }
  }

  .image-info {
    margin-top: 10px;

    .image-name {
      font-weight: bold;
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .image-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #999;
      margin-bottom: 10px;

      .date {
        font-size: 12px;
      }
    }

    .image-actions {
      border-top: 1px solid #eee;
      padding-top: 10px;
      display: flex;
      gap: 10px;
    }
  }
}

.preview {
  margin-top: 10px;

  img {
    max-width: 200px;
    max-height: 200px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
}

.view-image {
  text-align: center;

  img {
    max-width: 100%;
    max-height: 600px;
  }
}
</style>
