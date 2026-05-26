import request from '@/utils/request'

export function getCertificateList() {
  return request({
    url: '/certificate',
    method: 'get'
  })
}

export function getCertificateById(id) {
  return request({
    url: `/certificate/${id}`,
    method: 'get'
  })
}

export function getCertificateByNo(certificateNo) {
  return request({
    url: `/certificate/no/${certificateNo}`,
    method: 'get'
  })
}

export function verifyCertificate(verifyCode) {
  return request({
    url: '/certificate/verify',
    method: 'get',
    params: { verifyCode }
  })
}

export function getCertificatesByTraining(trainingId) {
  return request({
    url: `/certificate/training/${trainingId}`,
    method: 'get'
  })
}

export function getCertificatesByStudent(studentId) {
  return request({
    url: `/certificate/student/${studentId}`,
    method: 'get'
  })
}

export function createCertificate(data) {
  return request({
    url: '/certificate',
    method: 'post',
    data
  })
}

export function updateCertificate(data) {
  return request({
    url: '/certificate',
    method: 'put',
    data
  })
}

export function revokeCertificate(id, reason) {
  return request({
    url: `/certificate/${id}/revoke`,
    method: 'post',
    params: { reason }
  })
}

export function deleteCertificate(id) {
  return request({
    url: `/certificate/${id}`,
    method: 'delete'
  })
}
