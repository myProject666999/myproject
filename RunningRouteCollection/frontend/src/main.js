const { createApp, ref, computed, onMounted, onUnmounted } = Vue
const { createRouter, createWebHashHistory, useRoute, useRouter } = VueRouter
const { ElMessage, ElMessageBox } = ElementPlus

const styleText = `
.route-list {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  max-width: 1280px;
  margin: 0 auto;
}
.route-list .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}
.route-list .header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.route-list .header-left h1 {
  font-size: 24px;
  color: #303133;
  margin: 0;
}
.route-list .header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.route-list .search-input {
  width: 220px;
}
.route-list .filter-select {
  width: 110px;
}
.route-list .route-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 8px;
  height: 100%;
}
.route-list .route-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}
.route-list .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.route-list .route-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}
.route-list .card-info {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.route-list .info-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  color: #606266;
}
.route-list .card-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.route-list .pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-bottom: 20px;
}

.route-edit {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.route-edit .edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}
.route-edit .edit-header h2 {
  font-size: 18px;
  color: #303133;
  margin: 0;
}
.route-edit .edit-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}
.route-edit .form-panel {
  width: 380px;
  background: #fff;
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid #e4e7ed;
  flex-shrink: 0;
}
.route-edit .map-panel {
  flex: 1;
  position: relative;
  min-width: 0;
}
.route-edit .map-container {
  width: 100%;
  height: 100%;
}
.route-edit .hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
.route-edit .tips {
  background: #f4f4f5;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
  line-height: 1.8;
}
.route-edit .tips p {
  margin: 0;
}
.route-edit .stat-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}
.route-edit .stat-item {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}
.route-edit .stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}
.route-edit .stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #409EFF;
}
.route-edit .stat-value.small {
  font-size: 11px;
  font-weight: 400;
}

.route-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.route-detail .detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}
.route-detail .detail-header h2 {
  font-size: 18px;
  color: #303133;
  margin: 0;
}
.route-detail .header-actions {
  display: flex;
  gap: 8px;
}
.route-detail .detail-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}
.route-detail .info-panel {
  width: 400px;
  background: #fff;
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid #e4e7ed;
  flex-shrink: 0;
}
.route-detail .stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}
.route-detail .stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
}
.route-detail .stat-label {
  font-size: 12px;
  color: #909399;
}
.route-detail .stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.route-detail .description-section {
  margin-bottom: 20px;
}
.route-detail .description-section h3 {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
}
.route-detail .description-section p {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
}
.route-detail .point-section {
  margin-bottom: 20px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}
.route-detail .point-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
  color: #606266;
}
.route-detail .comments-section h3 {
  font-size: 14px;
  color: #303133;
  margin-bottom: 12px;
}
.route-detail .comment-input {
  margin-bottom: 16px;
}
.route-detail .comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.route-detail .rating-section {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #606266;
}
.route-detail .comment-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 8px;
}
.route-detail .comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.route-detail .user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.route-detail .username {
  font-size: 13px;
  color: #303133;
}
.route-detail .comment-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  margin: 0;
}
.route-detail .comment-time {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
}
.route-detail .map-panel {
  flex: 1;
  position: relative;
  min-width: 0;
}
.route-detail .map-container {
  width: 100%;
  height: 100%;
}
.route-detail .map-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
  z-index: 10;
}
`

const styleEl = document.createElement('style')
styleEl.textContent = styleText
document.head.appendChild(styleEl)

const request = axios.create({
  baseURL: 'http://127.0.0.1:8088/api',
  timeout: 15000
})

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  error => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

const RouteList = {
  template: `
    <div class="route-list">
      <div class="header">
        <div class="header-left">
          <el-icon :size="28" color="#409EFF"><Location /></el-icon>
          <h1>跑步路线收藏</h1>
        </div>
        <div class="header-right">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索路线..."
            clearable
            class="search-input"
            @clear="fetchList"
            @keyup.enter="fetchList"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="difficultyFilter" placeholder="难度" clearable class="filter-select">
            <el-option v-for="d in 5" :key="d" :label="getDifficultyText(d)" :value="d" />
          </el-select>
          <el-button type="primary" :icon="Plus" @click="goEdit">新建路线</el-button>
        </div>
      </div>

      <div class="route-cards">
        <el-row :gutter="20">
          <el-col :span="8" v-for="route in routeList" :key="route.id" style="margin-bottom: 20px">
            <el-card shadow="hover" class="route-card" @click="goDetail(route.id)">
              <div class="card-header">
                <div class="route-name">{{ route.name }}</div>
                <el-tag :type="getDifficultyType(route.difficulty)" size="small">
                  {{ getDifficultyText(route.difficulty) }}
                </el-tag>
              </div>
              <div class="card-info">
                <div class="info-item">
                  <el-icon color="#409EFF"><Flag /></el-icon>
                  <span>{{ route.distance }} km</span>
                </div>
                <div class="info-item">
                  <el-icon color="#F56C6C"><View /></el-icon>
                  <span>{{ route.viewCount }}</span>
                </div>
                <div class="info-item">
                  <el-icon color="#E6A23C"><Star /></el-icon>
                  <span>{{ route.favoriteCount }}</span>
                </div>
                <div class="info-item">
                  <el-icon color="#67C23A"><ChatDotRound /></el-icon>
                  <span>{{ route.commentCount }}</span>
                </div>
              </div>
              <div class="card-desc">{{ route.description }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[9, 18, 27]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>

      <el-empty v-if="routeList.length === 0 && !loading" description="暂无路线，点击上方按钮创建第一条路线" />
    </div>
  `,
  setup() {
    const router = useRouter()
    const routeList = ref([])
    const page = ref(1)
    const pageSize = ref(9)
    const total = ref(0)
    const searchKeyword = ref('')
    const difficultyFilter = ref(null)
    const loading = ref(false)

    const fetchList = async () => {
      loading.value = true
      try {
        const params = { page: page.value, size: pageSize.value }
        if (searchKeyword.value) params.keyword = searchKeyword.value
        if (difficultyFilter.value) params.difficulty = difficultyFilter.value
        const res = await request.get('/route/list', { params })
        routeList.value = res.data.records
        total.value = res.data.total
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    const goEdit = () => router.push('/route/edit')
    const goDetail = (id) => router.push(`/route/detail/${id}`)

    const getDifficultyText = (d) => {
      const texts = ['', '轻松', '简单', '中等', '困难', '挑战']
      return texts[d] || ''
    }

    const getDifficultyType = (d) => {
      const types = ['', 'success', 'success', 'warning', 'danger', 'danger']
      return types[d] || ''
    }

    onMounted(fetchList)

    return {
      routeList, page, pageSize, total, searchKeyword, difficultyFilter, loading,
      fetchList, goEdit, goDetail, getDifficultyText, getDifficultyType,
      Plus: ElementPlusIconsVue.Plus,
      Search: ElementPlusIconsVue.Search,
      Location: ElementPlusIconsVue.Location,
      Flag: ElementPlusIconsVue.Flag,
      View: ElementPlusIconsVue.View,
      Star: ElementPlusIconsVue.Star,
      ChatDotRound: ElementPlusIconsVue.ChatDotRound
    }
  }
}

const RouteEdit = {
  template: `
    <div class="route-edit">
      <div class="edit-header">
        <el-button :icon="ArrowLeft" @click="goBack" text>返回列表</el-button>
        <h2>{{ isEdit ? '编辑路线' : '新建路线' }}</h2>
        <el-button type="primary" :icon="Check" @click="saveRoute" :loading="saving">保存路线</el-button>
      </div>

      <div class="edit-content">
        <div class="form-panel">
          <el-form :model="routeForm" label-position="top">
            <el-form-item label="路线名称" required>
              <el-input v-model="routeForm.name" placeholder="请输入路线名称" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="路线描述">
              <el-input v-model="routeForm.description" type="textarea" :rows="3" placeholder="请描述这条路线的特点" />
            </el-form-item>
            <el-form-item label="距离 (km)">
              <el-input-number v-model="routeForm.distance" :precision="2" :min="0" :step="0.1" style="width: 100%" />
              <div class="hint" v-if="polyline.length >= 2">地图自动计算: {{ autoDistance }} km</div>
              <el-button size="small" type="primary" text @click="useAutoDistance" v-if="polyline.length >= 2">
                使用自动计算值
              </el-button>
            </el-form-item>
            <el-form-item label="难度评级">
              <el-rate v-model="routeForm.difficulty" :max="5" :colors="['#67C23A', '#E6A23C', '#F56C6C']" />
              <div class="hint">1轻松 2简单 3中等 4困难 5挑战</div>
            </el-form-item>
            <el-form-item label="操作说明">
              <div class="tips">
                <p>1. 点击地图添加路线拐点</p>
                <p>2. 双击地图或点击"完成绘制"结束路线</p>
                <p>3. 点击"清空"清除已绘制的路线</p>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button :type="drawing ? 'success' : 'primary'" @click="toggleDrawing">
                {{ drawing ? '完成绘制' : '开始绘制' }}
              </el-button>
              <el-button type="danger" @click="clearPolyline">清空路线</el-button>
              <el-button @click="undoLastPoint" :disabled="polyline.length === 0">撤销上一点</el-button>
            </el-form-item>
          </el-form>
          <div class="stat-panel">
            <div class="stat-item">
              <div class="stat-label">拐点数量</div>
              <div class="stat-value">{{ polyline.length }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">距离</div>
              <div class="stat-value">{{ autoDistance }} km</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">起点</div>
              <div class="stat-value small">{{ startPointText }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">终点</div>
              <div class="stat-value small">{{ endPointText }}</div>
            </div>
          </div>
        </div>
        <div class="map-panel">
          <div id="mapContainer" class="map-container"></div>
        </div>
      </div>
    </div>
  `,
  setup() {
    const route = useRoute()
    const router = useRouter()
    const isEdit = ref(!!route.params.id)
    const saving = ref(false)
    const drawing = ref(false)
    let map = null
    const polyline = ref([])
    let polylineOverlay = null
    let startMarker = null
    let endMarker = null

    const routeForm = ref({
      id: null,
      name: '',
      description: '',
      distance: 0,
      difficulty: 3
    })

    const autoDistance = ref('0.00')
    const startPointText = ref('--')
    const endPointText = ref('--')

    const initMap = () => {
      map = new AMap.Map('mapContainer', {
        zoom: 13,
        center: [116.397428, 39.90923],
        viewMode: '2D'
      })
      map.on('click', handleMapClick)
      map.on('dblclick', handleMapDblClick)
    }

    const handleMapClick = (e) => {
      if (!drawing.value) return
      const { lng, lat } = e.lnglat
      polyline.value.push({ lng, lat })
      updatePolyline()
      updateDistance()
    }

    const handleMapDblClick = () => {
      if (drawing.value) {
        drawing.value = false
        ElMessage.success('路线绘制完成')
      }
    }

    const updatePolyline = () => {
      if (polylineOverlay) { map.remove(polylineOverlay); polylineOverlay = null }
      if (startMarker) { map.remove(startMarker); startMarker = null }
      if (endMarker) { map.remove(endMarker); endMarker = null }

      if (polyline.value.length > 0) {
        const path = polyline.value.map(p => [p.lng, p.lat])
        polylineOverlay = new AMap.Polyline({
          path,
          strokeColor: '#409EFF',
          strokeWeight: 5,
          strokeOpacity: 0.8,
          lineJoin: 'round'
        })
        map.add(polylineOverlay)

        const first = polyline.value[0]
        const last = polyline.value[polyline.value.length - 1]
        startPointText.value = first.lng.toFixed(6) + ', ' + first.lat.toFixed(6)
        endPointText.value = last.lng.toFixed(6) + ', ' + last.lat.toFixed(6)

        startMarker = new AMap.Marker({
          position: [first.lng, first.lat],
          label: { content: '起点', direction: 'top' }
        })
        if (polyline.value.length > 1) {
          endMarker = new AMap.Marker({
            position: [last.lng, last.lat],
            label: { content: '终点', direction: 'top' }
          })
        }
        map.add([startMarker])
        if (endMarker) map.add([endMarker])
      }
    }

    const updateDistance = () => {
      if (polyline.value.length < 2) { autoDistance.value = '0.00'; return }
      let total = 0
      for (let i = 1; i < polyline.value.length; i++) {
        const p1 = polyline.value[i - 1]
        const p2 = polyline.value[i]
        total += calcDist(p1.lng, p1.lat, p2.lng, p2.lat)
      }
      autoDistance.value = total.toFixed(2)
    }

    const calcDist = (lng1, lat1, lng2, lat2) => {
      const R = 6371
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLng = (lng2 - lng1) * Math.PI / 180
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    }

    const toggleDrawing = () => {
      drawing.value = !drawing.value
      if (drawing.value) ElMessage.info('点击地图添加拐点，双击结束绘制')
    }

    const clearPolyline = () => {
      ElMessageBox.confirm('确定要清空已绘制的路线吗？', '提示', { type: 'warning' }).then(() => {
        polyline.value = []
        drawing.value = false
        updatePolyline()
        autoDistance.value = '0.00'
        startPointText.value = '--'
        endPointText.value = '--'
      }).catch(() => {})
    }

    const undoLastPoint = () => {
      if (polyline.value.length > 0) {
        polyline.value.pop()
        updatePolyline()
        updateDistance()
      }
    }

    const useAutoDistance = () => { routeForm.value.distance = parseFloat(autoDistance.value) }

    const loadRouteData = async () => {
      if (!isEdit.value) return
      try {
        const res = await request.get('/route/' + route.params.id)
        const data = res.data
        routeForm.value = {
          id: data.id,
          name: data.name,
          description: data.description,
          distance: data.distance,
          difficulty: data.difficulty
        }
        polyline.value = JSON.parse(data.polyline || '[]')
        updatePolyline()
        updateDistance()
      } catch (e) { console.error(e) }
    }

    const saveRoute = async () => {
      if (!routeForm.value.name.trim()) { ElMessage.warning('请输入路线名称'); return }
      if (polyline.value.length < 2) { ElMessage.warning('请在地图上绘制至少2个点'); return }
      saving.value = true
      try {
        const first = polyline.value[0]
        const last = polyline.value[polyline.value.length - 1]
        await request.post('/route/save', {
          ...routeForm.value,
          userId: 1,
          startPoint: first.lng + ',' + first.lat,
          endPoint: last.lng + ',' + last.lat,
          polyline: JSON.stringify(polyline.value)
        })
        ElMessage.success('保存成功')
        router.push('/route/list')
      } catch (e) { console.error(e) }
      finally { saving.value = false }
    }

    const goBack = () => router.push('/route/list')

    onMounted(() => { initMap(); loadRouteData() })
    onUnmounted(() => { if (map) map.destroy() })

    return {
      isEdit, saving, drawing, polyline, routeForm,
      autoDistance, startPointText, endPointText,
      toggleDrawing, clearPolyline, undoLastPoint, useAutoDistance,
      saveRoute, goBack,
      ArrowLeft: ElementPlusIconsVue.ArrowLeft,
      Check: ElementPlusIconsVue.Check
    }
  }
}

const RouteDetail = {
  template: `
    <div class="route-detail">
      <div class="detail-header">
        <el-button :icon="ArrowLeft" @click="goBack" text>返回列表</el-button>
        <h2>{{ route.name }}</h2>
        <div class="header-actions">
          <el-button :icon="EditIcon" @click="goEdit" text>编辑</el-button>
          <el-button :type="isFavorited ? 'warning' : 'default'"
            :icon="isFavorited ? 'StarFilled' : 'Star'"
            @click="toggleFavorite">
            {{ isFavorited ? '已收藏' : '收藏' }}
          </el-button>
        </div>
      </div>

      <div class="detail-content">
        <div class="info-panel">
          <div class="stat-grid">
            <div class="stat-item">
              <el-icon :size="24" color="#409EFF"><Flag /></el-icon>
              <div class="stat-info">
                <div class="stat-label">距离</div>
                <div class="stat-value">{{ route.distance }} km</div>
              </div>
            </div>
            <div class="stat-item">
              <el-icon :size="24" color="#E6A23C"><Trophy /></el-icon>
              <div class="stat-info">
                <div class="stat-label">难度</div>
                <div class="stat-value">{{ getDifficultyText(route.difficulty) }}</div>
              </div>
            </div>
            <div class="stat-item">
              <el-icon :size="24" color="#F56C6C"><View /></el-icon>
              <div class="stat-info">
                <div class="stat-label">浏览</div>
                <div class="stat-value">{{ route.viewCount }}</div>
              </div>
            </div>
            <div class="stat-item">
              <el-icon :size="24" color="#67C23A"><Star /></el-icon>
              <div class="stat-info">
                <div class="stat-label">收藏</div>
                <div class="stat-value">{{ route.favoriteCount }}</div>
              </div>
            </div>
          </div>

          <div class="description-section">
            <h3>路线描述</h3>
            <p>{{ route.description || '暂无描述' }}</p>
          </div>

          <div class="point-section">
            <div class="point-item">
              <el-tag type="success" size="small">起点</el-tag>
              <span>{{ route.startPoint }}</span>
            </div>
            <div class="point-item">
              <el-tag type="danger" size="small">终点</el-tag>
              <span>{{ route.endPoint }}</span>
            </div>
          </div>

          <div class="comments-section">
            <div class="comments-header">
              <h3>跑友评论 ({{ route.commentCount }})</h3>
            </div>
            <div class="comment-input">
              <el-input v-model="newComment.content" type="textarea" :rows="2" placeholder="分享你的跑步体验..." />
              <div class="comment-actions">
                <div class="rating-section">
                  <span>评分:</span>
                  <el-rate v-model="newComment.rating" :max="5" />
                </div>
                <el-button type="primary" @click="submitComment">发表评论</el-button>
              </div>
            </div>
            <div class="comments-list">
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <div class="comment-header">
                  <div class="user-info">
                    <el-avatar :size="32" style="background:#409EFF">{{ comment.userId }}</el-avatar>
                    <span class="username">跑友{{ comment.userId }}</span>
                  </div>
                  <el-rate :model-value="comment.rating" disabled size="small" />
                </div>
                <p class="comment-content">{{ comment.content }}</p>
                <div class="comment-time">{{ formatTime(comment.createTime) }}</div>
              </div>
              <el-empty v-if="comments.length === 0" description="暂无评论，快来发表第一条评论吧" />
            </div>
          </div>
        </div>

        <div class="map-panel">
          <div id="detailMap" class="map-container"></div>
          <div class="map-controls">
            <el-button :type="playing ? 'success' : 'primary'" @click="togglePlay">
              {{ playing ? '暂停回放' : '开始回放' }}
            </el-button>
            <el-button @click="resetView">重置视图</el-button>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    const routeInfo = useRoute()
    const router = useRouter()
    const routeId = routeInfo.params.id
    const routeData = ref({})
    const route = computed(() => routeData.value)
    const comments = ref([])
    const isFavorited = ref(false)
    const newComment = ref({ content: '', rating: 5 })
    let map = null
    let polylineOverlay = null
    let startMarker = null
    let endMarker = null
    let playMarker = null
    const playing = ref(false)
    let playIndex = 0
    let playTimer = null

    const loadDetail = async () => {
      try {
        const res = await request.get('/route/' + routeId)
        routeData.value = res.data
        initMap()
      } catch (e) { console.error(e) }
    }

    const loadComments = async () => {
      try {
        const res = await request.get('/comment/list', { params: { routeId } })
        comments.value = res.data
      } catch (e) { console.error(e) }
    }

    const checkFavorite = async () => {
      try {
        const res = await request.get('/favorite/check', { params: { userId: 1, routeId } })
        isFavorited.value = res.data.isFavorited
      } catch (e) { console.error(e) }
    }

    const initMap = () => {
      const pl = JSON.parse(routeData.value.polyline || '[]')
      if (pl.length === 0) return
      const lats = pl.map(p => p.lat), lngs = pl.map(p => p.lng)
      const sw = [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01]
      const ne = [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01]
      map = new AMap.Map('detailMap', { viewMode: '2D' })
      map.setBounds(new AMap.Bounds(sw, ne))
      const path = pl.map(p => [p.lng, p.lat])
      polylineOverlay = new AMap.Polyline({ path, strokeColor: '#409EFF', strokeWeight: 5, strokeOpacity: 0.8, lineJoin: 'round' })
      map.add(polylineOverlay)
      startMarker = new AMap.Marker({ position: [pl[0].lng, pl[0].lat], label: { content: '起点', direction: 'top' } })
      endMarker = new AMap.Marker({ position: [pl[pl.length-1].lng, pl[pl.length-1].lat], label: { content: '终点', direction: 'top' } })
      map.add([startMarker, endMarker])
    }

    const togglePlay = () => {
      const pl = JSON.parse(routeData.value.polyline || '[]')
      if (pl.length === 0) return
      playing.value ? stopPlay() : startPlay(pl)
    }

    const startPlay = (pl) => {
      playing.value = true
      playIndex = 0
      if (playMarker) map.remove(playMarker)
      playMarker = new AMap.Marker({
        position: [pl[0].lng, pl[0].lat],
        icon: new AMap.Icon({
          size: new AMap.Size(32, 32),
          image: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="10" fill="#F56C6C" stroke="#fff" stroke-width="3"/></svg>'),
          imageSize: new AMap.Size(32, 32)
        }),
        offset: new AMap.Pixel(-16, -16)
      })
      map.add(playMarker)
      playTimer = setInterval(() => {
        if (playIndex >= pl.length - 1) { stopPlay(); return }
        playIndex++
        playMarker.setPosition([pl[playIndex].lng, pl[playIndex].lat])
      }, 500)
    }

    const stopPlay = () => {
      playing.value = false
      if (playTimer) { clearInterval(playTimer); playTimer = null }
    }

    const resetView = () => {
      const pl = JSON.parse(routeData.value.polyline || '[]')
      if (pl.length === 0) return
      const lats = pl.map(p => p.lat), lngs = pl.map(p => p.lng)
      map.setBounds(new AMap.Bounds(
        [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01],
        [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01]
      ))
      stopPlay()
    }

    const toggleFavorite = async () => {
      try {
        await request.post('/favorite/toggle', null, { params: { userId: 1, routeId } })
        isFavorited.value = !isFavorited.value
        ElMessage.success(isFavorited.value ? '收藏成功' : '取消收藏')
        routeData.value.favoriteCount += isFavorited.value ? 1 : -1
      } catch (e) { console.error(e) }
    }

    const submitComment = async () => {
      if (!newComment.value.content.trim()) { ElMessage.warning('请输入评论内容'); return }
      try {
        await request.post('/comment/add', { routeId, userId: 1, content: newComment.value.content, rating: newComment.value.rating })
        ElMessage.success('评论成功')
        newComment.value = { content: '', rating: 5 }
        loadComments()
        routeData.value.commentCount++
      } catch (e) { console.error(e) }
    }

    const getDifficultyText = (d) => ['', '轻松', '简单', '中等', '困难', '挑战'][d] || ''
    const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : ''
    const goBack = () => router.push('/route/list')
    const goEdit = () => router.push('/route/edit/' + routeId)

    onMounted(() => { loadDetail(); loadComments(); checkFavorite() })
    onUnmounted(() => { stopPlay(); if (map) map.destroy() })

    return {
      route, comments, isFavorited, newComment, playing,
      togglePlay, resetView, toggleFavorite, submitComment,
      getDifficultyText, formatTime, goBack, goEdit,
      ArrowLeft: ElementPlusIconsVue.ArrowLeft,
      EditIcon: ElementPlusIconsVue.Edit,
      Star: ElementPlusIconsVue.Star,
      StarFilled: ElementPlusIconsVue.StarFilled,
      Flag: ElementPlusIconsVue.Flag,
      Trophy: ElementPlusIconsVue.Trophy,
      View: ElementPlusIconsVue.View
    }
  }
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/route/list' },
    { path: '/route/list', component: RouteList },
    { path: '/route/edit/:id?', component: RouteEdit },
    { path: '/route/detail/:id', component: RouteDetail }
  ]
})

const app = createApp({ template: '<router-view />' })

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.mount('#app')
