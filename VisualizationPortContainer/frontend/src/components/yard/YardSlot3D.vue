<template>
  <div class="yard-slot-3d">
    <div class="yard-header">
      <div class="yard-title">{{ yardName }} - 3D视图</div>
      <div class="yard-controls">
        <el-button size="small" @click="resetView">重置视角</el-button>
        <el-button size="small" @click="toggleAutoRotate">
          {{ autoRotate ? '停止旋转' : '自动旋转' }}
        </el-button>
      </div>
    </div>
    <div ref="containerRef" class="three-container"></div>
    <div v-if="hoveredSlot" class="slot-tooltip">
      <div class="tooltip-title">箱位信息</div>
      <div class="tooltip-row">位置: {{ hoveredSlot.yardCode }}-{{ hoveredSlot.row }}-{{ hoveredSlot.col }}-{{ hoveredSlot.layer }}</div>
      <div v-if="hoveredSlot.containerNo" class="tooltip-row">箱号: {{ hoveredSlot.containerNo }}</div>
      <div class="tooltip-row">状态: {{ getStatusText(hoveredSlot.status) }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
  yardName: {
    type: String,
    default: 'A堆场'
  },
  gridData: {
    type: Array,
    required: true
  },
  totalLayers: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['slot-click'])

const containerRef = ref(null)
const hoveredSlot = ref(null)
const autoRotate = ref(false)

let scene, camera, renderer, controls
let slotMeshes = []
let raycaster, mouse
let animationId = null

function init() {
  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0e1a)

  const width = container.clientWidth
  const height = container.clientHeight

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(30, 40, 50)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.autoRotateSpeed = 1

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(50, 100, 50)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  const pointLight = new THREE.PointLight(0x409eff, 0.5)
  pointLight.position.set(0, 20, 0)
  scene.add(pointLight)

  createGround()
  createSlots()

  animate()

  window.addEventListener('resize', onWindowResize)
  renderer.domElement.addEventListener('mousemove', onMouseMove)
  renderer.domElement.addEventListener('click', onClick)
}

function createGround() {
  const rows = props.gridData.length
  const cols = props.gridData[0]?.length || 20
  const groundGeometry = new THREE.PlaneGeometry(cols * 2.5, rows * 2.5)
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1f36,
    roughness: 0.8,
    metalness: 0.2
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.set(cols * 1.25 - 1.25, 0, rows * 1.25 - 1.25)
  ground.receiveShadow = true
  scene.add(ground)

  const gridHelper = new THREE.GridHelper(Math.max(cols, rows) * 2.5, Math.max(cols, rows), 0x409eff, 0x1a3a5c)
  gridHelper.position.set(cols * 1.25 - 1.25, 0.01, rows * 1.25 - 1.25)
  scene.add(gridHelper)
}

function createSlots() {
  slotMeshes.forEach(mesh => scene.remove(mesh))
  slotMeshes = []

  const rows = props.gridData.length
  const cols = props.gridData[0]?.length || 20

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      for (let layer = 0; layer < props.totalLayers; layer++) {
        const slot = props.gridData[row]?.[col]?.[layer] || { status: 'EMPTY', row: row + 1, col: col + 1, layer: layer + 1 }
        
        const geometry = new THREE.BoxGeometry(2, 2.5, 2)
        let color = 0x3a3f5c
        
        if (slot.status !== 'EMPTY') {
          if (slot.isDanger) {
            color = 0xf56c6c
          } else if (slot.isReefer) {
            color = 0x67c23a
          } else {
            color = 0x409eff
          }
        }

        const material = new THREE.MeshStandardMaterial({
          color: color,
          transparent: true,
          opacity: slot.status === 'EMPTY' ? 0.2 : 0.9,
          roughness: 0.3,
          metalness: 0.7
        })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(
          col * 2.5,
          layer * 2.6 + 1.25,
          row * 2.5
        )
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.userData = { ...slot, row: row + 1, col: col + 1, layer: layer + 1 }
        
        if (slot.status !== 'EMPTY') {
          const edges = new THREE.EdgesGeometry(geometry)
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
          const wireframe = new THREE.LineSegments(edges, lineMaterial)
          mesh.add(wireframe)
        }

        scene.add(mesh)
        slotMeshes.push(mesh)
      }
    }
  }
}

function getSlotColor(slot) {
  if (slot.status === 'EMPTY') return 0x3a3f5c
  if (slot.isDanger) return 0xf56c6c
  if (slot.isReefer) return 0x67c23a
  return 0x409eff
}

function animate() {
  animationId = requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

function onWindowResize() {
  if (!containerRef.value) return
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function onMouseMove(event) {
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(slotMeshes)

  if (intersects.length > 0) {
    const mesh = intersects[0].object
    hoveredSlot.value = mesh.userData
    document.body.style.cursor = 'pointer'
  } else {
    hoveredSlot.value = null
    document.body.style.cursor = 'default'
  }
}

function onClick(event) {
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(slotMeshes)

  if (intersects.length > 0) {
    emit('slot-click', intersects[0].object.userData)
  }
}

function getStatusText(status) {
  const map = {
    EMPTY: '空箱位',
    OCCUPIED: '已占用',
    RESERVED: '已预留'
  }
  return map[status] || status
}

function resetView() {
  camera.position.set(30, 40, 50)
  controls.reset()
}

function toggleAutoRotate() {
  autoRotate.value = !autoRotate.value
  controls.autoRotate = autoRotate.value
}

watch(() => props.gridData, () => {
  if (scene) {
    createSlots()
  }
}, { deep: true })

watch(autoRotate, (val) => {
  if (controls) {
    controls.autoRotate = val
  }
})

onMounted(() => {
  init()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer) {
    renderer.dispose()
    if (containerRef.value && renderer.domElement) {
      containerRef.value.removeChild(renderer.domElement)
    }
  }
  window.removeEventListener('resize', onWindowResize)
})
</script>

<style scoped>
.yard-slot-3d {
  background: rgba(20, 28, 48, 0.8);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.yard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.yard-title {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.yard-controls {
  display: flex;
  gap: 12px;
}

.three-container {
  flex: 1;
  width: 100%;
  min-height: 400px;
  border-radius: 4px;
  overflow: hidden;
}

.slot-tooltip {
  position: absolute;
  top: 70px;
  right: 20px;
  background: rgba(20, 28, 48, 0.95);
  border: 1px solid rgba(64, 158, 255, 0.3);
  border-radius: 8px;
  padding: 12px;
  min-width: 200px;
  z-index: 100;
}

.tooltip-title {
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.2);
}

.tooltip-row {
  font-size: 13px;
  color: #a8b2c1;
  margin-bottom: 4px;
}
</style>
