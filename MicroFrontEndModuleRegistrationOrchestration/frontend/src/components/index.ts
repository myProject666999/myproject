import type { App } from 'vue'
import PageHeader from './PageHeader.vue'
import StatusTag from './StatusTag.vue'
import ConfigEditor from './ConfigEditor.vue'
import GrayProgress from './GrayProgress.vue'

export function registerComponents(app: App) {
  app.component('PageHeader', PageHeader)
  app.component('StatusTag', StatusTag)
  app.component('ConfigEditor', ConfigEditor)
  app.component('GrayProgress', GrayProgress)
}

export {
  PageHeader,
  StatusTag,
  ConfigEditor,
  GrayProgress
}
