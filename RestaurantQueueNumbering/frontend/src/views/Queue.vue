<template>
  <div class="page-container">
    <van-nav-bar
      title="取号"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <div class="content-wrapper">
      <div v-if="loading" class="loading-center">
        <van-loading size="24px">加载中...</van-loading>
      </div>

      <div v-else>
        <div class="card">
          <h2 style="font-size: 20px; font-weight: 600;">{{ restaurant?.name }}</h2>
          <p class="text-gray" style="margin-top: 8px;">
            <van-icon name="location-o" /> {{ restaurant?.address }}
          </p>
        </div>

        <div class="card">
          <h3 style="font-weight: 600; margin-bottom: 12px;">选择桌型</h3>
          <div v-if="tableTypes.length === 0" class="text-gray text-center py-4">
            暂无可用桌型
          </div>
          <div
            v-for="table in tableTypes"
            :key="table.id"
            class="table-type-item"
            :class="{ active: selectedTable?.id === table.id }"
            @click="selectTable(table)"
          >
            <div class="flex-between">
              <div>
                <span style="font-weight: 600; font-size: 16px;">{{ table.name }}</span>
                <span class="text-gray" style="margin-left: 8px;">
                  {{ table.min_people }}-{{ table.max_people }}人
                </span>
              </div>
              <van-tag
                :type="table.queue_length > 10 ? 'danger' : table.queue_length > 5 ? 'warning' : 'success'"
              >
                等待 {{ table.queue_length }} 桌
              </van-tag>
            </div>
            <div class="text-gray" style="margin-top: 8px; font-size: 13px;">
              <span>约 {{ table.avg_serve_time }} 分钟/桌</span>
              <span style="margin-left: 20px;">共 {{ table.total_tables }} 桌</span>
              <span v-if="table.queue_length > 0" style="margin-left: 20px;">
                预估等待 {{ table.queue_length * table.avg_serve_time }} 分钟
              </span>
            </div>
          </div>
        </div>

        <div class="card" v-if="selectedTable">
          <h3 style="font-weight: 600; margin-bottom: 12px;">用餐人数</h3>
          <van-stepper
            v-model="peopleCount"
            :min="selectedTable.min_people"
            :max="selectedTable.max_people"
            input-width="40px"
            button-size="28px"
          />
          <p class="text-gray" style="margin-top: 8px; font-size: 13px;">
            请选择与实际用餐人数相符的人数，方便为您安排合适的桌位
          </p>
        </div>

        <van-button
          type="primary"
          size="large"
          block
          :disabled="!selectedTable || submitting"
          class="btn-primary"
          style="margin-top: 20px;"
          @click="submitQueue"
        >
          {{ submitting ? '取号中...' : '立即取号' }}
        </van-button>
      </div>
    </div>

    <van-popup v-model:show="showSuccess" round position="bottom" :style="{ height: '60%' }">
      <div class="success-content">
        <div class="queue-number-display">{{ newQueue?.queue_no }}</div>
        <h3 style="text-align: center; color: #333;">取号成功！</h3>
        <div style="text-align: center; margin-top: 16px;">
          <p style="color: #666;">
            当前等待：<span class="text-primary" style="font-size: 20px; font-weight: 600;">
              {{ newQueue?.position }}
            </span> 桌
          </p>
          <p style="color: #666; margin-top: 8px;">
            预估等待：<span class="text-warning">{{ newQueue?.estimated_wait_time }} 分钟</span>
          </p>
        </div>
        <div style="padding: 20px;">
          <van-button type="primary" block @click="goToMyQueue">查看我的排队</van-button>
          <van-button plain block style="margin-top: 10px;" @click="showSuccess = false">
            继续取号
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { restaurantApi, queueApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const restaurantId = ref(route.params.restaurantId)
const loading = ref(true)
const submitting = ref(false)
const restaurant = ref(null)
const tableTypes = ref([])
const selectedTable = ref(null)
const peopleCount = ref(1)
const newQueue = ref(null)
const showSuccess = ref(false)

onMounted(() => {
  loadData()
})

async function loadData() {
  try {
    loading.value = true
    const data = await restaurantApi.detail(restaurantId.value)
    restaurant.value = data.restaurant
    tableTypes.value = data.table_types
    if (tableTypes.value.length > 0) {
      selectTable(tableTypes.value[0])
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function selectTable(table) {
  selectedTable.value = table
  peopleCount.value = table.min_people
}

async function submitQueue() {
  if (!selectedTable.value) {
    showToast('请选择桌型')
    return
  }

  try {
    submitting.value = true
    newQueue.value = await queueApi.create({
      restaurant_id: Number(restaurantId.value),
      table_type_id: selectedTable.value.id,
      user_id: userStore.userInfo.id,
      user_phone: userStore.userInfo.phone,
      people_count: peopleCount.value
    })
    showSuccess.value = true
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

function goToMyQueue() {
  showSuccess.value = false
  router.push('/my-queue')
}
</script>

<style lang="less" scoped>
.table-type-item {
  padding: 16px;
  border: 2px solid #eee;
  border-radius: 10px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;

  &.active {
    border-color: #1989fa;
    background: #e8f3ff;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.success-content {
  padding: 30px 20px;
}
</style>
