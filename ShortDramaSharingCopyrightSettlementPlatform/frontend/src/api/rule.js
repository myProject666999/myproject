import request from '@/utils/request'

export function getRuleList(params) {
  return request({
    url: '/rules',
    method: 'get',
    params
  })
}

export function getRuleDetail(id) {
  return request({
    url: `/rules/${id}`,
    method: 'get'
  })
}

export function createRule(data) {
  return request({
    url: '/rules',
    method: 'post',
    data
  })
}

export function updateRule(id, data) {
  return request({
    url: `/rules/${id}`,
    method: 'put',
    data
  })
}

export function deleteRule(id) {
  return request({
    url: `/rules/${id}`,
    method: 'delete'
  })
}

export function bindRuleToDrama(data) {
  return request({
    url: '/rules/bind',
    method: 'post',
    data
  })
}

export function getDramaRules(dramaId) {
  return request({
    url: `/rules/drama/${dramaId}`,
    method: 'get'
  })
}

export function unbindRuleFromDrama(dramaId, ruleId) {
  return request({
    url: `/rules/drama/${dramaId}/${ruleId}`,
    method: 'delete'
  })
}
