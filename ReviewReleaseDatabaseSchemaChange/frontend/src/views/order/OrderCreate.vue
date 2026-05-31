<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">{{ isEdit ? '编辑工单' : '创建工单' }}</span>
    </div>

    <el-form ref="formRef" :model="form" label-width="120px">
      <el-card class="card-section">
        <template #header><span class="section-title">基本信息</span></template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工单标题" prop="title" :rules="[{ required: true, message: '请输入工单标题', trigger: 'blur' }]">
              <el-input v-model="form.title" placeholder="请输入工单标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标环境" prop="envId" :rules="[{ required: true, message: '请选择环境', trigger: 'change' }]">
              <el-select v-model="form.envId" placeholder="请选择环境">
                <el-option label="开发环境" :value="1" />
                <el-option label="测试环境" :value="2" />
                <el-option label="预发环境" :value="3" />
                <el-option label="生产环境" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据库名" prop="dbName" :rules="[{ required: true, message: '请输入数据库名', trigger: 'blur' }]">
              <el-input v-model="form.dbName" placeholder="请输入数据库名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="form.priority">
                <el-option label="低" value="low" />
                <el-option label="中" value="normal" />
                <el-option label="高" value="high" />
                <el-option label="紧急" value="urgent" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="变更类型" prop="changeType">
              <el-select v-model="form.changeType">
                <el-option label="DDL-结构变更" value="ddl" />
                <el-option label="DML-数据变更" value="dml" />
                <el-option label="DCL-权限变更" value="dcl" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="灰度执行">
              <el-switch v-model="form.isGray" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="变更描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请描述变更内容和原因" />
        </el-form-item>
      </el-card>

      <el-card class="card-section">
        <template #header><span class="section-title">SQL内容</span></template>
        <el-alert title="提示：多条SQL请用分号(;)分隔，系统会自动拆分执行" type="info" :closable="false" style="margin-bottom: 15px;" />
        <el-input
          v-model="sqlContent"
          type="textarea"
          :rows="12"
          placeholder="请输入SQL语句，多条用分号分隔"
        />
      </el-card>

      <el-card class="card-section">
        <template #header><span class="section-title">回滚预案</span></template>
        <el-input
          v-model="form.rollbackSql"
          type="textarea"
          :rows="6"
          placeholder="请输入回滚SQL语句，用于变更失败时执行回滚"
        />
      </el-card>

      <div class="form-actions">
        <el-button @click="$router.back()">取消</el-button>
        <el-button type="primary" @click="saveDraft">保存草稿</el-button>
        <el-button type="success" @click="submitReview">提交评审</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createOrder, updateOrder, submitForReview, getOrderDetail, getOrderSqlList } from '@/api/order'

const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const isEdit = ref(false)
const orderId = ref(null)
const sqlContent = ref('')

const form = reactive({
  title: '',
  envId: null,
  dbName: '',
  priority: 'normal',
  changeType: 'ddl',
  isGray: 0,
  description: '',
  rollbackSql: '',
  sqlList: []
})

const saveDraft = async () => {
  try {
    const sqlList = parseSql(sqlContent.value)
    if (sqlList.length === 0) {
      ElMessage.warning('请输入SQL内容')
      return
    }
    form.sqlList = sqlList

    if (isEdit.value) {
      form.id = orderId.value
      await updateOrder(form)
    } else {
      await createOrder(form)
    }
    ElMessage.success('保存成功')
    router.push('/order/list')
  } catch (e) {
    console.error(e)
  }
}

const submitReview = async () => {
  saveDraft().then(async () => {
    ElMessage.success('提交评审成功')
    router.push('/order/list')
  })
}

const parseSql = (content) => {
  if (!content) return []
  return content.split(';').map(s => s.trim()).filter(s => s.length > 0)
}

const loadOrderDetail = async (id) => {
  try {
    const res = await getOrderDetail(id)
    Object.assign(form, res.data)
    
    const sqlRes = await getOrderSqlList(id)
    const sqlList = sqlRes.data || []
    sqlContent.value = sqlList.map(s => s.sqlContent).join(';\n')
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  const id = route.query.id
  if (id) {
    isEdit.value = true
    orderId.value = id
    loadOrderDetail(id)
  }
})
</script>

<style scoped>
.form-actions {
  text-align: right;
  margin-top: 20px;
  button {
    margin-left: 10px;
  }
}
</style>
