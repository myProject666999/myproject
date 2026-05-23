<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">购物清单</h1>
      <div>
        <el-button :icon="ArrowLeft" @click="changeWeek(-1)">上一周</el-button>
        <el-date-picker
          v-model="weekStartDate"
          type="date"
          placeholder="选择日期"
          :picker-options="pickerOptions"
          @change="fetchShoppingList"
          style="margin: 0 12px"
        />
        <el-button :icon="ArrowRight" @click="changeWeek(1)">下一周</el-button>
      </div>
    </div>

    <div class="action-bar" style="margin-bottom: 20px">
      <el-button
        type="primary"
        :icon="Refresh"
        :loading="generating"
        @click="generateShoppingList"
      >
        生成购物清单
      </el-button>
      <el-button
        v-if="shoppingList.length > 0"
        :icon="Printer"
        @click="window.print()"
      >
        打印清单
      </el-button>
    </div>

    <div v-loading="loading" class="shopping-list-wrapper">
      <div v-if="shoppingList.length > 0" class="shopping-list">
        <div
          v-for="item in shoppingList"
          :key="item.id"
          class="shopping-list-item"
          :class="{ checked: item.is_checked }"
        >
          <el-checkbox
            :model-value="item.is_checked"
            @change="toggleItem(item.id, $event)"
          />
          <span class="item-name">{{ item.ingredient_name }}</span>
          <span class="item-amount">{{ item.total_amount }}</span>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <p>购物清单为空</p>
        <p style="font-size: 14px; margin-top: 8px">
          请先在<a href="/menu" style="color: #409eff">菜单规划</a>中添加菜谱，然后点击"生成购物清单"
        </p>
        <el-button
          type="primary"
          style="margin-top: 16px"
          @click="$router.push('/menu')"
        >
          去规划菜单
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Refresh, Printer } from '@element-plus/icons-vue'
import { menuAPI } from '../api'

const loading = ref(false)
const generating = ref(false)
const weekStartDate = ref(new Date())
const shoppingList = ref([])

const pickerOptions = {
  disabledDate: (time) => {
    return time.getDay() !== 1
  }
}

const getMonday = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

const fetchShoppingList = async () => {
  loading.value = true
  try {
    const monday = getMonday(weekStartDate.value)
    const res = await menuAPI.getShoppingList({
      week_start_date: monday.toISOString().split('T')[0]
    })
    shoppingList.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const generateShoppingList = async () => {
  generating.value = true
  try {
    const monday = getMonday(weekStartDate.value)
    const res = await menuAPI.generateShoppingList({
      week_start_date: monday.toISOString().split('T')[0]
    })
    shoppingList.value = res.data
    ElMessage.success('购物清单已生成')
  } catch (error) {
    console.error(error)
  } finally {
    generating.value = false
  }
}

const toggleItem = async (id, isChecked) => {
  try {
    await menuAPI.toggleShoppingItem(id, { is_checked: isChecked })
    const item = shoppingList.value.find(i => i.id === id)
    if (item) {
      item.is_checked = isChecked
    }
  } catch (error) {
    console.error(error)
  }
}

const changeWeek = (direction) => {
  const current = getMonday(weekStartDate.value)
  current.setDate(current.getDate() + direction * 7)
  weekStartDate.value = current
  fetchShoppingList()
}

onMounted(() => {
  weekStartDate.value = getMonday(new Date())
  fetchShoppingList()
})
</script>

<style scoped>
.shopping-list-wrapper {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.shopping-list {
  max-width: 600px;
}

.shopping-list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #f5f7fa;
  transition: background 0.2s;
}

.shopping-list-item:hover {
  background: #ecf5ff;
}

.shopping-list-item.checked {
  opacity: 0.6;
}

.shopping-list-item.checked .item-name {
  text-decoration: line-through;
}

.item-name {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}

.item-amount {
  color: #909399;
  font-size: 14px;
}

@media print {
  .page-header,
  .action-bar {
    display: none;
  }

  .shopping-list-wrapper {
    box-shadow: none;
  }
}
</style>
