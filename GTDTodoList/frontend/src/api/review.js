import request from '@/utils/request'

export function getReviews(userId) {
    return request({
        url: `/reviews/user/${userId}`,
        method: 'get'
    })
}

export function generateReview(userId) {
    return request({
        url: `/reviews/generate/${userId}`,
        method: 'get'
    })
}

export function saveReview(data) {
    return request({
        url: '/reviews',
        method: 'post',
        data
    })
}

export function deleteReview(id) {
    return request({
        url: `/reviews/${id}`,
        method: 'delete'
    })
}
