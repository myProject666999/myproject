import request from './request'

export function getAddresses() {
  return request.get('/user/address')
}

export function getDefaultAddress() {
  return request.get('/user/address/default')
}

export function createAddress(data: any) {
  return request.post('/user/address', data)
}

export function updateAddress(data: any) {
  return request.put('/user/address', data)
}

export function deleteAddress(id: number) {
  return request.delete(`/user/address/${id}`)
}

export function setDefaultAddress(addressId: number) {
  return request.post('/user/address/set-default', { address_id: addressId })
}
