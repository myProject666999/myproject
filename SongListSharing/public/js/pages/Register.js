window.RegisterPage = {
  name: 'RegisterPage',
  data() {
    return {
      username: '',
      password: '',
      nickname: '',
      errorMsg: '',
      loading: false
    };
  },
  methods: {
    async onSubmit() {
      this.errorMsg = '';
      if (!this.username || !this.password) {
        this.errorMsg = '用户名和密码不能为空';
        return;
      }
      this.loading = true;
      try {
        const res = await api.register(this.username, this.password, this.nickname);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        this.$root.setUser(res.data.user);
        this.$router.push('/');
      } catch (e) {
        this.errorMsg = e.message;
      } finally {
        this.loading = false;
      }
    }
  },
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h2>注册</h2>
        <form @submit.prevent="onSubmit">
          <div class="form-group">
            <label>用户名 <span class="required">*</span></label>
            <input v-model="username" type="text" placeholder="请输入用户名" />
          </div>
          <div class="form-group">
            <label>密码 <span class="required">*</span></label>
            <input v-model="password" type="password" placeholder="请输入密码" />
          </div>
          <div class="form-group">
            <label>昵称</label>
            <input v-model="nickname" type="text" placeholder="可选" />
          </div>
          <div class="error-msg" v-if="errorMsg">{{ errorMsg }}</div>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '注册中...' : '注册' }}
          </button>
          <p class="auth-tip">已有账号？<router-link to="/login">去登录</router-link></p>
        </form>
      </div>
    </div>
  `
};
