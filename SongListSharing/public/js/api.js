const API_BASE = '/api';

const api = {
  async request(path, options = {}) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(API_BASE + path, { ...options, headers });
    const data = await res.json();
    if (data.code !== undefined && data.code !== 0) {
      throw new Error(data.message || '请求失败');
    }
    return data;
  },
  get(path) { return this.request(path); },
  post(path, body) { return this.request(path, { method: 'POST', body: JSON.stringify(body || {}) }); },
  put(path, body) { return this.request(path, { method: 'PUT', body: JSON.stringify(body || {}) }); },
  del(path) { return this.request(path, { method: 'DELETE' }); },

  login(username, password) { return this.post('/auth/login', { username, password }); },
  register(username, password, nickname) { return this.post('/auth/register', { username, password, nickname }); },

  getUser(id) { return this.get('/users/' + id); },
  getUserPlaylists(id) { return this.get('/users/' + id + '/playlists'); },

  listPlaylists(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.get('/playlists' + (q ? '?' + q : ''));
  },
  recommendPlaylists() { return this.get('/playlists/recommend'); },
  getPlaylist(id) { return this.get('/playlists/' + id); },
  createPlaylist(body) { return this.post('/playlists', body); },
  updatePlaylist(id, body) { return this.put('/playlists/' + id, body); },
  deletePlaylist(id) { return this.del('/playlists/' + id); },
  likePlaylist(id) { return this.post('/playlists/' + id + '/like'); },

  getSongs(playlistId) { return this.get('/songs/playlist/' + playlistId); },
  addSong(body) { return this.post('/songs', body); },
  deleteSong(id) { return this.del('/songs/' + id); },

  getReviews(songId) { return this.get('/reviews/song/' + songId); },
  addReview(body) { return this.post('/reviews', body); },
  deleteReview(id) { return this.del('/reviews/' + id); },

  followUser(userId) { return this.post('/follows/' + userId); },
  unfollowUser(userId) { return this.del('/follows/' + userId); },
  checkFollow(userId) { return this.get('/follows/check/' + userId); },
  getFollowers(userId) { return this.get('/follows/' + userId + '/followers'); },
  getFollowing(userId) { return this.get('/follows/' + userId + '/following'); },

  uploadAudio(formData) {
    const token = localStorage.getItem('token');
    return fetch(API_BASE + '/upload/audio', {
      method: 'POST',
      headers: token ? { 'Authorization': 'Bearer ' + token } : {},
      body: formData
    }).then(r => r.json());
  }
};
