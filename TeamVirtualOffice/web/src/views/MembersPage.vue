<template>
  <div class="members-page">
    <el-card class="header-card" shadow="never">
      <div class="page-header">
        <div class="header-left">
          <el-button :icon="ArrowLeft" circle @click="goBack" />
          <div class="header-info">
            <h1>Team Members</h1>
            <p>View all team members and their current status</p>
          </div>
        </div>
        <div class="header-right">
          <el-tag type="success">{{ onlineCount }} online</el-tag>
          <el-tag type="info">{{ members.length }} total</el-tag>
        </div>
      </div>
    </el-card>
    <el-card class="filters-card" shadow="never">
      <div class="filters-row">
        <el-input
          v-model="searchQuery"
          placeholder="Search members..."
          :prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-select
          v-model="statusFilter"
          placeholder="Filter by status"
          clearable
          class="status-filter"
        >
          <el-option label="All Status" value="" />
          <el-option label="Online" value="online">
            <span class="filter-option">
              <span class="status-dot online"></span> Online
            </span>
          </el-option>
          <el-option label="Busy" value="busy">
            <span class="filter-option">
              <span class="status-dot busy"></span> Busy
            </span>
          </el-option>
          <el-option label="Away" value="away">
            <span class="filter-option">
              <span class="status-dot away"></span> Away
            </span>
          </el-option>
          <el-option label="Offline" value="offline">
            <span class="filter-option">
              <span class="status-dot offline"></span> Offline
            </span>
          </el-option>
        </el-select>
        <el-button type="primary" @click="refreshMembers">
          <el-icon><Refresh /></el-icon>
          Refresh
        </el-button>
      </div>
    </el-card>
    <el-card class="table-card" shadow="never">
      <el-table
        :data="filteredMembers"
        style="width: 100%"
        :loading="loading"
        stripe
      >
        <el-table-column label="Member" min-width="200">
          <template #default="{ row }">
            <div class="member-cell">
              <div class="avatar-wrapper">
                <el-avatar :size="44">
                  {{ (row.nickname || row.username)?.charAt(0) }}
                </el-avatar>
                <span class="status-indicator" :class="row.status"></span>
              </div>
              <div class="member-details">
                <span class="member-name">{{ row.nickname || row.username }}</span>
                <span class="member-username">@{{ row.username }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small" effect="light">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Busy Mode" width="120">
          <template #default="{ row }">
            <el-switch
              v-model="row.busyMode"
              size="small"
              inactive-text="DND"
              disabled
            />
          </template>
        </el-table-column>
        <el-table-column prop="textStatus" label="Status Text" min-width="180">
          <template #default="{ row }">
            <span class="text-status">{{ row.textStatus || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="currentRoom" label="Current Room" min-width="150">
          <template #default="{ row }">
            <el-tag v-if="row.currentRoom" type="info" size="small">
              {{ row.currentRoom }}
            </el-tag>
            <span v-else class="no-room">-</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-tooltip content="Voice Call" placement="top">
                <el-button
                  :icon="Phone"
                  circle
                  size="small"
                  type="success"
                  :disabled="row.status === 'offline'"
                  @click="callUser(row, 'voice')"
                />
              </el-tooltip>
              <el-tooltip content="Video Call" placement="top">
                <el-button
                  :icon="VideoCamera"
                  circle
                  size="small"
                  type="primary"
                  :disabled="row.status === 'offline'"
                  @click="callUser(row, 'video')"
                />
              </el-tooltip>
              <el-tooltip content="Send Message" placement="top">
                <el-button
                  :icon="ChatDotRound"
                  circle
                  size="small"
                  type="warning"
                  :disabled="row.status === 'offline'"
                  @click="sendMessage(row)"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper" v-if="filteredMembers.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredMembers.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Search,
  Refresh,
  Phone,
  VideoCamera,
  ChatDotRound
} from '@element-plus/icons-vue'
import { useWsStore } from '@/stores/ws'
import request from '@/utils/request'

const router = useRouter()
const wsStore = useWsStore()

const members = ref([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const onlineCount = computed(() => {
  return members.value.filter(m => m.status !== 'offline').length
})

const filteredMembers = computed(() => {
  let result = [...members.value]
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m =>
      (m.nickname || m.username).toLowerCase().includes(query) ||
      m.username.toLowerCase().includes(query)
    )
  }
  if (statusFilter.value) {
    result = result.filter(m => m.status === statusFilter.value)
  }
  return result
})

function getStatusType(status) {
  const types = {
    online: 'success',
    busy: 'warning',
    away: 'danger',
    offline: 'info'
  }
  return types[status] || 'info'
}

function goBack() {
  router.push('/office')
}

async function fetchMembers() {
  loading.value = true
  try {
    const response = await request.get('/api/user/list')
    members.value = response.data || []
  } catch (e) {
    ElMessage.error('Failed to fetch members')
  } finally {
    loading.value = false
  }
}

function refreshMembers() {
  fetchMembers()
  ElMessage.success('Refreshed')
}

function callUser(user, type) {
  wsStore.startCall(user.id, type)
  ElMessage.info(`Starting ${type} call with ${user.nickname || user.username}`)
}

function sendMessage(user) {
  ElMessage.info(`Opening chat with ${user.nickname || user.username}`)
}

onMounted(() => {
  fetchMembers()
})
</script>

<style lang="scss" scoped>
.members-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;

  .header-card {
    margin-bottom: 16px;
    border-radius: 12px;

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;

        .header-info {
          h1 {
            margin: 0 0 4px 0;
            color: #303133;
            font-size: 20px;
            font-weight: 600;
          }

          p {
            margin: 0;
            color: #909399;
            font-size: 14px;
          }
        }
      }

      .header-right {
        display: flex;
        gap: 12px;
      }
    }
  }

  .filters-card {
    margin-bottom: 16px;
    border-radius: 12px;

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;

      .search-input {
        flex: 1;
        max-width: 320px;
      }

      .status-filter {
        width: 180px;
      }
    }
  }

  .table-card {
    border-radius: 12px;

    .member-cell {
      display: flex;
      align-items: center;
      gap: 12px;

      .avatar-wrapper {
        position: relative;

        .status-indicator {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #fff;

          &.online {
            background: #67c23a;
          }

          &.busy {
            background: #e6a23c;
          }

          &.away {
            background: #f56c6c;
          }

          &.offline {
            background: #909399;
          }
        }
      }

      .member-details {
        display: flex;
        flex-direction: column;

        .member-name {
          font-weight: 500;
          color: #303133;
          font-size: 14px;
        }

        .member-username {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .text-status {
      color: #606266;
      font-size: 13px;
    }

    .no-room {
      color: #c0c4cc;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.online {
      background: #67c23a;
    }

    &.busy {
      background: #e6a23c;
    }

    &.away {
      background: #f56c6c;
    }

    &.offline {
      background: #909399;
    }
  }
}
</style>
