import request from './request'

export function getContacts(userId) {
  return request({
    url: '/contacts',
    method: 'get',
    params: { userId }
  })
}

export function addContact(data) {
  return request({
    url: '/contacts',
    method: 'post',
    data
  })
}

export function updateContact(id, data) {
  return request({
    url: `/contacts/${id}`,
    method: 'put',
    data
  })
}

export function deleteContact(id) {
  return request({
    url: `/contacts/${id}`,
    method: 'delete'
  })
}

export function getUpcomingReminders(userId, days) {
  return request({
    url: '/reminders/upcoming',
    method: 'get',
    params: { userId, days }
  })
}

export function getYearlyBirthdayTable(userId, year) {
  return request({
    url: '/reminders/yearly',
    method: 'get',
    params: { userId, year }
  })
}

export function getGreetingCards(category) {
  return request({
    url: '/greeting-cards',
    method: 'get',
    params: { category }
  })
}
