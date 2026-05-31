import request from './request'

export function createReservation(data) {
    return request.post('/reservations', data)
}

export function cancelReservation(data) {
    return request.post('/reservations/cancel', data)
}

export function getMyReservations() {
    return request.get('/reservations/my')
}

export function getRoomReservations(roomId) {
    return request.get(`/reservations/room/${roomId}`)
}

export function getReservationPage(params) {
    return request.get('/reservations/page', { params })
}

export function checkAvailability(params) {
    return request.get('/reservations/check', { params })
}
