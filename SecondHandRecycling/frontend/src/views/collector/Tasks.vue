<template>
  <div class="page-container">
    <van-nav-bar title="我的任务" left-arrow @click-left="router.back()" fixed placeholder />

    <van-tabs v-model:active="activeTab" sticky offset-top="46">
      <van-tab title="待接单" name="PENDING">
        <div class="task-list">
          <task-card
            v-for="order in filteredOrders('PENDING')"
            :key="order.id"
            :order="order"
            type="pending"
            @accept="acceptOrder"
          />
          <van-empty v-if="filteredOrders('PENDING').length === 0" description="暂无待接任务" />
        </div>
      </van-tab>
      <van-tab title="进行中" name="ACCEPTED">
        <div class="task-list">
          <task-card
            v-for="order in filteredOrders('ACCEPTED')"
            :key="order.id"
            :order="order"
            type="accepted"
            @complete="showComplete(order.id)"
            @negotiate="showNegotiate(order.id)"
          />
          <van-empty v-if="filteredOrders('ACCEPTED').length === 0" description="暂无进行中任务" />
        </div>
      </van-tab>
      <van-tab title="已完成" name="COMPLETED">
        <div class="task-list">
          <task-card
            v-for="order in filteredOrders('COMPLETED')"
            :key="order.id"
            :order="order"
            type="completed"
          />
          <van-empty v-if="filteredOrders('COMPLETED').length === 0" description="暂无已完成任务" />
        </div>
      </van-tab>
    </van-tabs>

    <van-popup v-model:show="showNegotiatePopup" position="bottom" round>
      <div class="action-dialog">
        <div class="dialog-title">现场议价</div>
        <van-field
          v-model="negotiatePrice"
          type="number"
          label="最终价格"
          placeholder="请输入最终价格"
          prefix="¥"
        />
        <div class="dialog-actions">
          <van-button plain block @click="showNegotiatePopup = false">取消</van-button>
          <van-button type="primary" block @click="doNegotiate">确认</van-button>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showCompletePopup" position="bottom" round>
      <div class="action-dialog">
        <div class="dialog-title">完成订单</div>
        <van-field
          v-model="completePrice"
          type="number"
          label="结算价格"
          placeholder="请输入结算价格"
          prefix="¥"
        />
        <div class="dialog-tip">此金额将自动转入用户钱包</div>
        <div class="dialog-actions">
          <van-button plain block @click="showCompletePopup = false">取消</van-button>
          <van-button type="primary" block @click="doComplete">确认完成</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, defineComponent, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { collectorApi, categoryApi } from '@/api'

const route = useRoute()
const router = useRouter()

const activeTab = ref(route.query.status || 'PENDING')
const orders = ref([])
const categoryMap = ref({})
const showNegotiatePopup = ref(false)
const showCompletePopup = ref(false)
const currentOrderId = ref(null)
const negotiatePrice = ref('')
const completePrice = ref('')

const TaskCard = defineComponent({
  props: ['order', 'type'],
  emits: ['accept', 'complete', 'negotiate'],
  setup(props, { emit }) {
    const categoryName = categoryMap.value[props.order.categoryId]?.name || '未知品类'
    
    const actions = []
    if (props.type === 'pending') {
      actions.push(h('van-button', {
        type: 'primary',
        size: 'small',
        block: true,
        onClick: () => emit('accept', props.order.id)
      }, '立即接单'))
    }
    if (props.type === 'accepted') {
      actions.push(h('div', { style: { display: 'flex', gap: '8px', marginTop: '12px' } }, [
        h('van-button', {
          type: 'warning',
          size: 'small',
          style: { flex: 1 },
          onClick: () => emit('negotiate')
        }, '现场议价'),
        h('van-button', {
          type: 'primary',
          size: 'small',
          style: { flex: 1 },
          onClick: () => emit('complete')
        }, '完成订单')
      ]))
    }
    
    return () => h('div', { class: 'task-card' }, [
      h('div', { class: 'task-header' }, [
        h('span', { class: 'order-no' }, props.order.orderNo),
        h('span', {
          style: {
            color: props.type === 'pending' ? '#ff976a' : props.type === 'accepted' ? '#07c160' : '#969799'
          }
        }, props.type === 'pending' ? '待接单' : props.type === 'accepted' ? '进行中' : '已完成')
      ]),
      h('div', { class: 'task-body' }, [
        h('div', { class: 'info-row' }, [
          h('span', { class: 'label' }, '品类：'),
          h('span', categoryName)
        ]),
        h('div', { class: 'info-row' }, [
          h('span', { class: 'label' }, '预估：'),
          h('span', { class: 'price' }, `¥${props.order.estimatedPrice}`)
        ]),
        props.order.finalPrice && h('div', { class: 'info-row' }, [
          h('span', { class: 'label' }, '议价：'),
          h('span', { class: 'price final' }, `¥${props.order.finalPrice}`)
        ]),
        h('div', { class: 'info-row' }, [
          h('span', { class: 'label' }, '时间：'),
          h('span', props.order.appointmentTime)
        ])
      ]),
      ...actions
    ])
  }
})

const loadOrders = async () => {
  try {
    const res = await collectorApi.orders()
    orders.value = res.data || []
    
    const categoryIds = [...new Set(orders.value.map(o => o.categoryId))]
    for (const id of categoryIds) {
      if (!categoryMap.value[id]) {
        try {
          const catRes = await categoryApi.getById(id)
          categoryMap.value[id] = catRes.data
        } catch {}
      }
    }
  } catch (e) {
    showToast('加载失败')
  }
}

const filteredOrders = (status) => {
  return orders.value.filter(o => o.status === status)
}

const acceptOrder = async (id) => {
  try {
    await showConfirmDialog({ title: '提示', message: '确定要接此订单吗？' })
    await collectorApi.accept(id)
    showToast('接单成功')
    loadOrders()
  } catch {}
}

const showNegotiate = (id) => {
  currentOrderId.value = id
  negotiatePrice.value = ''
  showNegotiatePopup.value = true
}

const doNegotiate = async () => {
  if (!negotiatePrice.value || Number(negotiatePrice.value) <= 0) {
    showToast('请输入有效价格')
    return
  }
  try {
    await collectorApi.negotiate(currentOrderId.value, Number(negotiatePrice.value))
    showToast('议价成功')
    showNegotiatePopup.value = false
    loadOrders()
  } catch {}
}

const showComplete = (id) => {
  currentOrderId.value = id
  completePrice.value = ''
  showCompletePopup.value = true
}

const doComplete = async () => {
  if (!completePrice.value || Number(completePrice.value) <= 0) {
    showToast('请输入有效价格')
    return
  }
  try {
    await showConfirmDialog({ title: '提示', message: '确认完成此订单？金额将自动转入用户钱包。' })
    await collectorApi.complete(currentOrderId.value, Number(completePrice.value))
    showToast('订单已完成')
    showCompletePopup.value = false
    loadOrders()
  } catch {}
}

onMounted(() => {
  loadOrders()
})
</script>

<style lang="less" scoped>
.task-list {
  padding: 12px 12px 30px;
}

.task-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebedf0;
    margin-bottom: 12px;
    
    .order-no {
      font-size: 13px;
      color: #969799;
    }
  }
  
  .task-body {
    .info-row {
      display: flex;
      margin-bottom: 8px;
      font-size: 14px;
      
      .label {
        color: #969799;
        min-width: 50px;
      }
      
      .price {
        color: #07c160;
        font-weight: 600;
        
        &.final {
          color: #ff6034;
        }
      }
    }
  }
}

.action-dialog {
  padding: 20px;
  
  .dialog-title {
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  
  .dialog-tip {
    text-align: center;
    color: #969799;
    font-size: 13px;
    margin: 12px 0;
  }
  
  .dialog-actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
  }
}
</style>
