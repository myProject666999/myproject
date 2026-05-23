window.AudioPlayer = {
  name: 'AudioPlayer',
  props: {
    song: { type: Object, default: null },
    playlist: { type: Array, default: () => [] }
  },
  emits: ['play', 'pause'],
  data() {
    return {
      audio: null,
      currentSrc: '',
      currentTitle: '',
      currentArtist: '',
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      showDetail: false,
      currentIndex: -1
    };
  },
  computed: {
    progressPercent() {
      return this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
    },
    hasSong() { return !!this.currentSrc; }
  },
  methods: {
    playSong(song) {
      if (!song) return;
      const src = song.audio_url || song.audio_path;
      if (!src) return;
      this.currentSrc = src;
      this.currentTitle = song.title || '未知歌曲';
      this.currentArtist = song.artist || '';
      if (this.playlist && this.playlist.length > 0) {
        this.currentIndex = this.playlist.findIndex(s => s.id === song.id);
      }
      this.$nextTick(() => {
        if (this.audio) {
          this.audio.src = src;
          this.audio.play().catch(() => {});
          this.isPlaying = true;
        }
      });
    },
    togglePlay() {
      if (!this.audio || !this.currentSrc) return;
      if (this.isPlaying) {
        this.audio.pause();
        this.isPlaying = false;
      } else {
        this.audio.play().catch(() => {});
        this.isPlaying = true;
      }
    },
    next() {
      if (this.playlist.length === 0) return;
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
      this.playSong(this.playlist[this.currentIndex]);
    },
    prev() {
      if (this.playlist.length === 0) return;
      this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
      this.playSong(this.playlist[this.currentIndex]);
    },
    onTimeUpdate() {
      if (this.audio) this.currentTime = this.audio.currentTime;
    },
    onLoadedMetadata() {
      if (this.audio) this.duration = this.audio.duration;
    },
    onEnded() {
      if (this.playlist.length > 0) {
        this.next();
      } else {
        this.isPlaying = false;
      }
    },
    seek(e) {
      if (!this.audio || !this.duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this.audio.currentTime = percent * this.duration;
    },
    formatTime(sec) {
      if (!sec || isNaN(sec)) return '0:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return m + ':' + (s < 10 ? '0' + s : s);
    }
  },
  mounted() {
    this.audio = new Audio();
    this.audio.volume = this.volume;
    this.audio.addEventListener('timeupdate', this.onTimeUpdate);
    this.audio.addEventListener('loadedmetadata', this.onLoadedMetadata);
    this.audio.addEventListener('ended', this.onEnded);
  },
  beforeUnmount() {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeEventListener('timeupdate', this.onTimeUpdate);
      this.audio.removeEventListener('loadedmetadata', this.onLoadedMetadata);
      this.audio.removeEventListener('ended', this.onEnded);
    }
  },
  template: `
    <div class="audio-player" :class="{ 'has-song': hasSong }">
      <div class="player-mini" v-if="!showDetail" @click="showDetail = true">
        <span class="song-title">{{ currentTitle || '未播放' }}</span>
        <span class="song-artist" v-if="currentArtist"> — {{ currentArtist }}</span>
      </div>
      <div class="player-detail" v-else>
        <button class="close-btn" @click.stop="showDetail = false">×</button>
        <div class="player-info">
          <div class="player-title">{{ currentTitle || '未播放' }}</div>
          <div class="player-artist" v-if="currentArtist">{{ currentArtist }}</div>
        </div>
        <div class="player-controls">
          <button class="ctrl-btn" @click="prev" :disabled="playlist.length === 0">⏮</button>
          <button class="ctrl-btn play-btn" @click="togglePlay" :disabled="!hasSong">
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
          <button class="ctrl-btn" @click="next" :disabled="playlist.length === 0">⏭</button>
        </div>
        <div class="player-progress" @click="seek">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <div class="time-display">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>
      </div>
    </div>
  `
};
