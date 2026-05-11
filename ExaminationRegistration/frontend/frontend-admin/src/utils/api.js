import request from './request'

export const login = (data) => request.post('/admin/login', data)

export const getUsers = (params) => request.get('/admin/users', { params }).then(res => ({
  ...res,
  data: {
    items: res.data?.list || res.data?.items || [],
    total: res.data?.total || 0,
    page: res.data?.page || 1,
    page_size: res.data?.page_size || 10
  }
}))
export const deleteUser = (id) => request.delete(`/admin/users/${id}`)
export const batchDeleteUsers = (ids) => request.post('/admin/users/batch-delete', { ids })

export const getSchoolIntros = (params) => request.get('/admin/school-intros', { params }).then(res => ({
  ...res,
  data: {
    items: (res.data?.list || res.data?.items || []).map(item => ({
      ...item,
      summary: item.summary || item.content?.substring(0, 100) + '...' || '',
      likes: item.like_count || item.likes || 0,
      dislikes: item.dislike_count || item.dislikes || 0,
      views: item.view_count || item.views || 0
    })),
    total: res.data?.total || 0
  }
}))
export const createSchoolIntro = (data) => request.post('/admin/school-intros', {
  title: data.title,
  content: data.content,
  summary: data.summary,
  image: data.image,
  status: data.status ?? 1
})
export const updateSchoolIntro = (id, data) => request.put(`/admin/school-intros/${id}`, {
  title: data.title,
  content: data.content,
  summary: data.summary,
  image: data.image,
  status: data.status ?? 1
})
export const deleteSchoolIntro = (id) => request.delete(`/admin/school-intros/${id}`)

export const getEnrollmentProjects = (params) => request.get('/admin/enrollment-projects', { params }).then(res => ({
  ...res,
  data: {
    items: (res.data?.list || res.data?.items || []).map(item => ({
      ...item,
      exam_duration: item.duration || item.exam_duration || 60
    })),
    total: res.data?.total || 0
  }
}))
export const createEnrollmentProject = (data) => request.post('/admin/enrollment-projects', data)
export const updateEnrollmentProject = (id, data) => request.put(`/admin/enrollment-projects/${id}`, data)
export const deleteEnrollmentProject = (id) => request.delete(`/admin/enrollment-projects/${id}`)

export const getExamPapers = (params) => request.get('/admin/exam-papers', { params }).then(res => ({
  ...res,
  data: {
    items: (res.data?.list || res.data?.items || []).map(item => ({
      ...item,
      name: item.name || item.title || '',
      question_count: item.question_count || 0
    })),
    total: res.data?.total || 0
  }
}))
export const createExamPaper = (data) => request.post('/admin/exam-papers', {
  title: data.name || data.title,
  description: data.description,
  total_score: data.total_score,
  duration: data.duration,
  pass_score: data.pass_score,
  status: data.status ?? 1
})
export const updateExamPaper = (id, data) => request.put(`/admin/exam-papers/${id}`, {
  title: data.name || data.title,
  description: data.description,
  total_score: data.total_score,
  duration: data.duration,
  pass_score: data.pass_score,
  status: data.status ?? 1
})
export const deleteExamPaper = (id) => request.delete(`/admin/exam-papers/${id}`)

export const getQuestions = (params) => request.get('/admin/questions', { params }).then(res => ({
  ...res,
  data: {
    items: (res.data?.list || res.data?.items || []).map(item => ({
      ...item,
      type: item.question_type || item.type || 'single',
      paper_name: item.paper_name || '',
      options: item.options || []
    })),
    total: res.data?.total || (res.data?.list || []).length
  }
}))
export const getQuestionDetail = (id) => request.get(`/admin/questions/${id}`).then(res => ({
  ...res,
  data: {
    ...res.data,
    type: res.data.question_type || res.data.type || 'single',
    paper_name: res.data.paper_name || ''
  }
}))
export const createQuestion = (data) => request.post('/admin/questions', {
  paper_id: data.paper_id,
  question_type: data.type,
  content: data.content,
  answer: data.answer,
  analysis: data.analysis,
  score: data.score,
  options: (data.options || []).filter(o => o).map((text, idx) => ({
    option_key: String.fromCharCode(65 + idx),
    option_text: text,
    sort: idx
  }))
})
export const updateQuestion = (id, data) => request.put(`/admin/questions/${id}`, {
  id: id,
  paper_id: data.paper_id,
  question_type: data.type,
  content: data.content,
  answer: data.answer,
  analysis: data.analysis,
  score: data.score,
  options: (data.options || []).filter(o => o).map((text, idx) => ({
    option_key: String.fromCharCode(65 + idx),
    option_text: text,
    sort: idx
  }))
})
export const deleteQuestion = (id) => request.delete(`/admin/questions/${id}`)

export const getForumPosts = (params) => request.get('/admin/forum-posts', { params }).then(res => ({
  ...res,
  data: {
    items: (res.data?.list || res.data?.items || []).map(item => ({
      ...item,
      author_name: item.author_name || '',
      views: item.view_count || item.views || 0
    })),
    total: res.data?.total || 0
  }
}))
export const getForumPostDetail = (id) => request.get(`/admin/forum-posts/${id}`)
export const updateForumPost = (id, data) => request.put(`/admin/forum-posts/${id}`, data)
export const deleteForumPost = (id) => request.delete(`/admin/forum-posts/${id}`)

export const getOrders = (params) => request.get('/admin/orders', { params }).then(res => ({
  ...res,
  data: {
    items: (res.data?.list || res.data?.items || []).map(item => ({
      ...item,
      user_name: item.user_name || '',
      project_name: item.project_name || ''
    })),
    total: res.data?.total || 0
  }
}))
export const getOrderDetail = (id) => request.get(`/admin/orders/${id}`).then(res => ({
  ...res,
  data: {
    ...res.data,
    user_name: res.data.user_name || '',
    project_name: (res.data.items && res.data.items[0]?.project_name) || ''
  }
}))

export const getAdminExamPapers = (params) => getExamPapers(params)
export const getExamRecords = (params) => request.get('/admin/exam-records', { params }).then(res => ({
  ...res,
  data: {
    items: (res.data?.list || res.data?.items || []).map(item => ({
      ...item,
      user_name: item.user_name || '',
      paper_name: item.paper_title || item.paper_name || '',
      total_score: item.total_score || 0,
      passed: item.is_pass === 1 || item.passed === true,
      time_used: item.duration || item.time_used || 0
    })),
    total: res.data?.total || 0
  }
}))
export const getWrongQuestions = (params) => request.get('/admin/wrong-questions', { params }).then(res => ({
  ...res,
  data: {
    items: (res.data?.list || res.data?.items || []).map(item => ({
      ...item,
      user_name: item.user_name || '',
      paper_name: item.paper_name || '',
      question_content: item.question_content || item.content || '',
      user_answer: item.user_answer || '',
      correct_answer: item.correct_answer || item.answer || ''
    })),
    total: res.data?.total || 0
  }
}))
