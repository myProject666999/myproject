<template>
  <div class="cards-page">
    <el-card>
      <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 18px; font-weight: bold;">我的卡包</span>
        <el-button type="primary" @click="showAddDialog">添加会员卡</el-button>
      </div>

      <el-row :gutter="20">
        <el-col :span="8" v-for="card in cards" :key="card.id" style="margin-bottom: 20px;">
          <el-card :body-style="{ padding: '0px' }" class="card-item">
            <div :class="['card-header', card.cardType === 'MONTHLY' ? 'monthly' : 'stored']">
              <div style="font-size: 24px; margin-bottom: 10px;">
                <i :class="card.cardType === 'MONTHLY' ? 'el-icon-date' : 'el-icon-coin'"></i>
              </div>
              <div style="font-size: 16px; font-weight: bold;">
                {{ card.cardType === 'MONTHLY' ? '月卡' : '储值卡' }}
              </div>
            </div>
            <div style="padding: 15px;">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="卡号">
                  {{ card.cardNo }}
                </el-descriptions-item>
                <el-descriptions-item v-if="card.cardType === 'MONTHLY'" label="剩余次数">
                  <span style="color: #409EFF; font-weight: bold;">{{ card.remainingTimes }}次</span>
                </el-descriptions-item>
                <el-descriptions-item v-if="card.cardType === 'STORED'" label="余额">
                  <span style="color: #f56c6c; font-weight: bold; font-size: 18px;">¥{{ card.balance }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="有效期">
                  {{ card.expireDate || '长期有效' }}
                </el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="card.status === 1 ? 'success' : 'info'">
                    {{ card.status === 1 ? '正常' : '已失效' }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
              <div style="margin-top: 15px; text-align: right;">
                <el-button v-if="card.status === 1" type="primary" size="small" @click="rechargeCard(card)">
                  充值
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="cards.length === 0" description="暂无会员卡"></el-empty>
    </el-card>

    <el-dialog title="添加会员卡" :visible.sync="addDialogVisible" width="400px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="卡类型">
          <el-radio-group v-model="addForm.cardType">
            <el-radio value="MONTHLY">月卡</el-radio>
            <el-radio value="STORED">储值卡</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="addForm.cardType === 'MONTHLY'" label="次数">
          <el-input-number v-model="addForm.remainingTimes" :min="1" :max="100"></el-input-number>
        </el-form-item>
        <el-form-item v-if="addForm.cardType === 'STORED'" label="充值金额">
          <el-input-number v-model="addForm.balance" :min="0" :precision="2"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddCard">确认</el-button>
      </span>
    </el-dialog>

    <el-dialog title="充值" :visible.sync="rechargeDialogVisible" width="400px">
      <el-form :model="rechargeForm" label-width="80px">
        <el-form-item v-if="currentCard && currentCard.cardType === 'STORED'" label="充值金额">
          <el-input-number v-model="rechargeForm.balance" :min="0" :precision="2"></el-input-number>
        </el-form-item>
        <el-form-item v-if="currentCard && currentCard.cardType === 'MONTHLY'" label="增加次数">
          <el-input-number v-model="rechargeForm.remainingTimes" :min="1" :max="100"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rechargeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRecharge">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'Cards',
  data() {
    return {
      cards: [],
      addDialogVisible: false,
      addForm: {
        cardType: 'MONTHLY',
        remainingTimes: 30,
        balance: 0
      },
      rechargeDialogVisible: false,
      currentCard: null,
      rechargeForm: {
        remainingTimes: 30,
        balance: 100
      }
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo || {}
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const data = await request.get('/card/list', {
          params: { userId: this.userInfo.id }
        })
        this.cards = data || []
      } catch (error) {
        console.error(error)
      }
    },
    showAddDialog() {
      this.addForm = {
        cardType: 'MONTHLY',
        remainingTimes: 30,
        balance: 0
      }
      this.addDialogVisible = true
    },
    async submitAddCard() {
      try {
        await request.post('/card', {
          userId: this.userInfo.id,
          ...this.addForm
        })
        this.$message.success('添加成功')
        this.addDialogVisible = false
        this.loadData()
      } catch (error) {
        console.error(error)
      }
    },
    rechargeCard(card) {
      this.currentCard = card
      this.rechargeForm = {
        remainingTimes: 30,
        balance: 100
      }
      this.rechargeDialogVisible = true
    },
    async submitRecharge() {
      try {
        await request.post(`/card/${this.currentCard.id}/recharge`, this.rechargeForm)
        this.$message.success('充值成功')
        this.rechargeDialogVisible = false
        this.loadData()
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
.cards-page {
  padding: 20px;
}
.card-item {
  border-radius: 10px;
  overflow: hidden;
}
.card-header {
  padding: 20px;
  color: white;
  text-align: center;
}
.card-header.monthly {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.card-header.stored {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
</style>