<template>
  <div class="my-page" v-loading="loading">
    <el-card class="query-card" shadow="never">
      <div class="query-bar">
        <el-input
          v-model="phone"
          placeholder="请输入手机号查询"
          clearable
          style="width: 280px"
          @keyup.enter="handleQuery"
        >
          <template #prefix>
            <el-icon><Iphone /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" :icon="Search" @click="handleQuery">
          查询
        </el-button>
      </div>
    </el-card>

    <el-card class="table-card" shadow="never" style="margin-top: 16px">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#409EFF"><Document /></el-icon>
          <span>我的投诉记录</span>
        </div>
      </template>

      <el-empty
        v-if="!loading && list.length === 0"
        description="暂无投诉记录"
        :image-size="120"
      />

      <el-table
        v-else
        :data="pagedList"
        stripe
        style="width: 100%"
        empty-text="暂无数据"
      >
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="110" />
        <el-table-column prop="area" label="区域" width="140" show-overflow-tooltip />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" effect="light">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="goDetail(row)">
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'COMPLETED' && !row.evaluated"
              type="warning"
              link
              @click="openEvaluate(row)"
            >
              评价
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>

    <el-dialog
      v-model="evalVisible"
      title="满意度评价"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="evalForm" label-width="80px">
        <el-form-item label="评分">
          <el-rate v-model="evalForm.rating" :max="5" show-text />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input
            v-model="evalForm.feedback"
            type="textarea"
            :rows="4"
            placeholder="请填写您的评价（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="evalVisible = false">取消</el-button>
        <el-button type="primary" :loading="evaluating" @click="submitEval">
          提交评价
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getMyComplaints, evaluateComplaint } from '../api'

const router = useRouter()
const loading = ref(false)
const evaluating = ref(false)
const phone = ref('')
const list = ref([])
const currentPage = ref(1)
const pageSize = ref(10)

const total = computed(() => list.value.length)
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return list.value.slice(start, start + pageSize.value)
})

const evalVisible = ref(false)
const evalTarget = ref(null)
const evalForm = reactive({
  rating: 5,
  feedback: ''
})

const statusType = (s) => {
  const map = {
    PENDING: 'info',
    ACCEPTED: '',
    PROCESSING: 'warning',
    REPLIED: 'primary',
    COMPLETED: 'success',
    REJECTED: 'danger'
  }
  return map[s] || 'info'
}

const statusText = (s) => {
  const map = {
    PENDING: '待受理',
    ACCEPTED: '已受理',
    PROCESSING: '处理中',
    REPLIED: '已回复',
    COMPLETED: '已完成',
    REJECTED: '已驳回'
  }
  return map[s] || s
}

const handleQuery = async () => {
  if (!phone.value.trim()) {
    ElMessage.warning('请输入手机号')
    return
  }
  loading.value = true
  try {
    const data = await getMyComplaints(phone.value.trim())
    list.value = Array.isArray(data) ? data : []
    currentPage.value = 1
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

const goDetail = (row) => {
  router.push(`/detail/${row.id}`)
}

const openEvaluate = (row) => {
  evalTarget.value = row
  evalForm.rating = 5
  evalForm.feedback = ''
  evalVisible.value = true
}

const submitEval = async () => {
  if (!evalTarget.value) return
  evaluating.value = true
  try {
    await evaluateComplaint(evalTarget.value.id, evalForm.rating, evalForm.feedback)
    ElMessage.success('评价提交成功')
    evalTarget.value.evaluated = true
    evalVisible.value = false
  } catch (e) {
    // handled
  } finally {
    evaluating.value = false
  }
}
</script>

<style scoped>
.my-page {
  max-width: 1200px;
  margin: 0 auto;
}

.query-card {
  border-radius: 8px;
}

.query-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
