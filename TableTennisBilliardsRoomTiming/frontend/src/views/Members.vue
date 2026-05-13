<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会员管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索姓名/手机号/会员号"
              style="width: 250px; margin-right: 10px;"
              clearable
              @keyup.enter="fetchData"
            />
            <el-button type="primary" @click="addDialogVisible = true" :icon="Plus">
              添加会员
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="members" stripe>
        <el-table-column prop="member_no" label="会员号" width="150" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ { male: '男', female: '女', other: '其他' }[row.gender] || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="100">
          <template #default="{ row }">¥{{ row.balance }}</template>
        </el-table-column>
        <el-table-column prop="total_recharge" label="累计充值" width="100">
          <template #default="{ row }">¥{{ row.total_recharge }}</template>
        </el-table-column>
        <el-table-column prop="level" label="等级" width="80">
          <template #default="{ row }">
            <el-tag size="small">V{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ { active: '正常', inactive: '停用', frozen: '冻结' }[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="success" @click="recharge(row)">充值</el-button>
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="addDialogVisible" title="添加会员" width="500px">
      <el-form :model="memberForm" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="memberForm.name" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="memberForm.phone" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="memberForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="初始充值">
          <el-input-number v-model="memberForm.initialRecharge" :min="0" :precision="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMember">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rechargeDialogVisible" title="会员充值" width="400px">
      <el-form :model="rechargeForm" label-width="80px">
        <el-form-item label="会员">
          <span>{{ selectedMember?.name }} - {{ selectedMember?.member_no }}</span>
        </el-form-item>
        <el-form-item label="充值金额">
          <el-input-number v-model="rechargeForm.amount" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="赠送金额">
          <el-input-number v-model="rechargeForm.giftAmount" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="rechargeForm.paymentMethod" style="width: 100%">
            <el-option label="现金" value="cash" />
            <el-option label="微信" value="wechat" />
            <el-option label="支付宝" value="alipay" />
            <el-option label="银行卡" value="card" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rechargeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRecharge">确定充值</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '../utils/api'

const members = ref([])
const searchKeyword = ref('')
const addDialogVisible = ref(false)
const rechargeDialogVisible = ref(false)
const selectedMember = ref(null)

const memberForm = reactive({
  name: '',
  phone: '',
  gender: 'male',
  initialRecharge: 0
})

const rechargeForm = reactive({
  amount: 0,
  giftAmount: 0,
  paymentMethod: 'cash'
})

async function fetchData() {
  try {
    const params = { keyword: searchKeyword.value || undefined }
    const response = await api.get('/members', { params })
    members.value = response.data
  } catch (error) {
    console.error('获取会员列表失败:', error)
  }
}

async function saveMember() {
  try {
    await api.post('/members', memberForm)
    ElMessage.success('添加成功')
    addDialogVisible.value = false
    Object.assign(memberForm, { name: '', phone: '', gender: 'male', initialRecharge: 0 })
    fetchData()
  } catch (error) {
    console.error('添加会员失败:', error)
  }
}

function recharge(row) {
  selectedMember.value = row
  Object.assign(rechargeForm, { amount: 0, giftAmount: 0, paymentMethod: 'cash' })
  rechargeDialogVisible.value = true
}

async function confirmRecharge() {
  try {
    await api.post(`/members/${selectedMember.value.id}/recharge`, rechargeForm)
    ElMessage.success('充值成功')
    rechargeDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('充值失败:', error)
  }
}

async function viewDetail(row) {
  try {
    const response = await api.get(`/members/${row.id}`)
    ElMessage.info(`会员 ${response.data.member.name}，余额: ¥${response.data.member.balance}`)
  } catch (error) {
    console.error('获取会员详情失败:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}
</style>
