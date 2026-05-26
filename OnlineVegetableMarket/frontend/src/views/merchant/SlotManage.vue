<template>
  <div>
    <div style="display: flex; gap: 8px; margin-bottom: 16px; align-items: center;">
      <span>日期:</span>
      <input
        v-model="selectedDate"
        type="date"
        class="form-input"
        style="max-width: 200px;"
      />
      <van-button type="primary" @click="loadSlots">查询</van-button>
      <van-button plain @click="showGenerate = true">批量生成</van-button>
      <van-button type="success" @click="showCreate = true">+ 新增时段</van-button>
    </div>
    
    <div class="merchant-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>日期</th>
            <th>时段</th>
            <th>最大订单数</th>
            <th>已预约</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="slot in slots" :key="slot.id">
            <td>{{ slot.id }}</td>
            <td>{{ slot.slot_date?.split('T')[0] }}</td>
            <td>{{ slot.start_time }} - {{ slot.end_time }}</td>
            <td>{{ slot.max_orders }}</td>
            <td>{{ slot.current_orders }}</td>
            <td>
              <span :class="`order-status ${slot.status === 'available' ? 'status-paid' : slot.status === 'full' ? 'status-cancelled' : 'status-refunded'}`">
                {{ slot.status === 'available' ? '可用' : slot.status === 'full' ? '已满' : '禁用' }}
              </span>
            </td>
            <td>
              <button
                v-if="slot.status !== 'disabled'"
                class="merchant-action-btn btn-warning"
                @click="toggleStatus(slot, 'disabled')"
              >禁用</button>
              <button
                v-if="slot.status === 'disabled'"
                class="merchant-action-btn btn-primary"
                @click="toggleStatus(slot, 'available')"
              >启用</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <van-popup v-model:show="showCreate" position="bottom" round style="padding: 20px;">
      <h3 style="margin-bottom: 16px;">新增时段</h3>
      <van-form @submit="saveSlot">
        <van-field
          v-model="createForm.slot_date"
          label="日期"
          type="date"
          placeholder="请选择日期"
          :rules="[{ required: true, message: '请选择日期' }]"
        />
        <van-field
          v-model="createForm.start_time"
          label="开始时间"
          placeholder="如 08:00:00"
          :rules="[{ required: true, message: '请输入开始时间' }]"
        />
        <van-field
          v-model="createForm.end_time"
          label="结束时间"
          placeholder="如 10:00:00"
          :rules="[{ required: true, message: '请输入结束时间' }]"
        />
        <van-field
          v-model="createForm.max_orders"
          type="number"
          label="最大订单数"
          placeholder="请输入最大订单数"
          :rules="[{ required: true, message: '请输入最大订单数' }]"
        />
        <van-button round block type="primary" native-type="submit" style="margin-top: 16px;">
          保存
        </van-button>
      </van-form>
    </van-popup>
    
    <van-popup v-model:show="showGenerate" position="bottom" round style="padding: 20px;">
      <h3 style="margin-bottom: 16px;">批量生成时段</h3>
      <van-form @submit="generateSlots">
        <van-field
          v-model="genForm.start_date"
          label="开始日期"
          type="date"
          placeholder="请选择开始日期"
          :rules="[{ required: true, message: '请选择开始日期' }]"
        />
        <van-field
          v-model="genForm.days"
          type="number"
          label="天数"
          placeholder="生成未来几天的时段"
        />
        <van-button round block type="primary" native-type="submit" style="margin-top: 16px;">
          生成
        </van-button>
      </van-form>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import { slotApi } from '../../api'

const slots = ref([])
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showCreate = ref(false)
const showGenerate = ref(false)

const createForm = reactive({
  slot_date: '',
  start_time: '',
  end_time: '',
  max_orders: '',
})

const genForm = reactive({
  start_date: new Date().toISOString().split('T')[0],
  days: 7,
})

async function loadSlots() {
  try {
    const res = await slotApi.getSlots({ date: selectedDate.value })
    slots.value = res.slots || []
  } catch (e) {}
}

async function saveSlot() {
  try {
    await slotApi.createSlot({
      slot_date: createForm.slot_date,
      start_time: createForm.start_time,
      end_time: createForm.end_time,
      max_orders: Number(createForm.max_orders),
    })
    showToast('创建成功')
    showCreate.value = false
    createForm.slot_date = ''
    createForm.start_time = ''
    createForm.end_time = ''
    createForm.max_orders = ''
    loadSlots()
  } catch (e) {}
}

async function generateSlots() {
  try {
    const res = await slotApi.generateSlots({
      start_date: genForm.start_date,
      days: Number(genForm.days) || 7,
    })
    showToast(`成功生成 ${res.count} 个时段`)
    showGenerate.value = false
    loadSlots()
  } catch (e) {}
}

async function toggleStatus(slot, status) {
  try {
    await slotApi.updateSlot(slot.id, { status })
    showToast('操作成功')
    loadSlots()
  } catch (e) {}
}

onMounted(loadSlots)
</script>
