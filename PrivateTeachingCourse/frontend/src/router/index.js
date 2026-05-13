const routes = [
  { path: '/', component: () => import('@/views/Home.vue'), meta: { title: '首页' } },
  { path: '/login', component: () => import('@/views/Login.vue'), meta: { title: '登录' } },
  { path: '/register', component: () => import('@/views/Register.vue'), meta: { title: '注册' } },
  { path: '/courses', component: () => import('@/views/Courses.vue'), meta: { title: '课程列表', requiresAuth: true } },
  { path: '/coach-detail/:id', component: () => import('@/views/CoachDetail.vue'), meta: { title: '教练详情' } },
  { path: '/bookings', component: () => import('@/views/Bookings.vue'), meta: { title: '我的预约', requiresAuth: true } },
  { path: '/checkin-qr/:bookingId', component: () => import('@/views/CheckinQR.vue'), meta: { title: '签到二维码', requiresAuth: true } },
  { path: '/trainings', component: () => import('@/views/Trainings.vue'), meta: { title: '训练记录', requiresAuth: true } },
  { path: '/training-edit/:id?', component: () => import('@/views/TrainingEdit.vue'), meta: { title: '编辑训练记录', requiresAuth: true } },
  { path: '/body-tests', component: () => import('@/views/BodyTests.vue'), meta: { title: '体测数据', requiresAuth: true } },
  { path: '/body-test-edit/:id?', component: () => import('@/views/BodyTestEdit.vue'), meta: { title: '编辑体测数据', requiresAuth: true } },
  { path: '/community', component: () => import('@/views/Community.vue'), meta: { title: '社区' } },
  { path: '/post-create', component: () => import('@/views/PostCreate.vue'), meta: { title: '发布动态', requiresAuth: true } },
  { path: '/post-detail/:id', component: () => import('@/views/PostDetail.vue'), meta: { title: '动态详情' } },
  { path: '/profile', component: () => import('@/views/Profile.vue'), meta: { title: '个人中心', requiresAuth: true } },
  { path: '/profile-edit', component: () => import('@/views/ProfileEdit.vue'), meta: { title: '编辑资料', requiresAuth: true } }
]

export default routes
