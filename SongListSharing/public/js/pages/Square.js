window.SquarePage = {
  name: 'SquarePage',
  data() {
    return {
      recommendList: [],
      playlistList: [],
      total: 0,
      page: 1,
      pageSize: 12,
      loading: false,
      keyword: '',
      sort: 'hot'
    };
  },
  async mounted() {
    this.loadRecommend();
    this.loadList();
  },
  methods: {
    async loadRecommend() {
      try {
        const res = await api.recommendPlaylists();
        this.recommendList = res.data || [];
      } catch (e) { console.error(e); }
    },
    async loadList() {
      this.loading = true;
      try {
        const params = { page: this.page, pageSize: this.pageSize, sort: this.sort };
        if (this.keyword) params.keyword = this.keyword;
        const res = await api.listPlaylists(params);
        this.playlistList = res.data.list || [];
        this.total = res.data.total || 0;
      } catch (e) { console.error(e); } finally {
        this.loading = false;
      }
    },
    onSearch() {
      this.page = 1;
      this.loadList();
    },
    changeSort(s) {
      this.sort = s;
      this.page = 1;
      this.loadList();
    },
    goDetail(id) {
      this.$router.push('/playlist/' + id);
    },
    goUser(id) {
      this.$router.push('/user/' + id);
    },
    totalPages() {
      return Math.ceil(this.total / this.pageSize);
    }
  },
  template: `
    <div class="square-page">
      <section class="recommend-section">
        <h2 class="section-title">🔥 热门推荐</h2>
        <div class="recommend-grid">
          <div class="recommend-card" v-for="pl in recommendList" :key="'r'+pl.id" @click="goDetail(pl.id)">
            <div class="pl-cover" :style="pl.cover ? 'background-image:url('+pl.cover+')' : ''">
              <span class="pl-placeholder" v-if="!pl.cover">🎵</span>
              <span class="pl-like">♥ {{ pl.like_count }}</span>
            </div>
            <div class="pl-info">
              <div class="pl-title">{{ pl.title }}</div>
              <div class="pl-meta">
                <span @click.stop="goUser(pl.user_id)">by {{ pl.nickname || pl.username }}</span>
                <span>·</span>
                <span>{{ pl.view_count }} 浏览</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="list-section">
        <div class="list-header">
          <h2 class="section-title">📚 歌单广场</h2>
          <div class="list-toolbar">
            <div class="search-box">
              <input v-model="keyword" @keyup.enter="onSearch" placeholder="搜索歌单..." />
              <button @click="onSearch">搜索</button>
            </div>
            <div class="sort-tabs">
              <span :class="{ active: sort==='hot' }" @click="changeSort('hot')">热门</span>
              <span :class="{ active: sort==='new' }" @click="changeSort('new')">最新</span>
            </div>
          </div>
        </div>

        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="playlistList.length === 0" class="empty">暂无歌单</div>
        <div v-else class="playlist-grid">
          <div class="playlist-card" v-for="pl in playlistList" :key="pl.id" @click="goDetail(pl.id)">
            <div class="pl-cover" :style="pl.cover ? 'background-image:url('+pl.cover+')' : ''">
              <span class="pl-placeholder" v-if="!pl.cover">🎵</span>
              <span class="pl-like">♥ {{ pl.like_count }}</span>
            </div>
            <div class="pl-info">
              <div class="pl-title">{{ pl.title }}</div>
              <div class="pl-desc" v-if="pl.description">{{ pl.description }}</div>
              <div class="pl-meta">
                <span @click.stop="goUser(pl.user_id)">{{ pl.nickname || pl.username }}</span>
                <span>·</span>
                <span>{{ pl.view_count }} 浏览</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pagination" v-if="totalPages() > 1">
          <button :disabled="page <= 1" @click="page--;loadList()">上一页</button>
          <span>第 {{ page }} / {{ totalPages() }} 页</span>
          <button :disabled="page >= totalPages()" @click="page++;loadList()">下一页</button>
        </div>
      </section>
    </div>
  `
};
