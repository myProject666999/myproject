import request from './request'

export const getQuizQuestions = (courseId) =>
  request.get(`/courses/${courseId}/quiz/questions`)

export const submitQuiz = (data) =>
  request.post('/quiz/submit', data)

export const getQuizScore = (courseId) =>
  request.get(`/courses/${courseId}/quiz/score`)

export const getMyScores = () =>
  request.get('/quiz/scores')
