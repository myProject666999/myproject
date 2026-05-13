
<template>
  <div class="song">
    <el-header>
      <div class="header-content">
        <div class="logo" @click="goHome">🎤 KTV包厢预订与点歌系统</div>
      </div>
    </el-header>
    
    <el-main>
      <h2>点歌系统</h2>
      <el-row :gutter="20">
        <el-col :span="18">
          <el-card>
            <el-search
              v-model="searchKeyword"
              placeholder="搜索歌曲、歌手、专辑..."
              style="margin-bottom: 20px;"
              @search="handleSearch">
            </el-search>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="热门歌曲" name="hot">
                <el-table :data="songs" style="width: 100%">
                  <el-table-column prop="name" label="歌曲名称" width="200"></el-table-column>
                  <el-table-column prop="singer" label="歌手" width="150"></el-table-column>
                  <el-table-column prop="album" label="专辑" width="200"></el-table-column>
                  <el-table-column prop="language" label="语言" width="100"></el-table-column>
                  <el-table-column prop="genre" label="类型" width="100"></el-table-column>
                  <el-table-column label="操作" width="150">
                    <template slot-scope="scope">
                      <el-button size="mini" type="primary" @click="addToQueue(scope.row)">
                        点歌
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="按歌手" name="singer">
                <el-input
                  v-model="singerFilter"
                  placeholder="输入歌手名字筛选..."
                  style="margin-bottom: 20px;">
                </el-input>
                <el-table :data="filteredBySinger" style="width: 100%">
                  <el-table-column prop="singer" label="歌手" width="150"></el-table-column>
                  <el-table-column prop="name" label="歌曲名称"></el-table-column>
                  <el-table-column label="操作" width="150">
                    <template slot-scope="scope">
                      <el-button size="mini" type="primary" @click="addToQueue(scope.row)">
                        点歌
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="按语言" name="language">
                <el-radio-group v-model="languageFilter" style="margin-bottom: 20px;">
                  <el-radio label="">全部</el-radio>
                  <el-radio label="国语">国语</el-radio>
                  <el-radio label="粤语">粤语</el-radio>
                  <el-radio label="英语">英语</el-radio>
                </el-radio-group>
                <el-table :data="filteredByLanguage" style="width: 100%">
                  <el-table-column prop="name" label="歌曲名称" width="200"></el-table-column>
                  <el-table-column prop="singer" label="歌手" width="150"></el-table-column>
                  <el-table-column prop="language" label="语言" width="100"></el-table-column>
                  <el-table-column label="操作" width="150">
                    <template slot-scope="scope">
                      <el-button size="mini" type="primary" @click="addToQueue(scope.row)">
                        点歌
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="queue-card">
            <div class="queue-header">
              <h3>🎵 已点歌曲</h3>
            </div>
            <div class="current-song" v-if="currentSong">
              <div class="playing-label">正在播放</div>
              <div class="song-info">
                <strong>{{ currentSong.name }}</strong>
                <p>{{ currentSong.singer }}</p>
              </div>
            </div>
            <div class="queue-list">
              <div v-if="songQueue.length === 0" class="empty-queue">
                暂无已点歌曲
              </div>
              <div v-else class="queue-item" v-for="(song, index) in songQueue" :key="song.id">
                <span class="queue-index">{{ index + 1 }}</span>
                <div class="queue-info">
                  <strong>{{ song.name }}</strong>
                  <p>{{ song.singer }}</p>
                </div>
                <div class="queue-actions">
                  <el-button size="mini" icon="el-icon-top" @click="topSong(index)" v-if="index > 0">
                    置顶
                  </el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeSong(index)">
                    删除
                  </el-button>
                </div>
              </div>
            </div>
            <div class="queue-footer" v-if="songQueue.length > 0">
              <el-button type="primary" style="width: 100%;" @click="playNext">
                下一首
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script>
export default {
  name: 'Song',
  data() {
    return {
      searchKeyword: '',
      activeTab: 'hot',
      singerFilter: '',
      languageFilter: '',
      songs: [
        { id: 1, name: '夜曲', singer: '周杰伦', album: '十一月的萧邦', language: '国语', genre: '流行' },
        { id: 2, name: '青花瓷', singer: '周杰伦', album: '我很忙', language: '国语', genre: '流行' },
        { id: 3, name: '晴天', singer: '周杰伦', album: '叶惠美', language: '国语', genre: '流行' },
        { id: 4, name: '告白气球', singer: '周杰伦', album: '周杰伦的床边故事', language: '国语', genre: '流行' },
        { id: 5, name: '演员', singer: '薛之谦', album: '绅士', language: '国语', genre: '流行' },
        { id: 6, name: '丑八怪', singer: '薛之谦', album: '丑八怪', language: '国语', genre: '流行' },
        { id: 7, name: '海阔天空', singer: 'Beyond', album: '乐与怒', language: '粤语', genre: '摇滚' },
        { id: 8, name: '光辉岁月', singer: 'Beyond', album: '命运派对', language: '粤语', genre: '摇滚' },
        { id: 9, name: '喜欢你', singer: 'Beyond', album: '秘密警察', language: '粤语', genre: '摇滚' },
        { id: 10, name: '富士山下', singer: '陈奕迅', album: 'What\'s Going On...?', language: '粤语', genre: '流行' },
        { id: 11, name: '十年', singer: '陈奕迅', album: '黑白灰', language: '国语', genre: '流行' },
        { id: 12, name: '后来', singer: '刘若英', album: '我等你', language: '国语', genre: '流行' },
        { id: 13, name: '勇气', singer: '梁静茹', album: '勇气', language: '国语', genre: '流行' },
        { id: 14, name: 'My Heart Will Go On', singer: 'Celine Dion', album: 'Let\'s Talk About Love', language: '英语', genre: '流行' },
        { id: 15, name: 'Yesterday Once More', singer: 'Carpenters', album: 'Now & Then', language: '英语', genre: '经典' }
      ],
      songQueue: [],
      currentSong: null
    }
  },
  computed: {
    filteredBySinger() {
      if (!this.singerFilter) return this.songs
      return this.songs.filter(song => 
        song.singer.includes(this.singerFilter)
      )
    },
    filteredByLanguage() {
      if (!this.languageFilter) return this.songs
      return this.songs.filter(song => 
        song.language === this.languageFilter
      )
    }
  },
  methods: {
    handleSearch() {
      this.$message.info(`搜索：${this.searchKeyword}`)
    },
    addToQueue(song) {
      this.songQueue.push({ ...song })
      this.$message.success(`${song.name} 已加入点歌列表`)
    },
    topSong(index) {
      const song = this.songQueue.splice(index, 1)[0]
      this.songQueue.unshift(song)
    },
    removeSong(index) {
      this.songQueue.splice(index, 1)
    },
    playNext() {
      if (this.songQueue.length > 0) {
        this.currentSong = this.songQueue.shift()
        this.$message.success(`开始播放：${this.currentSong.name}`)
      }
    },
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.song {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.el-header {
  background-color: #409EFF;
  color: white;
  padding: 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
}

.el-main {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 40px 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}

.queue-card {
  position: sticky;
  top: 40px;
}

.queue-header {
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.queue-header h3 {
  margin: 0;
}

.current-song {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.playing-label {
  font-size: 12px;
  background: rgba(255,255,255,0.2);
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.song-info p {
  margin: 5px 0 0 0;
  opacity: 0.8;
}

.empty-queue {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.queue-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  margin-bottom: 10px;
}

.queue-index {
  background: #409EFF;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-right: 10px;
  flex-shrink: 0;
}

.queue-info {
  flex: 1;
}

.queue-info p {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 12px;
}

.queue-actions {
  flex-shrink: 0;
}

.queue-footer {
  margin-top: 20px;
}
</style>
