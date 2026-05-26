<template>
  <div class="page-container">
    <el-card shadow="never">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="选择抬头" prop="title_id">
              <el-select
                v-model="form.title_id"
                filterable
                placeholder="请选择抬头"
                style="width: 100%"
                @change="onTitleChange"
              >
                <el-option
                  v-for="t in titles"
                  :key="t.id"
                  :label="t.name + ' (' + t.tax_number + ')'"
                  :value="t.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请人" prop="applicant">
              <el-input v-model="form.applicant" placeholder="请输入申请人姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="抬头信息" v-if="selectedTitle">
          <div class="title-info">
            <div><strong>名称：</strong>{{ selectedTitle.name }}</div>
            <div><strong>税号：</strong>{{ selectedTitle.tax_number }}</div>
            <div v-if="selectedTitle.address"><strong>地址：</strong>{{ selectedTitle.address }}</div>
            <div v-if="selectedTitle.phone"><strong>电话：</strong>{{ selectedTitle.phone }}</div>
            <div v-if="selectedTitle.bank_account"><strong>银行账户：</strong>{{ selectedTitle.bank_account }}</div>
          </div>
        </el-form-item>

        <el-divider content-position="left">明细信息</el-divider>

        <el-table :data="form.items" border style="width: 100%">
          <el-table-column label="商品/服务名称" min-width="200">
            <template #default="{ row }">
              <el-input v-model="row.product_name" placeholder="请输入名称" />
            </template>
          </el-table-column>
          <el-table-column label="规格型号" width="150">
            <template #default="{ row }">
              <el-input v-model="row.specification" placeholder="规格" />
            </template>
          </el-table-column>
          <el-table-column label="单位" width="100">
            <template #default="{ row }">
              <el-input v-model="row.unit" placeholder="单位" />
            </template>
          </el-table-column>
          <el-table-column label="数量" width="130">
            <template #default="{ row }">
              <el-input-number v-model="row.quantity" :min="0.0001" :precision="4" @change="calcItem(row)" />
            </template>
          </el-table-column>
          <el-table-column label="单价(不含税)" width="160">
            <template #default="{ row }">
              <el-input-number v-model="row.unit_price" :min="0" :precision="4" @change="calcItem(row)" />
            </template>
          </el-table-column>
          <el-table-column label="税率" width="140">
            <template #default="{ row }">
              <el-select v-model="row.tax_rate" @change="calcItem(row)">
                <el-option label="13%" :value="0.13" />
                <el-option label="9%" :value="0.09" />
                <el-option label="6%" :value="0.06" />
                <el-option label="3%" :value="0.03" />
                <el-option label="1%" :value="0.01" />
                <el-option label="0%(免税)" :value="0" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="金额(不含税)" width="140" align="right">
            <template #default="{ row }">{{ formatMoney(row.amount) }}</template>
          </el-table-column>
          <el-table-column label="税额" width="120" align="right">
            <template #default="{ row }">{{ formatMoney(row.tax_amount) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ $index }">
              <el-button type="danger" link :icon="Delete" @click="removeItem($index)" :disabled="form.items.length <= 1" />
            </template>
          </el-table-column>
        </el-table>

        <div style="margin-top: 16px">
          <el-button type="primary" :icon="Plus" @click="addItem">添加明细</el-button>
        </div>

        <el-divider content-position="left">金额汇总</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-card shadow="never" class="amount-card">
              <div class="amount-label">不含税金额</div>
              <div class="amount-value">¥{{ formatMoney(netAmount) }}</div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="never" class="amount-card tax">
              <div class="amount-label">税额合计</div>
              <div class="amount-value">¥{{ formatMoney(taxAmount) }}</div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="never" class="amount-card total">
              <div class="amount-label">价税合计</div>
              <div class="amount-value">¥{{ formatMoney(totalAmount) }}</div>
            </el-card>
          </el-col>
        </el-row>

        <el-form-item label="备注" style="margin-top: 20px">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息(可选)" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" @click="submit">提交申请</el-button>
          <el-button size="large" @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { applicationApi, titleApi } from '../api'

const router = useRouter()
const formRef = ref(null)
const titles = ref([])
const selectedTitle = ref(null)

const form = ref({
  title_id: null,
  applicant: '',
  remark: '',
  items: [createItem()]
})

const rules = {
  title_id: [{ required: true, message: '请选择抬头', trigger: 'change' }]
}

function createItem() {
  return {
    product_name: '',
    specification: '',
    unit: '',
    quantity: 1,
    unit_price: 0,
    amount: 0,
    tax_rate: 0.13,
    tax_amount: 0
  }
}

const addItem = () => {
  form.value.items.push(createItem())
}

const removeItem = (index) => {
  form.value.items.splice(index, 1)
}

const calcItem = (item) => {
  item.amount = roundTo2(item.quantity * item.unit_price)
  item.tax_amount = roundTo2(item.amount * item.tax_rate)
}

const netAmount = computed(() => roundTo2(form.value.items.reduce((s, i) => s + (i.amount || 0), 0)))
const taxAmount = computed(() => roundTo2(form.value.items.reduce((s, i) => s + (i.tax_amount || 0), 0)))
const totalAmount = computed(() => roundTo2(netAmount.value + taxAmount.value))

const roundTo2 = (v) => Math.round(v * 100) / 100

const onTitleChange = async (id) => {
  if (id) {
    const res = await titleApi.get(id)
    selectedTitle.value = res.data
  } else {
    selectedTitle.value = null
  }
}

const submit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const emptyItem = form.value.items.find(i => !i.product_name || i.product_name.trim() === '')
      if (emptyItem) {
        ElMessage.warning('请填写所有明细的商品/服务名称')
        return
      }
      try {
        const payload = {
          title_id: form.value.title_id,
          applicant: form.value.applicant,
          remark: form.value.remark,
          items: form.value.items
        }
        await applicationApi.create(payload)
        ElMessage.success('申请提交成功')
        router.push('/applications')
      } catch (e) {
        console.error(e)
      }
    }
  })
}

const formatMoney = (v) => Number(v || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

onMounted(async () => {
  try {
    const res = await titleApi.list()
    titles.value = res.data
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.page-container {
  padding: 0;
}

.title-info {
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 4px;
  line-height: 2;
  color: #606266;
}

.amount-card {
  text-align: center;
  border: 1px solid #e4e7ed;
}

.amount-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.amount-card.tax .amount-value {
  color: #e6a23c;
}

.amount-card.total .amount-value {
  color: #409eff;
}
</style>