import request from '@/utils/request'

export function getTodayTasks(userId) {
    return request({
        url: `/tasks/user/${userId}/today`,
        method: 'get'
    })
}

export function getTasksByProject(userId, projectId) {
    return request({
        url: `/tasks/user/${userId}/project/${projectId}`,
        method: 'get'
    })
}

export function getActiveTasks(userId) {
    return request({
        url: `/tasks/user/${userId}`,
        method: 'get'
    })
}

export function createTask(data) {
    return request({
        url: '/tasks',
        method: 'post',
        data
    })
}

export function updateTask(id, data) {
    return request({
        url: `/tasks/${id}`,
        method: 'put',
        data
    })
}

export function toggleTaskComplete(id) {
    return request({
        url: `/tasks/${id}/toggle`,
        method: 'put'
    })
}

export function deleteTask(id) {
    return request({
        url: `/tasks/${id}`,
        method: 'delete'
    })
}

export function updateTaskSortOrder(taskIds) {
    return request({
        url: '/tasks/sort',
        method: 'put',
        data: { taskIds }
    })
}
