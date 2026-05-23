<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑竞赛' : '新建竞赛' }}</h2>
      <el-button @click="$router.back()">返回</el-button>
    </div>
    <div class="card">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="竞赛标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="竞赛描述" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" placeholder="开始时间" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="datetime" placeholder="结束时间" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type">
            <el-option label="标准赛" :value="0" />
            <el-option label="CF赛" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" placeholder="留空则无密码" />
        </el-form-item>
        <el-form-item label="题目">
          <div style="width: 100%;">
            <el-button type="primary" size="small" @click="showAddProblem = true">添加题目</el-button>
            <div v-for="(p, i) in form.problems" :key="i" style="display: flex; align-items: center; margin-top: 10px;">
              <span style="margin-right: 10px; width: 30px;">{{ String.fromCharCode(65 + i) }}.</span>
              <el-input :value="`#${p.id} ${p.title}`" disabled style="flex: 1;" />
              <el-button type="danger" size="small" @click="removeProblem(i)" style="margin-left: 10px;">删除</el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">保存</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-dialog v-model="showAddProblem" title="选择题目" width="600px">
      <el-input v-model="searchKeyword" placeholder="搜索题目" style="margin-bottom: 10px;" clearable />
      <el-table :data="searchResults" ref="searchTable" @selection-change="handleSelectionChange" height="300px">
        <el-table-column type="selection" width="55" />
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="标题" prop="title" />
        <el-table-column label="难度" width="80">
          <template #default="scope">
            <span :class="getDifficultyClass(scope.row.difficulty)">
              {{ getDifficultyText(scope.row.difficulty) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 10px;">
        <el-pagination
          layout="prev, pager, next"
          :total="searchTotal"
          :page-size="10"
          :current-page="searchPage"
          @current-change="handleSearchPageChange"
          style="display: inline-block;"
        />
      </div>
      <template #footer>
        <el-button @click="showAddProblem = false">取消</el-button>
        <el-button type="primary" @click="confirmAddProblems">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const showAddProblem = ref(false)
const searchKeyword = ref('')
const searchResults = ref([])
const searchTotal = ref(0)
const searchPage = ref(1)
const selectedProblems = ref([])

const isEdit = computed(() => !!route.params.id)

const form = ref({
  id: null,
  title: '',
  description: '',
  startTime: null,
  endTime: null,
  type: 0,
  password: '',
  problems: []
})

const rules = {
  title: [{ required: true, message: '请输入竞赛标题', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const fetchContest = async () => {
  const res = await request.get(`/contest/detail/${route.params.id}`)
  Object.assign(form.value, res.data)
  if (!form.value.problems) form.value.problems = []
}

const searchProblems = async () => {
  const res = await request.get('/problem/list', {
    params: { page: searchPage.value, size: 10, keyword: searchKeyword.value }
  })
  searchResults.value = res.data.records
  searchTotal.value = res.data.total
}

const handleSelectionChange = (selection) => {
  selectedProblems.value = selection
}

const handleSearchPageChange = (page) => {
  searchPage.value = page
  searchProblems()
}

const confirmAddProblems = () => {
  for (const p of selectedProblems.value) {
    if (!form.value.problems.find(fp => fp.id === p.id)) {
      form.value.problems.push(p)
    }
  }
  showAddProblem.value = false
  selectedProblems.value = []
}

const removeProblem = (i) => {
  form.value.problems.splice(i, 1)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const submitData = {
          ...form.value,
          problems: form.value.problems.map(p => ({ id: p.id }))
        }
        if (isEdit.value) {
          await request.put('/contest/update', submitData)
          ElMessage.success('更新成功')
        } else {
          await request.post('/contest/create', submitData)
          ElMessage.success('创建成功')
        }
        router.push('/admin/contest/list')
      } catch (e) {
        // error handled
      } finally {
        loading.value = false
      }
    }
  })
}

const getDifficultyText = (d) => ({ 1: '简单', 2: '中等', 3: '困难' }[d] || '未知')
const getDifficultyClass = (d) => ({ 1: 'difficulty-easy', 2: 'difficulty-medium', 3: 'difficulty-hard' }[d] || '')

onMounted(() => {
  if (isEdit.value) {
    fetchContest()
  }
  searchProblems()
})
</script>
