<template>
  <div class="upload-page">
    <el-card class="upload-card">
      <template #header>
        <div class="card-header">
          <el-icon><Upload /></el-icon>
          <span>上传 vCard 文件</span>
        </div>
      </template>

      <el-form :model="form" label-width="80px">
        <el-form-item label="用户ID">
          <el-input
            v-model="form.userId"
            placeholder="请输入用户标识"
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item label="选择文件">
          <el-upload
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            accept=".vcf,.vcard"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 .vcf 或 .vcard 格式的通讯录文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="uploading"
            @click="handleUpload"
            :disabled="!form.userId || !selectedFile"
          >
            <el-icon><Upload /></el-icon>
            开始上传
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="uploadResult" class="result-card">
      <template #header>
        <div class="card-header">
          <el-icon><Check /></el-icon>
          <span>上传结果</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="联系人总数">
          {{ uploadResult.total }}
        </el-descriptions-item>
        <el-descriptions-item label="新增">
          <el-tag type="success">{{ uploadResult.added }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="更新">
          <el-tag type="warning">{{ uploadResult.updated }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="未变化">
          <el-tag type="info">{{ uploadResult.unchanged }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-if="contactList.length > 0" class="contacts-card">
      <template #header>
        <div class="card-header">
          <el-icon><User /></el-icon>
          <span>联系人列表 ({{ contactList.length }})</span>
        </div>
      </template>
      <el-table :data="contactList" stripe>
        <el-table-column prop="formattedName" label="姓名" min-width="150" />
        <el-table-column prop="organization" label="公司" min-width="150" />
        <el-table-column prop="title" label="职位" min-width="120" />
        <el-table-column label="电话" min-width="150">
          <template #default="{ row }">
            <span v-if="row.phones">{{ parsePhones(row.phones) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="邮箱" min-width="200">
          <template #default="{ row }">
            <span v-if="row.emails">{{ parseEmails(row.emails) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedTime" label="更新时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { uploadVCard, getContactList } from '../api'
import { ElMessage } from 'element-plus'

const form = reactive({
  userId: 'default_user'
})
const fileList = ref([])
const selectedFile = ref(null)
const uploading = ref(false)
const uploadResult = ref(null)
const contactList = ref([])

const handleFileChange = (file) => {
  selectedFile.value = file.raw
}

const handleUpload = async () => {
  if (!form.userId) {
    ElMessage.warning('请输入用户ID')
    return
  }
  if (!selectedFile.value) {
    ElMessage.warning('请选择文件')
    return
  }

  uploading.value = true
  try {
    const res = await uploadVCard(form.userId, selectedFile.value)
    uploadResult.value = res.data
    ElMessage.success('上传成功')
    await loadContacts()
  } catch (e) {
    console.error(e)
  } finally {
    uploading.value = false
  }
}

const handleReset = () => {
  fileList.value = []
  selectedFile.value = null
  uploadResult.value = null
  contactList.value = []
}

const loadContacts = async () => {
  const res = await getContactList(form.userId)
  contactList.value = res.data
}

const parsePhones = (phones) => {
  try {
    const arr = JSON.parse(phones)
    return arr.map(p => p.value).join(', ')
  } catch {
    return phones
  }
}

const parseEmails = (emails) => {
  try {
    const arr = JSON.parse(emails)
    return arr.map(e => e.value).join(', ')
  } catch {
    return emails
  }
}
</script>

<style scoped>
.upload-page {
  max-width: 1000px;
  margin: 0 auto;
}

.upload-card {
  margin-bottom: 20px;
}

.result-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
}

.contacts-card {
  margin-bottom: 20px;
}
</style>
