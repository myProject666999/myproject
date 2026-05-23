window.CreatePlaylistPage = {
  name: 'CreatePlaylistPage',
  data() {
    return {
      title: '',
      description: '',
      cover: '',
      isPublic: true,
      loading: false,
      errorMsg: ''
    };
  },
  methods: {
    async onSubmit() {
      this.errorMsg = '';
      if (!this.title.trim()) {
        this.errorMsg = '标题不能为空';
        return;
      }
      this.loading = true;
      try {
        const res = await api.createPlaylist({
          title: this.title,
          description: this.description,
          cover: this.cover,
          is_public: this.isPublic ? 1 : 0
        });
        this.$router.push('/playlist/' + res.data.id);
      } catch (e) {
        this.errorMsg = e.message;
      } finally {
        this.loading = false;
      }
    }
  },
  template: `
    <div class="auth-page">
      <div class="auth-card wide">
        <h2>创建歌单</h2>
        <form @submit.prevent="onSubmit">
          <div class="form-group">
            <label>歌单标题 <span class="required">*</span></label>
            <input v-model="title" type="text" placeholder="给歌单起个名字" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="description" rows="3" placeholder="简单介绍一下这个歌单..."></textarea>
          </div>
          <div class="form-group">
            <label>封面链接</label>
            <input v-model="cover" type="text" placeholder="图片URL (可选)" />
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="isPublic" /> 公开歌单
            </label>
          </div>
          <div class="error-msg" v-if="errorMsg">{{ errorMsg }}</div>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '创建中...' : '创建歌单' }}
          </button>
        </form>
      </div>
    </div>
  `
};
