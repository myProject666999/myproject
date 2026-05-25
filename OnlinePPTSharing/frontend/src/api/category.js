import request from '../utils/request'

export const categoryApi = {
  getList: () => request.get('/categories'),

  getHotCategories: () => request.get('/categories/hot')
}
