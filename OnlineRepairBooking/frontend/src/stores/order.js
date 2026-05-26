import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createOrder as createOrderApi, getOrderList, getOrderDetail, cancelOrder as cancelOrderApi } from '@/api/order'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)
  const total = ref(0)

  const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'))
  const processingOrders = computed(() => orders.value.filter(o => o.status === 'processing'))
  const completedOrders = computed(() => orders.value.filter(o => o.status === 'completed'))
  const cancelledOrders = computed(() => orders.value.filter(o => o.status === 'cancelled'))

  const fetchOrders = async (params = {}) => {
    loading.value = true
    try {
      const res = await getOrderList(params)
      orders.value = res.list || res.orders || []
      total.value = res.total || orders.value.length
      return res
    } finally {
      loading.value = false
    }
  }

  const fetchOrderDetail = async (id) => {
    loading.value = true
    try {
      const res = await getOrderDetail(id)
      currentOrder.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  const createOrder = async (orderData) => {
    loading.value = true
    try {
      const res = await createOrderApi(orderData)
      return res
    } finally {
      loading.value = false
    }
  }

  const cancelOrder = async (id, reason) => {
    const res = await cancelOrderApi(id, reason)
    const index = orders.value.findIndex(o => o.id === id)
    if (index !== -1) {
      orders.value[index].status = 'cancelled'
    }
    if (currentOrder.value?.id === id) {
      currentOrder.value.status = 'cancelled'
    }
    return res
  }

  const updateOrderStatus = (id, status) => {
    const index = orders.value.findIndex(o => o.id === id)
    if (index !== -1) {
      orders.value[index].status = status
    }
    if (currentOrder.value?.id === id) {
      currentOrder.value.status = status
    }
  }

  const clearCurrentOrder = () => {
    currentOrder.value = null
  }

  return {
    orders,
    currentOrder,
    loading,
    total,
    pendingOrders,
    processingOrders,
    completedOrders,
    cancelledOrders,
    fetchOrders,
    fetchOrderDetail,
    createOrder,
    cancelOrder,
    updateOrderStatus,
    clearCurrentOrder
  }
})
