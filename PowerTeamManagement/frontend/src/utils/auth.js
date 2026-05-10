export const getToken = () => localStorage.getItem('token')

export const setToken = (token) => localStorage.setItem('token', token)

export const removeToken = () => localStorage.removeItem('token')

export const getUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user))

export const removeUser = () => localStorage.removeItem('user')

export const isAuthenticated = () => !!getToken()

export const isAdmin = () => {
  const user = getUser()
  return user?.role?.code === 'admin'
}

export const isManagerOrAdmin = () => {
  const user = getUser()
  const roleCode = user?.role?.code
  return roleCode === 'admin' || roleCode === 'sales_manager'
}

export const logout = () => {
  removeToken()
  removeUser()
  window.location.href = '/login'
}
