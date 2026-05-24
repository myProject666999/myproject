import axios from 'axios';
import { ElMessage } from 'element-plus';

const http = axios.create({ baseURL: '/api', timeout: 15000 });

http.interceptors.response.use(
  (res) => res,
  (err) => {
    ElMessage.error(err?.response?.data?.msg || err.message || '请求失败');
    return Promise.reject(err);
  }
);

export const api = {
  folders: () => http.get('/folders').then((r) => r.data.data),
  addFolder: (d) => http.post('/folders', d).then((r) => r.data.data),
  updateFolder: (id, d) => http.put(`/folders/${id}`, d).then((r) => r.data.data),
  delFolder: (id) => http.delete(`/folders/${id}`).then((r) => r.data.data),

  tags: () => http.get('/tags').then((r) => r.data.data),
  addTag: (d) => http.post('/tags', d).then((r) => r.data.data),
  delTag: (id) => http.delete(`/tags/${id}`).then((r) => r.data.data),

  bookmarks: (p) => http.get('/bookmarks', { params: p }).then((r) => r.data.data),
  bookmark: (id) => http.get(`/bookmarks/${id}`).then((r) => r.data.data),
  addBookmark: (d) => http.post('/bookmarks', d).then((r) => r.data.data),
  updateBookmark: (id, d) => http.put(`/bookmarks/${id}`, d).then((r) => r.data.data),
  delBookmark: (id) => http.delete(`/bookmarks/${id}`).then((r) => r.data.data),
  batchDelete: (ids) => http.post('/bookmarks/batch-delete', { ids }).then((r) => r.data.data),
  preview: (url) => http.post('/bookmarks/preview', { url }).then((r) => r.data.data),
  check: (id) => http.post(`/bookmarks/check/${id}`).then((r) => r.data.data),

  importBookmarks: (content, folder_id) =>
    http.post('/import', { content, folder_id }).then((r) => r.data.data),
  exportBookmarks: () => http.get('/export', { responseType: 'blob' }).then((r) => r.data),

  stats: () => http.get('/stats').then((r) => r.data.data)
};

export default http;
