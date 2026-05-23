window.LoginPage = {
  name: 'LoginPage',
  data() {
    return {
      username: '',
      password: '',
      errorMsg: '',
      loading: false
    };
  },
  methods: {
    async onSubmit() {
      this.errorMsg = '';
      if (!this.username || !this.password) {
        this.errorMsg = '请输入用户名和密码';
        return;
      }
      this.loading = true;
      try {
        const res = await api.login(this.username, this.password);
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
        <h2>登录</h2>
        <form @submit.prevent="onSubmit">
          <div class="form-group">
            <label>用户名</label>
            <input v-model="username" type="text" placeholder="请输入用户名" />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input v-model="password" type="password" placeholder="请输入密码" />
          </div>
          <div class="error-msg" v-if="errorMsg">{{ errorMsg }}</div>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
          <p class="auth-tip">还没有账号？<router-link to="/register">立即注册</router-link></p>
        </form>
      </div>
    </div>
  `
};
