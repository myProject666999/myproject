<template>
  <div class="page-container">
    <van-nav-bar title="我的订单" fixed placeholder />

    <van-tabs v-model:active="activeTab" sticky offset-top="46">
      <van-tab title="全部" name="">
        <div class="order-list">
          <order-card
            v-for="order in filteredOrders('')"
            :key="order.id"
            :order="order"
            @click="goDetail(order.id)"
          />
          <van-empty v-if="filteredOrders('').length === 0" description="暂无订单" />
        </div>
      </van-tab>
      <van-tab title="待接单" name="PENDING">
        <div class="order-list">
          <order-card
            v-for="order in filteredOrders('PENDING')"
            :key="order.id"
            :order="order"
            @click="goDetail(order.id)"
          />
          <van-empty v-if="filteredOrders('PENDING').length === 0" description="暂无待接单订单" />
        </div>
      </van-tab>
      <van-tab title="进行中" name="ACCEPTED">
        <div class="order-list">
          <order-card
            v-for="order in filteredOrders('ACCEPTED')"
            :key="order.id"
            :order="order"
            @click="goDetail(order.id)"
          />
          <van-empty v-if="filteredOrders('ACCEPTED').length === 0" description="暂无进行中订单" />
        </div>
      </van-tab>
      <van-tab title="已完成" name="COMPLETED">
        <div class="order-list">
          <order-card
            v-for="order in filteredOrders('COMPLETED')"
            :key="order.id"
            :order="order"
            @click="goDetail(order.id)"
          />
          <van-empty v-if="filteredOrders('COMPLETED').length === 0" description="暂无已完成订单" />
        </div>
      </van-tab>
    </van-tabs>

    <van-tabbar v-model="tabbarActive" route fixed>
      <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/category" icon="apps-o">品类</van-tabbar-item>
      <van-tabbar-item to="/orders" icon="todo-list-o">订单</van-tabbar-item>
      <van-tabbar-item to="/wallet" icon="wallet-o">钱包</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { orderApi, categoryApi } from '@/api'

const router = useRouter()
const activeTab = ref('')
const tabbarActive = ref(2)
const orders = ref([])
const categoryMap = ref({})

const statusMap = {
  PENDING: { text: '待接单', color: '#ff976a' },
  ACCEPTED: { text: '已接单', color: '#07c160' },
  ONWAY: { text: '上门中', color: '#1989fa' },
  NEGOTIATING: { text: '议价中', color: '#ff6034' },
  COMPLETED: { text: '已完成', color: '#969799' },
  CANCELLED: { text: '已取消', color: '#969799' }
}

const OrderCard = defineComponent({
  props: ['order'],
  emits: ['click'],
  setup(props, { emit }) {
    const statusInfo = statusMap[props.order.status] || { text: props.order.status, color: '#969799' }
    
    return () => h('div', {
      class: 'order-card',
      onClick: () => emit('click')
    }, [
      h('div', { class: 'order-header' }, [
        h('span', { class: 'order-no' }, `订单号: ${props.order.orderNo}`),
        h('span', { style: { color: statusInfo.color } }, statusInfo.text)
      ]),
      h('div', { class: 'order-body' }, [
        h('div', { class: 'order-info' }, [
          h('div', { class: 'info-row' }, [
            h('span', { class: 'label' }, '品类：'),
            h('span', categoryMap.value[props.order.categoryId]?.name || '未知')
          ]),
          h('div', { class: 'info-row' }, [
            h('span', { class: 'label' }, '预估价格：'),
            h('span', { class: 'price' }, `¥${props.order.estimatedPrice}`)
          ]),
          props.order.finalPrice && h('div', { class: 'info-row' }, [
            h('span', { class: 'label' }, '最终价格：'),
            h('span', { class: 'price final' }, `¥${props.order.finalPrice}`)
          ])
        ])
      ])
    ])
  }
})

const loadOrders = async () => {
  try {
    const res = await orderApi.list()
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
  if (!status) return orders.value
  return orders.value.filter(o => o.status === status)
}

const goDetail = (id) => {
  router.push(`/order-detail/${id}`)
}

onMounted(() => {
  loadOrders()
})
</script>

<style lang="less" scoped>
.order-list {
  padding: 12px 12px 80px;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebedf0;
    margin-bottom: 12px;
    
    .order-no {
      font-size: 12px;
      color: #969799;
    }
  }
  
  .order-body {
    .info-row {
      display: flex;
      margin-bottom: 8px;
      font-size: 14px;
      
      .label {
        color: #969799;
        min-width: 70px;
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
</style>
