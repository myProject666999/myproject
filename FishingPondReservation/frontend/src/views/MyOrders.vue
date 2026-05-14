<template>
  <div class="orders-page">
    <el-card>
      <div slot="header">
        <span style="font-size: 18px; font-weight: bold;">我的订单</span>
      </div>

      <el-table :data="orders" border>
        <el-table-column prop="orderNo" label="订单号" width="220"></el-table-column>
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template slot-scope="scope">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ scope.row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentType" label="支付方式" width="100">
          <template slot-scope="scope">
            {{ scope.row.paymentType === 'cash' ? '现金' : '余额' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '已支付' : '待支付' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180"></el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="viewItems(scope.row.id)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty description="暂无订单" v-if="orders.length === 0"></el-empty>
    </el-card>

    <el-dialog title="订单详情" :visible.sync="detailVisible" width="500px">
      <el-table :data="orderItems" border>
        <el-table-column prop="equipmentId" label="商品ID" width="100"></el-table-column>
        <el-table-column prop="quantity" label="数量" width="100"></el-table-column>
        <el-table-column prop="unitPrice" label="单价" width="120">
          <template slot-scope="scope">
            ¥{{ scope.row.unitPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="totalPrice" label="小计" width="120">
          <template slot-scope="scope">
            ¥{{ scope.row.totalPrice }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'MyOrders',
  data() {
    return {
      orders: [],
      detailVisible: false,
      orderItems: []
    }
  },
  computed: {
    user() {
      return this.$store.state.user || {}
    }
  },
  mounted() {
    this.loadOrders()
  },
  methods: {
    async loadOrders() {
      try {
        const res = await request.get('/order/list', {
          params: { userId: this.user.id }
        })
        this.orders = res.data
      } catch (error) {
        console.error(error)
      }
    },
    async viewItems(orderId) {
      try {
        const res = await request.get('/order/' + orderId + '/items')
        this.orderItems = res.data
        this.detailVisible = true
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
.orders-page {
  padding: 10px;
}
</style>
