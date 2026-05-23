import request from './request'

export const getCourseList = (params) =>
  request.get('/courses', { params })

export const getHotCourses = () =>
  request.get('/courses/hot')

export const getCourseDetail = (id) =>
  request.get(`/courses/${id}`)

export const createCourse = (data) =>
  request.post('/courses', data)

export const updateCourse = (id, data) =>
  request.put(`/courses/${id}`, data)

export const deleteCourse = (id) =>
  request.delete(`/courses/${id}`)

export const getCourseReviews = (id, params) =>
  request.get(`/courses/${id}/reviews`, { params })

export const createReview = (data) =>
  request.post('/reviews', data)

export const getTeacherCourses = (params) =>
  request.get('/teacher/courses', { params })

export const publishCourse = (id) =>
  request.put(`/courses/${id}/publish`)

export const offlineCourse = (id) =>
  request.put(`/courses/${id}/offline`)

export const enrollCourse = (id) =>
  request.post(`/courses/${id}/enroll`)

export const reportProgress = (data) =>
  request.post('/progress/report', data)

export const getCourseProgress = (courseId) =>
  request.get(`/progress/course/${courseId}`)

export const getLessonProgress = (lessonId) =>
  request.get(`/progress/lesson/${lessonId}`)

export const createNote = (data) =>
  request.post('/notes', data)

export const getMyNotes = (courseId, params) =>
  request.get(`/notes/course/${courseId}`, { params })
