<template>
  <div class="tree-node">
    <div 
      class="tree-node-content"
      :class="{ active: isSelected }"
      @click="handleClick"
      @contextmenu.prevent="handleRightClick"
    >
      <span class="tree-toggle" v-if="hasChildren && type !== 'page'">
        {{ expanded ? '▼' : '▶' }}
      </span>
      <span class="tree-toggle" v-else-if="type !== 'page'"></span>
      <span>{{ getIcon() }} {{ node.name || node.title }}</span>
      <span class="tree-actions" v-if="isSelected && type !== 'page'">
        <button class="btn-icon" title="新建页面" @click.stop="emitNewPage">📄</button>
        <button class="btn-icon" title="新建分区" @click.stop="emitNewSection" v-if="type !== 'page'">📁</button>
      </span>
    </div>
    <div v-if="expanded && children.length > 0" class="tree-children">
      <TreeNode 
        v-for="child in children" 
        :key="child.id" 
        :node="child" 
        :type="child.type || 'section'"
        @new-page="(data) => emit('new-page', data)"
        @new-section="(data) => emit('new-section', data)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { sectionApi, pageApi } from '../api'
import { store } from '../store'

const props = defineProps({
  node: Object,
  type: String
})

const emit = defineEmits(['new-page', 'new-section'])

const router = useRouter()
const expanded = ref(false)
const children = ref([])
const hasChildren = ref(false)

const isSelected = computed(() => {
  return store.selectedNode && 
         store.selectedNode.id === props.node.id && 
         store.selectedNode.type === props.type
})

const getIcon = () => {
  if (props.type === 'notebook') return '📒'
  if (props.type === 'section') return '📁'
  return '📄'
}

const loadChildren = async () => {
  try {
    if (props.type === 'notebook') {
      const res = await sectionApi.getByNotebook(props.node.id)
      children.value = res.data.map(s => ({ ...s, type: 'section' }))
      hasChildren.value = children.value.length > 0
    } else if (props.type === 'section') {
      const [sectionsRes, pagesRes] = await Promise.all([
        sectionApi.getSubSections(props.node.id),
        pageApi.getBySection(props.node.id)
      ])
      const sections = sectionsRes.data.map(s => ({ ...s, type: 'section' }))
      const pages = pagesRes.data.map(p => ({ ...p, type: 'page' }))
      children.value = [...sections, ...pages]
      hasChildren.value = children.value.length > 0
    }
  } catch (e) {
    console.error('Failed to load children:', e)
  }
}

const handleClick = () => {
  store.setSelectedNode(props.node, props.type)
  if (props.type === 'page') {
    router.push(`/page/${props.node.id}`)
  } else {
    expanded.value = !expanded.value
    if (expanded.value && children.value.length === 0) {
      loadChildren()
    }
  }
}

const emitNewPage = () => {
  emit('new-page', { ...props.node, type: props.type })
}

const emitNewSection = () => {
  emit('new-section', { ...props.node, type: props.type })
}

const handleRightClick = () => {
  store.setSelectedNode(props.node, props.type)
  if (props.type !== 'page') {
    emit('new-page', { ...props.node, type: props.type })
  }
}

onMounted(() => {
  if (props.type === 'notebook') {
    loadChildren()
  }
})
</script>
