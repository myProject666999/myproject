
import request from '@/utils/request'

export function getEmployeePage(params) {
  return request({
    url: '/employee/page',
    method: 'get',
    params
  })
}

export function getEmployeeById(id) {
  return request({
    url: `/employee/${id}`,
    method: 'get'
  })
}

export function getAllEmployees() {
  return request({
    url: '/employee/all',
    method: 'get'
  })
}

export function getTechnicians() {
  return request({
    url: '/employee/technicians',
    method: 'get'
  })
}

export function addEmployee(data) {
  return request({
    url: '/employee',
    method: 'post',
    data
  })
}

export function updateEmployee(data) {
  return request({
    url: '/employee',
    method: 'put',
    data
  })
}

export function deleteEmployee(id) {
  return request({
    url: `/employee/${id}`,
    method: 'delete'
  })
}
