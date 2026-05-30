<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">付费数据</span>
      <el-button type="primary" @click="handleImport">
        <el-icon><Upload /></el-icon>
        导入数据
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="data_no" label="数据编号" width="180" />
        <el-table-column prop="drama_id" label="剧集ID" width="100" />
        <el-table-column prop="payment_amount" label="付费金额" width="120" />
        <el-table-column prop="payment_count" label="付费次数" width="120" />
        <el-table-column prop="unique_payers" label="付费用户数" width="120" />
        <el-table-column prop="data_date" label="数据日期" width="120" />
        <el-table-column prop="data_source" label="数据来源" width="120" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" title="导入付费数据" width="500px">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item label="剧集ID">
          <el-input-number v-model="form.drama_id" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="付费金额">
          <el-input-number v-model="form.payment_amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="付费次数">
          <el-input-number v-model="form.payment_count" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="付费用户数">
          <el-input-number v-model="form.unique_payers" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="数据日期">
          <el-date-picker
            v-model="form.data_date"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="数据来源">
          <el-input v-model="form.data_source" placeholder="请输入数据来源" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { getPaymentDataList, importPaymentData } from '@/api/data'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)

const form = reactive({
  drama_id: 1,
  payment_amount: 0,
  payment_count: 0,
  unique_payers: 0,
  data_date: '',
  data_source: '手动导入'
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPaymentDataList({ page_size: 100 })
    if (res) {
      tableData.value = res.list || []
    }
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const handleImport = () => {
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    await importPaymentData(form)
    ElMessage.success('导入成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('导入失败', error)
  }
}

onMounted(() => {
  loadData()
})
</script>
