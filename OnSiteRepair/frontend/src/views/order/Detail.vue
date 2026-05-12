<template>
  <div class="page-container">
    <van-nav-bar title="订单详情" left-text="返回" @click-left="onClickLeft" />
    
    <div v-if="order" class="order-detail">
      <van-cell-group inset>
        <van-cell title="订单状态" :value="getStatusText(order.status)" />
        <van-cell title="订单编号" :value="order.orderNo" />
        <van-cell title="维修类别" :value="order.category" />
        <van-cell title="故障类型" :value="order.faultType" />
        <van-cell title="故障描述" :value="order.faultDesc" />
      </van-cell-group>

      <van-cell-group inset title="联系信息">
        <van-cell title="联系人" :value="order.contactName" />
        <van-cell title="联系电话" :value="order.contactPhone" />
        <van-cell title="服务地址" :value="order.address" />
      </van-cell-group>

      <van-cell-group v-if="order.partsList" inset title="配件清单">
        <van-cell>
          <template #default>
            <pre style="white-space: pre-wrap; font-size: 14px;">{{ order.partsList }}</pre>
          </template>
        </van-cell>
        <van-cell title="配件费用" :value="'¥' + order.partsAmount" />
        <van-cell title="人工费用" :value="'¥' + order.laborAmount" />
        <van-cell title="总费用" :value="'¥' + order.totalAmount" />
      </van-cell-group>

      <van-cell-group v-if="order.negotiatedAmount" inset title="议价信息">
        <van-cell title="议价金额" :value="'¥' + order.negotiatedAmount" />
        <van-cell title="议价备注" :value="order.negotiatedNote" />
      </van-cell-group>

      <van-cell-group v-if="order.afterImages" inset title="维修后图片">
        <van-cell>
          <template #default>
            <van-image v-for="(img, idx) in order.afterImages.split(',')" :key="idx" :src="img" width="100" height="100" fit="cover" />
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group v-if="order.warrantyMonths" inset title="保修信息">
        <van-cell title="保修期限" :value="order.warrantyMonths + '个月'" />
        <van-cell title="开始时间" :value="order.warrantyStartTime" />
        <van-cell title="结束时间" :value="order.warrantyEndTime" />
      </van-cell-group>

      <van-cell-group inset title="订单时间">
        <van-cell title="创建时间" :value="order.createTime" />
        <van-cell v-if="order.acceptTime" title="接单时间" :value="order.acceptTime" />
        <van-cell v-if="order.startTime" title="开始时间" :value="order.startTime" />
        <van-cell v-if="order.finishTime" title="完成时间" :value="order.finishTime" />
        <van-cell v-if="order.payTime" title="支付时间" :value="order.payTime" />
      </van-cell-group>
    </div>

    <van-action-sheet v-model:show="showPartsSheet" title="添加配件清单" :actions="[]" cancel-text="取消">
      <div class="parts-form">
        <van-field
          v-model="partsForm.partsList"
          type="textarea"
          label="配件清单"
          placeholder="请输入配件清单，如：滤芯 x1 ¥50"
          autosize
        />
        <van-field
          v-model="partsForm.partsAmount"
          type="number"
          label="配件费用"
          placeholder="请输入配件总费用"
        />
        <van-field
          v-model="partsForm.laborAmount"
          type="number"
          label="人工费用"
          placeholder="请输入人工费用"
        />
        <van-button block type="primary" @click="submitParts">提交</van-button>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getOrderDetail, addPartsList, completeOrder } from '@/api/order'

const router = useRouter()
const route = useRoute()

const order = ref(null)
const showPartsSheet = ref(false)
const partsForm = ref({
  partsList: '',
  partsAmount: '',
  laborAmount: ''
})

const statusMap = {
  0: '待接单',
  1: '已接单',
  2: '服务中',
  3: '待确认',
  4: '待支付',
  5: '已完成',
  6: '已取消',
  7: '已关闭'
}

const getStatusText = (status) => statusMap[status] || '未知'

const onClickLeft = () => {
  router.back()
}

const loadDetail = async () => {
  try {
    const data = await getOrderDetail(route.params.id)
    order.value = data
  } catch (e) {
    console.error(e)
  }
}

const submitParts = async () => {
  try {
    if (!partsForm.value.partsList || !partsForm.value.partsAmount || !partsForm.value.laborAmount) {
      showToast('请填写完整信息')
      return
    }
    await addPartsList(route.params.id, {
      partsList: partsForm.value.partsList,
      partsAmount: partsForm.value.partsAmount,
      laborAmount: partsForm.value.laborAmount
    })
    showToast('提交成功')
    showPartsSheet.value = false
    loadDetail()
  } catch (e) {
    console.error(e)
  }
}

watch(() => route.query.showParts, (val) => {
  if (val === 'true') {
    showPartsSheet.value = true
  }
}, { immediate: true })

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.order-detail {
  padding-bottom: 20px;
}

.parts-form {
  padding: 20px;
}
</style>
