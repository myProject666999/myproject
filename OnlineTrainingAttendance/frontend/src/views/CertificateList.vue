<template>
  <div class="certificate-list">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" @submit.prevent>
        <el-form-item label="证书编号">
          <el-input
            v-model="filterForm.certificateNo"
            placeholder="请输入证书编号"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="学员姓名">
          <el-input
            v-model="filterForm.studentName"
            placeholder="请输入学员姓名"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadList">查询</el-button>
          <el-button :icon="Refresh" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table :data="list" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="certificateNo" label="证书编号" min-width="180" />
        <el-table-column prop="studentName" label="学员姓名" min-width="120" />
        <el-table-column prop="trainingName" label="培训班名称" min-width="200" />
        <el-table-column prop="instructor" label="讲师" min-width="120" />
        <el-table-column prop="totalHours" label="学时(h)" width="100" />
        <el-table-column prop="issueDate" label="颁发日期" width="140" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isValid === 0" type="danger" size="small">已撤销</el-tag>
            <el-tag v-else type="success" size="small">有效</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewCertificate(row)">
              查看
            </el-button>
            <el-button link type="primary" @click="downloadCertificate(row)">
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="previewVisible" title="证书预览" width="720px">
      <div class="certificate-preview">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="证书编号">
            {{ current?.certificateNo }}
          </el-descriptions-item>
          <el-descriptions-item label="验证码">
            {{ current?.verifyCode }}
          </el-descriptions-item>
          <el-descriptions-item label="学员姓名">
            {{ current?.studentName }}
          </el-descriptions-item>
          <el-descriptions-item label="培训班">
            {{ current?.trainingName }}
          </el-descriptions-item>
          <el-descriptions-item label="讲师">
            {{ current?.instructor }}
          </el-descriptions-item>
          <el-descriptions-item label="总学时">
            {{ current?.totalHours }} 小时
          </el-descriptions-item>
          <el-descriptions-item label="培训日期">
            {{ current?.startDate }} ~ {{ current?.endDate }}
          </el-descriptions-item>
          <el-descriptions-item label="颁发日期">
            {{ current?.issueDate }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getCertificateList } from '@/api/certificate'

const list = ref([])
const loading = ref(false)
const previewVisible = ref(false)
const current = ref(null)

const filterForm = reactive({
  certificateNo: '',
  studentName: ''
})

const loadList = async () => {
  loading.value = true
  try {
    const res = await getCertificateList()
    let data = res.data || []
    if (filterForm.certificateNo) {
      data = data.filter(i => (i.certificateNo || '').includes(filterForm.certificateNo))
    }
    if (filterForm.studentName) {
      data = data.filter(i => (i.studentName || '').includes(filterForm.studentName))
    }
    list.value = data
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filterForm.certificateNo = ''
  filterForm.studentName = ''
  loadList()
}

const viewCertificate = (row) => {
  current.value = row
  previewVisible.value = true
}

const downloadCertificate = (row) => {
  ElMessage.info(`下载证书：${row.certificateNo}`)
}

onMounted(loadList)
</script>

<style scoped>
.certificate-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.filter-card :deep(.el-card__body) {
  padding: 16px 20px 0;
}
.certificate-preview {
  padding: 10px 0;
}
</style>
