import request from '@/utils/request'

export function getBillPage(params) {
  return request({
    url: '/rent-bill/page',
    method: 'get',
    params
  })
}

export function getBillDetail(id) {
  return request({
    url: `/rent-bill/${id}`,
    method: 'get'
  })
}

export function payBill(data) {
  return request({
    url: '/rent-bill/pay',
    method: 'post',
    data
  })
}

export function generateMonthlyBills() {
  return request({
    url: '/rent-bill/generate-monthly',
    method: 'post'
  })
}

export function generateBillForContract(contractId, billMonth) {
  return request({
    url: `/rent-bill/generate/${contractId}`,
    method: 'post',
    params: { billMonth }
  })
}

export function sendPaymentReminder(id) {
  return request({
    url: `/rent-bill/${id}/reminder`,
    method: 'post'
  })
}
