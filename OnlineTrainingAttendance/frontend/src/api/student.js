import request from '@/utils/request'

export function getStudentList() {
  return request({
    url: '/student',
    method: 'get'
  })
}

export function getStudentById(id) {
  return request({
    url: `/student/${id}`,
    method: 'get'
  })
}

export function createStudent(data) {
  return request({
    url: '/student',
    method: 'post',
    data
  })
}

export function updateStudent(data) {
  return request({
    url: '/student',
    method: 'put',
    data
  })
}

export function deleteStudent(id) {
  return request({
    url: `/student/${id}`,
    method: 'delete'
  })
}

export function batchImportStudents(data) {
  return request({
    url: '/student/batch-import',
    method: 'post',
    data
  })
}
