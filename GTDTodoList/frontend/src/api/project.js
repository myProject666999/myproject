import request from '@/utils/request'

export function getProjects(userId) {
    return request({
        url: `/projects/user/${userId}`,
        method: 'get'
    })
}

export function createProject(data) {
    return request({
        url: '/projects',
        method: 'post',
        data
    })
}

export function updateProject(id, data) {
    return request({
        url: `/projects/${id}`,
        method: 'put',
        data
    })
}

export function deleteProject(id) {
    return request({
        url: `/projects/${id}`,
        method: 'delete'
    })
}
