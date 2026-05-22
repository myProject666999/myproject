import request from '../utils/request'

export function getRuleList() {
  return request({
    url: '/rule/list',
    method: 'get'
  })
}

export function getAllRules() {
  return request({
    url: '/rule/all',
    method: 'get'
  })
}

export function addRule(data) {
  return request({
    url: '/rule/add',
    method: 'post',
    data
  })
}

export function updateRule(data) {
  return request({
    url: '/rule/update',
    method: 'put',
    data
  })
}

export function deleteRule(id) {
  return request({
    url: `/rule/delete/${id}`,
    method: 'delete'
  })
}

export function getCategories() {
  return request({
    url: '/rule/categories',
    method: 'get'
  })
}
