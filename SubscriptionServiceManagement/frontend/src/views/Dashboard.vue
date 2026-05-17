<template>
    <div class="page-container">
        <el-row :gutter="20" class="mb20">
            <el-col :span="6">
                <div class="card stat-card">
                    <div class="stat-value">{{ stats?.activeSubscriptions || 0 }}</div>
                    <div class="stat-label">活跃订阅</div>
                </div>
            </el-col>
            <el-col :span="6">
                <div class="card stat-card">
                    <div class="stat-value" style="color: #e6a23c;">
                        ¥{{ stats?.totalMonthlyCostCNY?.toFixed(2) || '0.00' }}
                    </div>
                    <div class="stat-label">月度总支出</div>
                </div>
            </el-col>
            <el-col :span="6">
                <div class="card stat-card">
                    <div class="stat-value" style="color: #67c23a;">
                        ¥{{ stats?.totalYearlyCostCNY?.toFixed(2) || '0.00' }}
                    </div>
                    <div class="stat-label">年度总支出</div>
                </div>
            </el-col>
            <el-col :span="6">
                <div class="card stat-card">
                    <div class="stat-value" style="color: #f56c6c;">{{ stats?.upcomingRenewalsCount || 0 }}</div>
                    <div class="stat-label">30天内到期</div>
                </div>
            </el-col>
        </el-row>

        <div class="card">
            <div class="page-header">
                <h3 class="page-title">即将到期订阅</h3>
                <el-select v-model="daysFilter" @change="loadUpcoming" style="width: 150px;">
                    <el-option label="未来7天" :value="7" />
                    <el-option label="未来15天" :value="15" />
                    <el-option label="未来30天" :value="30" />
                    <el-option label="未来60天" :value="60" />
                </el-select>
            </div>
            <el-table :data="upcomingList" v-loading="loading" stripe>
                <el-table-column prop="name" label="订阅名称" min-width="120" />
                <el-table-column prop="category" label="分类" width="100" />
                <el-table-column label="价格" width="120">
                    <template #default="{ row }">
                        {{ row.currency }} {{ row.price?.toFixed(2) }}
                    </template>
                </el-table-column>
                <el-table-column prop="cycleType" label="周期" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getCycleTypeColor(row.cycleType)" size="small">
                            {{ getCycleTypeLabel(row.cycleType) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="nextRenewalDate" label="到期日期" width="120" />
                <el-table-column label="剩余天数" width="100">
                    <template #default="{ row }">
                        <span :class="getDaysClass(row.daysUntilRenewal)">
                            {{ row.daysUntilRenewal }}天
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" @click="handleRenew(row)">
                            续费
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-empty v-if="upcomingList.length === 0 && !loading" description="暂无即将到期的订阅" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUpcomingRenewals, getStatistics, renewSubscription } from '../api'

const loading = ref(false)
const upcomingList = ref([])
const stats = ref(null)
const daysFilter = ref(30)

const loadUpcoming = async () => {
    loading.value = true
    try {
        upcomingList.value = await getUpcomingRenewals(daysFilter.value)
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const loadStats = async () => {
    try {
        stats.value = await getStatistics()
    } catch (e) {
        console.error(e)
    }
}

const handleRenew = async (row) => {
    try {
        await ElMessageBox.confirm(
            `确认续费【${row.name}】？将更新下次续费日期。`,
            '续费确认',
            { type: 'warning' }
        )
        await renewSubscription(row.id)
        ElMessage.success('续费成功')
        loadUpcoming()
        loadStats()
    } catch (e) {
        if (e !== 'cancel') {
            console.error(e)
        }
    }
}

const getCycleTypeLabel = (type) => {
    const labels = { MONTHLY: '月付', YEARLY: '年付', CUSTOM: '自定义' }
    return labels[type] || type
}

const getCycleTypeColor = (type) => {
    const colors = { MONTHLY: 'primary', YEARLY: 'success', CUSTOM: 'warning' }
    return colors[type] || 'info'
}

const getDaysClass = (days) => {
    if (days <= 3) return 'days-remaining days-urgent'
    if (days <= 7) return 'days-remaining days-warning'
    return 'days-remaining days-normal'
}

onMounted(() => {
    loadUpcoming()
    loadStats()
})
</script>

<style scoped>
.mb20 {
    margin-bottom: 20px;
}
</style>
