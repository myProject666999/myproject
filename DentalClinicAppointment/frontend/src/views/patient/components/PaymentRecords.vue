<template>
  <div class="records-table">
    <el-table :data="data" border stripe v-loading="loading">
      <el-table-column prop="paymentNo" label="缴费单号" width="150" />
      <el-table-column label="金额" width="120">
        <template #default="scope">
          ¥{{ scope.row.amount || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="支付方式" width="100">
        <template #default="scope">
          {{ getPaymentMethodText(scope.row.paymentMethod) }}
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" show-overflow-tooltip />
      <el-table-column prop="createTime" label="支付时间" width="170" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getPatientPayments } from '../../../api'

const props = defineProps({
  patientId: {
    type: Number,
    required: true
  }
})

const loading = ref(false)
const data = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPatientPayments(props.patientId)
    data.value = res.data || []
  } finally {
    loading.value = false
  }
}

const getPaymentMethodText = (method) => {
  const map = {
    CASH: '现金',
    CARD: '刷卡',
    WECHAT: '微信',
    ALIPAY: '支付宝'
  }
  return map[method] || method
}

watch(() => props.patientId, () => loadData())

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.records-table {
  margin-top: 15px;
}
</style>
