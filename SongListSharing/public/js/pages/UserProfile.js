window.UserProfilePage = {
  name: 'UserProfilePage',
  data() {
    return {
      user: null,
      playlists: [],
      loading: true,
      isFollowed: false,
      isSelf: false
    };
  },
  async mounted() {
    await this.loadAll();
  },
  watch: {
    '$route'() { this.loadAll(); }
  },
  computed: {
    isLoggedIn() { return !!localStorage.getItem('token'); }
  },
  methods: {
    async loadAll() {
      this.loading = true;
      try {
        const res = await api.getUser(this.$route.params.id);
        this.user = res.data;
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          this.isSelf = u.id === this.user.id;
          if (!this.isSelf) {
            try {
              const fRes = await api.checkFollow(this.user.id);
              this.isFollowed = fRes.data.followed;
            } catch (e) {}
          }
        }
        const pRes = await api.getUserPlaylists(this.user.id);
        this.playlists = pRes.data || [];
      } catch (e) { console.error(e); } finally {
        this.loading = false;
      }
    },
    async toggleFollow() {
      if (!this.isLoggedIn) { this.$router.push('/login'); return; }
      try {
        if (this.isFollowed) {
          await api.unfollowUser(this.user.id);
          this.isFollowed = false;
        } else {
          await api.followUser(this.user.id);
          this.isFollowed = true;
        }
      } catch (e) { alert(e.message); }
    },
    goDetail(id) {
      this.$router.push('/playlist/' + id);
    }
  },
  template: `
    <div class="user-page" v-if="user">
      <div class="user-header">
        <div class="user-avatar">👤</div>
        <div class="user-info">
          <h2>{{ user.nickname || user.username }}</h2>
          <p class="user-bio" v-if="user.bio">{{ user.bio }}</p>
          <p class="user-meta">加入于 {{ user.created_at }}</p>
          <button
            v-if="!isSelf"
            class="btn"
            :class="isFollowed ? 'btn-secondary' : 'btn-primary'"
            @click="toggleFollow"
          >{{ isFollowed ? '已关注' : '+ 关注' }}</button>
        </div>
      </div>

      <section>
        <h3 class="section-title">TA 的公开歌单</h3>
        <div v-if="playlists.length === 0" class="empty">暂无公开歌单</div>
        <div v-else class="playlist-grid">
          <div class="playlist-card" v-for="pl in playlists" :key="pl.id" @click="goDetail(pl.id)">
            <div class="pl-cover" :style="pl.cover ? 'background-image:url('+pl.cover+')' : ''">
              <span class="pl-placeholder" v-if="!pl.cover">🎵</span>
              <span class="pl-like">♥ {{ pl.like_count }}</span>
            </div>
            <div class="pl-info">
              <div class="pl-title">{{ pl.title }}</div>
              <div class="pl-desc" v-if="pl.description">{{ pl.description }}</div>
              <div class="pl-meta">{{ pl.view_count }} 浏览</div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <div v-else-if="loading" class="loading">加载中...</div>
  `
};
