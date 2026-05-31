import { createPinia } from 'pinia'

export { useUserStore } from './user'
export { useAppStore } from './app'
export { useTaskStore } from './task'
export { useIssueStore } from './issue'

const pinia = createPinia()

export default pinia
