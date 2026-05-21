import request from '../utils/request'

export const login = (data) => {
  return request({
    url: '/users/login',
    method: 'post',
    data
  })
}

export const getRestaurants = () => {
  return request({
    url: '/restaurants',
    method: 'get'
  })
}

export const getRestaurantById = (id) => {
  return request({
    url: `/restaurants/${id}`,
    method: 'get'
  })
}

export const createRestaurant = (data) => {
  return request({
    url: '/restaurants',
    method: 'post',
    data
  })
}

export const searchRestaurants = (name) => {
  return request({
    url: `/restaurants/search?name=${name}`,
    method: 'get'
  })
}

export const getReviewsByRestaurant = (restaurantId) => {
  return request({
    url: `/reviews/restaurant/${restaurantId}`,
    method: 'get'
  })
}

export const getReviewsByUser = (userId) => {
  return request({
    url: `/reviews/user/${userId}`,
    method: 'get'
  })
}

export const getFriendsReviews = (userId) => {
  return request({
    url: `/reviews/friends/${userId}`,
    method: 'get'
  })
}

export const getReviewByUserAndRestaurant = (userId, restaurantId) => {
  return request({
    url: `/reviews/user/${userId}/restaurant/${restaurantId}`,
    method: 'get'
  })
}

export const createReview = (data) => {
  return request({
    url: '/reviews',
    method: 'post',
    data
  })
}

export const updateReview = (id, data) => {
  return request({
    url: `/reviews/${id}`,
    method: 'put',
    data
  })
}

export const deleteReview = (id) => {
  return request({
    url: `/reviews/${id}`,
    method: 'delete'
  })
}

export const getRecommendedDishesByRestaurant = (restaurantId) => {
  return request({
    url: `/reviews/restaurant/${restaurantId}/dishes`,
    method: 'get'
  })
}

export const getRecommendedDishesByReview = (reviewId) => {
  return request({
    url: `/reviews/${reviewId}/dishes`,
    method: 'get'
  })
}

export const getFriends = (userId) => {
  return request({
    url: `/friends/${userId}`,
    method: 'get'
  })
}
