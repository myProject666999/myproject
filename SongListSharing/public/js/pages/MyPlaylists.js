window.MyPlaylistsPage = {
  name: 'MyPlaylistsPage',
  data() {
    return {
      playlists: [],
      loading: true
    };
  },
  async mounted() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.$router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    try {
      const res = await api.getUserPlaylists(user.id);
      this.playlists = res.data || [];
    } catch (e) { console.error(e); } finally {
      this.loading = false;
    }
  },
  methods: {
    goDetail(id) {
      this.$router.push('/playlist/' + id);
    },
    async deletePl(id) {
      if (!confirm('确定删除此歌单？')) return;
      try {
        await api.deletePlaylist(id);
        this.playlists = this.playlists.filter(p => p.id !== id);
      } catch (e) { alert(e.message); }
    }
  },
  template: `
    <div class="my-page">
      <h2 class="section-title">我的歌单</h2>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="playlists.length === 0" class="empty">
        还没有歌单，<router-link to="/create">去创建一个</router-link>
      </div>
      <div v-else class="playlist-grid">
        <div class="playlist-card" v-for="pl in playlists" :key="pl.id" @click="goDetail(pl.id)">
          <div class="pl-cover" :style="pl.cover ? 'background-image:url('+pl.cover+')' : ''">
            <span class="pl-placeholder" v-if="!pl.cover">🎵</span>
            <span class="pl-like">♥ {{ pl.like_count }}</span>
          </div>
          <div class="pl-info">
            <div class="pl-title">{{ pl.title }}</div>
            <div class="pl-desc" v-if="pl.description">{{ pl.description }}</div>
            <div class="pl-meta">
              <span>{{ pl.view_count }} 浏览</span>
              <button class="del-btn" @click.stop="deletePl(pl.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};
