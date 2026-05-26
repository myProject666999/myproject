<template>
  <div class="page-container">
    <el-page-header @back="$router.back()" :content="`发票 #${invoice?.invoice_number || ''}`" style="margin-bottom: 16px" />

    <el-card v-if="invoice" shadow="never">
      <el-descriptions title="发票基本信息" :column="2" border>
        <el-descriptions-item label="发票号码">{{ invoice.invoice_number }}</el-descriptions-item>
        <el-descriptions-item label="发票代码">{{ invoice.invoice_code || '-' }}</el-descriptions-item>
        <el-descriptions-item label="开票日期">{{ invoice.issued_date }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(invoice.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="PDF路径" :span="2">
          <el-link v-if="invoice.pdf_path" :href="invoice.pdf_path" type="primary" target="_blank">
            {{ invoice.pdf_path }}
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ invoice.remark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="抬头信息" :column="2" border style="margin-top: 20px">
        <el-descriptions-item label="抬头名称">{{ invoice.title?.name }}</el-descriptions-item>
        <el-descriptions-item label="税号">{{ invoice.title?.tax_number }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ invoice.title?.address || '-' }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ invoice.title?.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="银行账户" :span="2">{{ invoice.title?.bank_account || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions v-if="invoice.application" title="明细信息" :column="1" border style="margin-top: 20px">
        <el-descriptions-item label="明细列表">
          <el-table :data="invoice.application.items" border style="width: 100%">
            <el-table-column prop="product_name" label="商品/服务名称" min-width="180" />
            <el-table-column prop="specification" label="规格型号" width="120" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="quantity" label="数量" width="80" align="right" />
            <el-table-column prop="unit_price" label="单价" width="100" align="right">
              <template #default="{ row }">{{ formatMoney(row.unit_price) }}</template>
            </el-table-column>
            <el-table-column prop="tax_rate" label="税率" width="80" align="right">
              <template #default="{ row }">{{ (row.tax_rate * 100).toFixed(0) }}%</template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="120" align="right">
              <template #default="{ row }">{{ formatMoney(row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="tax_amount" label="税额" width="100" align="right">
              <template #default="{ row }">{{ formatMoney(row.tax_amount) }}</template>
            </el-table-column>
          </el-table>
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="金额汇总" :column="3" border style="margin-top: 20px">
        <el-descriptions-item label="不含税金额">
          <span style="color: #303133; font-weight: 600">¥{{ formatMoney(invoice.net_amount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="税额合计">
          <span style="color: #e6a23c; font-weight: 600">¥{{ formatMoney(invoice.tax_amount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="价税合计">
          <span style="color: #409eff; font-weight: 600">¥{{ formatMoney(invoice.total_amount) }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { invoiceApi } from '../api'

const route = useRoute()
const invoice = ref(null)

const loadData = async () => {
  try {
    const res = await invoiceApi.get(route.params.id)
    invoice.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const formatMoney = (v) => Number(v || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN', { hour12: false })
}

onMounted(loadData)
</script>

<style scoped>
.page-container {
  padding: 0;
}
</style>