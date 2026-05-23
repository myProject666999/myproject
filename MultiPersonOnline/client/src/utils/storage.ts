const TOKEN_KEY = 'mpo_token'
const USER_KEY = 'mpo_user'

export const storage = {
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY)
  },

  setUser(user: unknown) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  getUser<T>(): T | null {
    const data = localStorage.getItem(USER_KEY)
    if (!data) return null
    try {
      return JSON.parse(data) as T
    } catch {
      return null
    }
  },

  removeUser() {
    localStorage.removeItem(USER_KEY)
  },

  set(key: string, value: string) {
    localStorage.setItem(key, value)
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
