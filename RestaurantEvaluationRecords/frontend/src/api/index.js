import request from '@/utils/request'

export const login = (data) => {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export const getCurrentUser = () => {
  return request({
    url: '/user/current',
    method: 'get'
  })
}

export const getRestaurantList = () => {
  return request({
    url: '/restaurant/list',
    method: 'get'
  })
}

export const getRestaurantDetail = (id) => {
  return request({
    url: `/restaurant/detail/${id}`,
    method: 'get'
  })
}

export const addRestaurant = (data) => {
  return request({
    url: '/restaurant/add',
    method: 'post',
    data
  })
}

export const updateRestaurant = (id, data) => {
  return request({
    url: `/restaurant/update/${id}`,
    method: 'put',
    data
  })
}

export const deleteRestaurant = (id) => {
  return request({
    url: `/restaurant/delete/${id}`,
    method: 'delete'
  })
}

export const getReviewsByRestaurant = (restaurantId) => {
  return request({
    url: `/review/restaurant/${restaurantId}`,
    method: 'get'
  })
}

export const getMyReviews = () => {
  return request({
    url: '/review/my',
    method: 'get'
  })
}

export const getFriendReviews = () => {
  return request({
    url: '/review/friend',
    method: 'get'
  })
}

export const addReview = (data) => {
  return request({
    url: '/review/add',
    method: 'post',
    data
  })
}

export const updateReview = (id, data) => {
  return request({
    url: `/review/update/${id}`,
    method: 'put',
    data
  })
}

export const deleteReview = (id) => {
  return request({
    url: `/review/delete/${id}`,
    method: 'delete'
  })
}

export const getDishesByRestaurant = (restaurantId) => {
  return request({
    url: `/dish/restaurant/${restaurantId}`,
    method: 'get'
  })
}

export const addRecommendedDish = (data) => {
  return request({
    url: '/dish/add',
    method: 'post',
    data
  })
}

export const getFriendList = () => {
  return request({
    url: '/friend/list',
    method: 'get'
  })
}
