window.PlaylistDetailPage = {
  name: 'PlaylistDetailPage',
  data() {
    return {
      playlist: null,
      songs: [],
      loading: true,
      reviews: {},
      reviewContent: '',
      reviewRating: 0,
      activeSongId: null,
      isOwner: false,
      isFollowed: false,
      addingSong: false,
      newSong: { title: '', artist: '', audio_url: '' }
    };
  },
  async mounted() {
    await this.loadAll();
  },
  computed: {
    isLoggedIn() { return !!localStorage.getItem('token'); }
  },
  watch: {
    '$route'() { this.loadAll(); }
  },
  methods: {
    async loadAll() {
      this.loading = true;
      try {
        const res = await api.getPlaylist(this.$route.params.id);
        this.playlist = res.data;
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          this.isOwner = u.id === this.playlist.user_id;
          try {
            const fRes = await api.checkFollow(this.playlist.user_id);
            this.isFollowed = fRes.data.followed;
          } catch (e) {}
        }
        const sRes = await api.getSongs(this.playlist.id);
        this.songs = sRes.data || [];
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async loadReviews(songId) {
      try {
        const res = await api.getReviews(songId);
        this.reviews = { ...this.reviews, [songId]: res.data || [] };
      } catch (e) {}
    },
    toggleSong(song) {
      if (this.activeSongId === song.id) {
        this.activeSongId = null;
      } else {
        this.activeSongId = song.id;
        if (!this.reviews[song.id]) this.loadReviews(song.id);
      }
    },
    playSong(song) {
      const player = this.$root.$refs.audioPlayer;
      if (player) {
        player.playlist = this.songs;
        player.playSong(song);
      }
    },
    async submitReview(songId) {
      if (!this.reviewContent.trim()) return;
      if (!this.isLoggedIn) { this.$router.push('/login'); return; }
      try {
        await api.addReview({ song_id: songId, content: this.reviewContent, rating: this.reviewRating || null });
        this.reviewContent = '';
        this.reviewRating = 0;
        this.loadReviews(songId);
      } catch (e) { alert(e.message); }
    },
    async deleteReview(reviewId, songId) {
      if (!confirm('确定删除？')) return;
      try {
        await api.deleteReview(reviewId);
        this.loadReviews(songId);
      } catch (e) { alert(e.message); }
    },
    async toggleFollow() {
      if (!this.isLoggedIn) { this.$router.push('/login'); return; }
      try {
        if (this.isFollowed) {
          await api.unfollowUser(this.playlist.user_id);
          this.isFollowed = false;
        } else {
          await api.followUser(this.playlist.user_id);
          this.isFollowed = true;
        }
      } catch (e) { alert(e.message); }
    },
    async likePlaylist() {
      if (!this.isLoggedIn) { this.$router.push('/login'); return; }
      try {
        await api.likePlaylist(this.playlist.id);
        this.playlist.like_count++;
      } catch (e) { alert(e.message); }
    },
    async addSong() {
      if (!this.newSong.title) { alert('请填写歌曲标题'); return; }
      try {
        await api.addSong({
          playlist_id: this.playlist.id,
          title: this.newSong.title,
          artist: this.newSong.artist,
          audio_url: this.newSong.audio_url
        });
        this.newSong = { title: '', artist: '', audio_url: '' };
        this.addingSong = false;
        this.loadAll();
      } catch (e) { alert(e.message); }
    },
    async deleteSong(id) {
      if (!confirm('确定删除此歌曲？')) return;
      try {
        await api.deleteSong(id);
        this.loadAll();
      } catch (e) { alert(e.message); }
    },
    goUser(id) {
      this.$router.push('/user/' + id);
    },
    goBack() {
      this.$router.back();
    }
  },
  template: `
    <div class="detail-page" v-if="playlist">
      <div class="detail-header">
        <button class="back-btn" @click="goBack">← 返回</button>
        <div class="header-content">
          <div class="header-cover" :style="playlist.cover ? 'background-image:url('+playlist.cover+')' : ''">
            <span class="pl-placeholder" v-if="!playlist.cover">🎵</span>
          </div>
          <div class="header-info">
            <h1 class="pl-title-lg">{{ playlist.title }}</h1>
            <p class="pl-desc-lg" v-if="playlist.description">{{ playlist.description }}</p>
            <div class="pl-meta-lg">
              <span @click="goUser(playlist.user_id)" class="user-link">
                👤 {{ playlist.nickname || playlist.username }}
              </span>
              <span>·</span>
              <span>{{ playlist.view_count }} 浏览</span>
              <span>·</span>
              <span>{{ playlist.like_count }} 喜欢</span>
            </div>
            <div class="header-actions">
              <button class="btn btn-primary" @click="likePlaylist">♥ 点赞</button>
              <button
                class="btn"
                :class="isFollowed ? 'btn-secondary' : 'btn-outline'"
                @click="toggleFollow"
                v-if="!isOwner"
              >{{ isFollowed ? '已关注' : '+ 关注用户' }}</button>
            </div>
          </div>
        </div>
      </div>

      <section class="songs-section">
        <div class="section-header">
          <h3>歌曲列表 ({{ songs.length }})</h3>
          <button v-if="isOwner" class="btn btn-sm btn-primary" @click="addingSong = !addingSong">+ 添加歌曲</button>
        </div>

        <div v-if="isOwner && addingSong" class="add-song-form">
          <input v-model="newSong.title" placeholder="歌曲标题 *" />
          <input v-model="newSong.artist" placeholder="歌手" />
          <input v-model="newSong.audio_url" placeholder="音频链接 (URL)" />
          <button class="btn btn-sm btn-primary" @click="addSong">添加</button>
          <button class="btn btn-sm" @click="addingSong = false">取消</button>
        </div>

        <div v-if="songs.length === 0" class="empty">歌单暂无歌曲</div>
        <div v-else class="song-list">
          <div class="song-item" v-for="(song, idx) in songs" :key="song.id" :class="{ active: activeSongId === song.id }">
            <div class="song-main">
              <span class="song-idx">{{ idx + 1 }}</span>
              <button class="play-icon" @click.stop="playSong(song)">▶</button>
              <div class="song-info">
                <div class="song-title">{{ song.title }}</div>
                <div class="song-artist" v-if="song.artist">{{ song.artist }}</div>
              </div>
              <span class="toggle-review" @click="toggleSong(song)">
                {{ activeSongId === song.id ? '收起点评' : '查看点评' }}
              </span>
              <button v-if="isOwner" class="del-btn" @click.stop="deleteSong(song.id)">删除</button>
            </div>
            <div class="review-section" v-if="activeSongId === song.id">
              <div class="review-form">
                <textarea v-model="reviewContent" placeholder="写下你对这首歌的点评..."></textarea>
                <div class="review-rating">
                  评分:
                  <span v-for="n in 5" :key="n" class="star"
                    :class="{ active: reviewRating >= n }"
                    @click="reviewRating = reviewRating === n ? 0 : n">★</span>
                </div>
                <button class="btn btn-sm btn-primary" @click="submitReview(song.id)">提交点评</button>
              </div>
              <div class="review-list" v-if="reviews[song.id] && reviews[song.id].length > 0">
                <div class="review-item" v-for="r in reviews[song.id]" :key="r.id">
                  <div class="review-head">
                    <span @click="goUser(r.user_id)" class="user-link">{{ r.nickname || r.username }}</span>
                    <span class="review-rating-stars" v-if="r.rating">
                      <span v-for="n in 5" :key="n" :class="{ active: r.rating >= n }">★</span>
                    </span>
                    <span class="review-time">{{ r.created_at }}</span>
                  </div>
                  <div class="review-content">{{ r.content }}</div>
                  <button v-if="isOwner" class="del-btn" @click="deleteReview(r.id, song.id)">删除</button>
                </div>
              </div>
              <div v-else class="empty">暂无点评，快来分享你的感受吧</div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <div v-else-if="loading" class="loading">加载中...</div>
  `
};
