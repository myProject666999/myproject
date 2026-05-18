import request from '@/utils/request'

export function getInboxItems(userId) {
    return request({
        url: `/inbox/user/${userId}`,
        method: 'get'
    })
}

export function createInboxItem(data) {
    return request({
        url: '/inbox',
        method: 'post',
        data
    })
}

export function updateInboxItem(id, data) {
    return request({
        url: `/inbox/${id}`,
        method: 'put',
        data
    })
}

export function processInboxItem(id) {
    return request({
        url: `/inbox/${id}/process`,
        method: 'put'
    })
}

export function deleteInboxItem(id) {
    return request({
        url: `/inbox/${id}`,
        method: 'delete'
    })
}

export function updateInboxSortOrder(itemIds) {
    return request({
        url: '/inbox/sort',
        method: 'put',
        data: { itemIds }
    })
}
