import request from './request'

export function getRoomList() {
    return request.get('/rooms/list')
}

export function getRoomDetail(id) {
    return request.get(`/rooms/${id}`)
}

export function addRoom(data) {
    return request.post('/rooms', data)
}

export function updateRoom(data) {
    return request.put('/rooms', data)
}

export function deleteRoom(id) {
    return request.delete(`/rooms/${id}`)
}
