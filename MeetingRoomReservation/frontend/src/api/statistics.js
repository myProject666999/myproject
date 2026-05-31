import request from './request'

export function getRoomUsage(startDate, endDate) {
    return request.get('/statistics/room-usage', {
        params: { startDate, endDate }
    })
}

export function getOverview(startDate, endDate) {
    return request.get('/statistics/overview', {
        params: { startDate, endDate }
    })
}

export function getTrend(startDate, endDate) {
    return request.get('/statistics/trend', {
        params: { startDate, endDate }
    })
}
