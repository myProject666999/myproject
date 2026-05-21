import request from './request'

export function getFoods(keyword, category) {
  return request({
    url: '/foods',
    method: 'get',
    params: { keyword, category }
  })
}

export function getFoodCategories() {
  return request({
    url: '/foods/categories',
    method: 'get'
  })
}

export function addFood(data) {
  return request({
    url: '/foods',
    method: 'post',
    data
  })
}

export function updateFood(data) {
  return request({
    url: '/foods',
    method: 'put',
    data
  })
}

export function deleteFood(id) {
  return request({
    url: `/foods/${id}`,
    method: 'delete'
  })
}
