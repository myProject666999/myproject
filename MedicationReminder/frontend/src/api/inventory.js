import request from '@/utils/request'

export function getInventories() {
  return request({
    url: '/inventories',
    method: 'get'
  })
}

export function getInventoriesByUser(userId) {
  return request({
    url: `/inventories/user/${userId}`,
    method: 'get'
  })
}

export function getLowStockByUser(userId) {
  return request({
    url: `/inventories/low-stock/${userId}`,
    method: 'get'
  })
}

export function getInventoryById(id) {
  return request({
    url: `/inventories/${id}`,
    method: 'get'
  })
}

export function createInventory(data) {
  return request({
    url: '/inventories',
    method: 'post',
    data
  })
}

export function updateInventory(data) {
  return request({
    url: '/inventories',
    method: 'put',
    data
  })
}

export function deleteInventory(id) {
  return request({
    url: `/inventories/${id}`,
    method: 'delete'
  })
}
