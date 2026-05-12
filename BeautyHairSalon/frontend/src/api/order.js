
import request from '@/utils/request'

export function getOrderPage(params) {
  return request({
    url: '/order/page',
    method: 'get',
    params
  })
}

export function getOrderById(id) {
  return request({
    url: `/order/${id}`,
    method: 'get'
  })
}

export function addOrder(data) {
  return request({
    url: '/order',
    method: 'post',
    data
  })
}

export function updateOrder(data) {
  return request({
    url: '/order',
    method: 'put',
    data
  })
}

export function updateOrderStatus(id, status) {
  return request({
    url: `/order/status/${id}/${status}`,
    method: 'put'
  })
}

export function deleteOrder(id) {
  return request({
    url: `/order/${id}`,
    method: 'delete'
  })
}

export function getOrderStatistics() {
  return request({
    url: '/order/statistics',
    method: 'get'
  })
}

export function getDailyReport(params) {
  return request({
    url: '/order/daily-report',
    method: 'get',
    params
  })
}
