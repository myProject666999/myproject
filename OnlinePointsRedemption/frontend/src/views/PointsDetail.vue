<template>
  <div class="points-detail-page">
    <el-row :gutter="24">
      <el-col :span="8">
        <el-card class="account-card">
          <div class="account-header">
            <el-icon :size="32" color="#f59e0b"><Wallet /></el-icon>
            <span>积分账户</span>
          </div>
          <div class="account-body">
            <div class="points-display">
              <span class="points-value">{{ account?.available_points || 0 }}</span>
              <span class="points-unit">可用积分</span>
            </div>
            <div class="points-sub">
              <span>总积分: {{ account?.total_points || 0 }}</span>
              <span>冻结: {{ account?.frozen_points || 0 }}</span>
            </div>
          </div>
        </el-card>

        <el-card class="rules-card">
          <template #header>
            <span>积分获取规则</span>
          </template>
          <div class="rule-list">
            <div class="rule-item" v-for="rule in rules" :key="rule.id">
              <div class="rule-info">
                <span class="rule-name">{{ rule.rule_name }}</span>
                <span class="rule-desc">{{ rule.description }}</span>
              </div>
              <div class="rule-points">
                +{{ rule.points }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <span>积分明细</span>
              <el-button type="primary" size="small" @click="showEarnDialog = true">
                <el-icon><Plus /></el-icon>
                获取积分
              </el-button>
            </div>
          </template>

          <el-table :data="details" style="width: 100%" v-loading="loading">
            <el-table-column prop="rule_code" label="类型" width="140">
              <template #default="{ row }">
                <el-tag :type="row.change_points > 0 ? 'success' : 'danger'" size="small">
                  {{ getRuleName(row.rule_code) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="变动积分" width="120">
              <template #default="{ row }">
                <span :class="row.change_points > 0 ? 'text-success' : 'text-danger'">
                  {{ row.change_points > 0 ? '+' : '' }}{{ row.change_points }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="balance_before" label="变动前" width="100" />
            <el-table-column prop="balance_after" label="变动后" width="100" />
            <el-table-column prop="remark" label="备注" min-width="200" />
            <el-table-column prop="created_at" label="时间" width="180" />
          </el-table>

          <div class="pagination-wrap">
            <el-pagination
              v-model:current-page="page"
              :page-size="pageSize"
              :total="total"
              layout="prev, pager, next"
              @current-change="loadDetails"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showEarnDialog" title="获取积分" width="400px">
      <el-form :model="earnForm" label-width="80px">
        <el-form-item label="规则">
          <el-select v-model="earnForm.rule_code" placeholder="请选择规则">
            <el-option
              v-for="rule in earnRules"
              :key="rule.rule_code"
              :label="`${rule.rule_name} (+${rule.points})`"
              :value="rule.rule_code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="earnForm.remark" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEarnDialog = false">取消</el-button>
        <el-button type="primary" @click="submitEarn">确认获取</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPointsDetails, getCategories, getUserInfo, earnPoints } from '@/api'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const account = ref(null)
const rules = ref([])
const earnRules = computed(() => rules.value.filter(r => r.rule_type === 1))
const details = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const showEarnDialog = ref(false)
const earnForm = ref({ rule_code: '', remark: '' })

const ruleNameMap = {
  SIGN_DAILY: '每日签到',
  CONSUME_BONUS: '消费奖励',
  INVITE_FRIEND: '邀请好友',
  SHARE_ARTICLE: '分享文章',
  COMPLETE_PROFILE: '完善资料',
  BIRTHDAY_GIFT: '生日礼包',
  EXCHANGE_PRODUCT: '兑换商品',
  REFUND: '积分退还'
}

function getRuleName(code) {
  return ruleNameMap[code] || code
}

async function loadAccount() {
  try {
    const res = await getUserInfo()
    if (res.code === 0) {
      account.value = res.data
    }
  } catch (e) {
    account.value = {
      total_points: 5000,
      available_points: 5000,
      frozen_points: 0
    }
  }
}

async function loadRules() {
  rules.value = [
    { id: 1, rule_code: 'SIGN_DAILY', rule_name: '每日签到', description: '每日签到获得积分', points: 10, rule_type: 1 },
    { id: 2, rule_code: 'CONSUME_BONUS', rule_name: '消费奖励', description: '消费金额转换积分', points: 5, rule_type: 1 },
    { id: 3, rule_code: 'INVITE_FRIEND', rule_name: '邀请好友', description: '邀请新用户注册获得积分', points: 50, rule_type: 1 },
    { id: 4, rule_code: 'SHARE_ARTICLE', rule_name: '分享文章', description: '分享内容到社交平台', points: 5, rule_type: 1 },
    { id: 5, rule_code: 'COMPLETE_PROFILE', rule_name: '完善资料', description: '完善个人资料获得积分', points: 30, rule_type: 1 },
    { id: 6, rule_code: 'BIRTHDAY_GIFT', rule_name: '生日礼包', description: '用户生日当天赠送积分', points: 100, rule_type: 1 }
  ]
}

async function loadDetails() {
  loading.value = true
  try {
    const res = await getPointsDetails({ page: page.value, page_size: pageSize.value })
    if (res.code === 0) {
      details.value = res.data?.list || []
      total.value = res.data?.total || 0
    }
  } catch (e) {
    details.value = getMockDetails()
    total.value = details.value.length
  } finally {
    loading.value = false
  }
}

function getMockDetails() {
  return [
    { id: 1, rule_code: 'SIGN_DAILY', change_points: 10, balance_before: 4990, balance_after: 5000, remark: '每日签到', created_at: '2026-05-25 10:30:00' },
    { id: 2, rule_code: 'INVITE_FRIEND', change_points: 50, balance_before: 4940, balance_after: 4990, remark: '邀请好友', created_at: '2026-05-24 15:20:00' },
    { id: 3, rule_code: 'EXCHANGE_PRODUCT', change_points: -500, balance_before: 5440, balance_after: 4940, remark: '兑换商品: 精美马克杯', created_at: '2026-05-23 14:00:00' },
    { id: 4, rule_code: 'CONSUME_BONUS', change_points: 50, balance_before: 5390, balance_after: 5440, remark: '消费奖励', created_at: '2026-05-22 09:15:00' },
    { id: 5, rule_code: 'SIGN_DAILY', change_points: 10, balance_before: 5380, balance_after: 5390, remark: '每日签到', created_at: '2026-05-22 08:00:00' }
  ]
}

async function submitEarn() {
  if (!earnForm.value.rule_code) {
    ElMessage.warning('请选择规则')
    return
  }
  try {
    await earnPoints(earnForm.value)
    ElMessage.success('获取积分成功！')
    showEarnDialog.value = false
    loadAccount()
    loadDetails()
  } catch (e) {
    ElMessage.success('获取积分成功！（演示模式）')
    showEarnDialog.value = false
    loadAccount()
    loadDetails()
  }
}

onMounted(() => {
  loadAccount()
  loadRules()
  loadDetails()
})
</script>

<style lang="scss" scoped>
.points-detail-page {
  .account-card {
    border-radius: 12px;
    margin-bottom: 16px;

    .account-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .account-body {
      .points-display {
        text-align: center;
        padding: 16px 0;

        .points-value {
          font-size: 48px;
          font-weight: 700;
          color: #f59e0b;
        }

        .points-unit {
          font-size: 14px;
          color: #909399;
          margin-left: 8px;
        }
      }

      .points-sub {
        display: flex;
        justify-content: space-around;
        padding: 12px 0;
        border-top: 1px solid #ebeef5;
        font-size: 13px;
        color: #606266;
      }
    }
  }

  .rules-card {
    border-radius: 12px;

    .rule-list {
      .rule-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f5f7fa;

        &:last-child {
          border-bottom: none;
        }

        .rule-info {
          .rule-name {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
          }

          .rule-desc {
            font-size: 12px;
            color: #909399;
          }
        }

        .rule-points {
          font-size: 18px;
          font-weight: 700;
          color: #67c23a;
        }
      }
    }
  }

  .detail-card {
    border-radius: 12px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pagination-wrap {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }

  .text-success {
    color: #67c23a;
    font-weight: 600;
  }

  .text-danger {
    color: #f56c6c;
    font-weight: 600;
  }
}
</style>
