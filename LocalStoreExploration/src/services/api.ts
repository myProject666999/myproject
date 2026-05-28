const API_BASE = 'http://localhost:3000/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(username: string, password: string, nickname: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, nickname }),
    });
  }

  async getNearbyNotes(lng: number, lat: number, radius = 5, category?: string) {
    const params = new URLSearchParams({
      lng: lng.toString(),
      lat: lat.toString(),
      radius: radius.toString(),
    });
    if (category && category !== 'all') {
      params.append('category', category);
    }
    return this.request(`/notes/nearby?${params}`);
  }

  async getNoteById(id: number) {
    return this.request(`/notes/${id}`);
  }

  async getNotesByShopId(shopId: number, page = 1, limit = 20) {
    return this.request(`/notes/shop/${shopId}?page=${page}&limit=${limit}`);
  }

  async createNote(data: any) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getShopById(id: number) {
    return this.request(`/shops/${id}`);
  }

  async getShops(page = 1, limit = 20, category?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (category) {
      params.append('category', category);
    }
    return this.request(`/shops?${params}`);
  }

  async getCommentsByNoteId(noteId: number, page = 1, limit = 20) {
    return this.request(`/comments/note/${noteId}?page=${page}&limit=${limit}`);
  }

  async createComment(noteId: number, content: string) {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify({ noteId, content }),
    });
  }

  async getMyFavorites(listType?: 'want' | 'visited') {
    const params = listType ? `?listType=${listType}` : '';
    return this.request(`/favorites/my${params}`);
  }

  async addFavorite(targetId: number, targetType: 'note' | 'shop', listType = 'want') {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ targetId, targetType, listType }),
    });
  }

  async removeFavorite(targetId: number, targetType: 'note' | 'shop') {
    return this.request('/favorites', {
      method: 'DELETE',
      body: JSON.stringify({ targetId, targetType }),
    });
  }

  async checkFavorite(targetId: number, targetType: 'note' | 'shop') {
    return this.request(`/favorites/check?targetId=${targetId}&targetType=${targetType}`);
  }

  async getDarenRanking(limit = 20) {
    return this.request(`/ranking/daren?limit=${limit}`);
  }

  async getUserById(id: number) {
    return this.request(`/users/${id}`);
  }
}

export const api = new ApiService();
