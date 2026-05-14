
<template>
  <div class="booking-manage">
    <el-card>
      <div slot="header">
        <el-row :gutter="20">
          <el-col :span="16">
            <span>预订管理</span>
          </el-col>
        </el-row>
      </div>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="预订编号">
          <el-input v-model="searchForm.bookingNo" placeholder="请输入预订编号" clearable></el-input>
        </el-form-item>
        <el-form-item label="包厢号">
          <el-input v-model="searchForm.roomNo" placeholder="请输入包厢号" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="待确认" value="PENDING"></el-option>
            <el-option label="已确认" value="CONFIRMED"></el-option>
            <el-option label="已入住" value="CHECKED_IN"></el-option>
            <el-option label="已完成" value="COMPLETED"></el-option>
            <el-option label="已取消" value="CANCELLED"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="pageData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="bookingNo" label="预订编号" width="160"></el-table-column>
        <el-table-column prop="roomNo" label="包厢号" width="80"></el-table-column>
        <el-table-column prop="roomType" label="类型" width="80"></el-table-column>
        <el-table-column prop="customer" label="客户" width="100"></el-table-column>
        <el-table-column prop="phone" label="联系电话" width="120"></el-table-column>
        <el-table-column prop="bookingDate" label="预订日期" width="110"></el-table-column>
        <el-table-column prop="timeSlot" label="时段" width="80"></el-table-column>
        <el-table-column prop="hours" label="时长" width="60"></el-table-column>
        <el-table-column prop="amount" label="金额" width="90">
          <template slot-scope="scope">¥{{ scope.row.amount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="success" v-if="scope.row.status === 'PENDING'" @click="handleConfirm(scope.row)">确认</el-button>
            <el-button size="mini" type="warning" v-if="scope.row.status === 'CONFIRMED'" @click="handleCheckIn(scope.row)">入住</el-button>
            <el-button size="mini" type="primary" v-if="scope.row.status === 'CHECKED_IN'" @click="handleCheckout(scope.row)">结账</el-button>
            <el-button size="mini" type="danger" v-if="['PENDING', 'CONFIRMED'].includes(scope.row.status)" @click="handleCancel(scope.row)">取消</el-button>
            <el-button size="mini" @click="handleView(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          background
          :current-page.sync="currentPage"
          :page-sizes="[5, 10, 20, 30]"
          :page-size.sync="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </el-card>
    
    <el-dialog title="预订详情" :visible.sync="detailVisible" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="预订编号">{{ detailData.bookingNo }}</el-descriptions-item>
        <el-descriptions-item label="包厢号">{{ detailData.roomNo }}</el-descriptions-item>
        <el-descriptions-item label="包厢类型">{{ detailData.roomType }}</el-descriptions-item>
        <el-descriptions-item label="客户姓名">{{ detailData.customer }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detailData.phone }}</el-descriptions-item>
        <el-descriptions-item label="预订日期">{{ detailData.bookingDate }}</el-descriptions-item>
        <el-descriptions-item label="时段">{{ detailData.timeSlot }}</el-descriptions-item>
        <el-descriptions-item label="时长">{{ detailData.hours }}小时</el-descriptions-item>
        <el-descriptions-item label="押金">{{ detailData.deposit }}元</el-descriptions-item>
        <el-descriptions-item label="预订金额">¥{{ detailData.amount }}</el-descriptions-item>
        <el-descriptions-item label="预订状态" :span="2">
          <el-tag :type="getStatusType(detailData.status)">{{ getStatusText(detailData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
    
    <el-dialog title="结账处理" :visible.sync="checkoutVisible" width="900px" :close-on-click-modal="false">
      <el-form :model="checkoutForm" :rules="checkoutRules" ref="checkoutFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预订编号">
              <el-input v-model="checkoutForm.bookingNo" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="包厢号">
              <el-input v-model="checkoutForm.roomNo" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户姓名">
              <el-input v-model="checkoutForm.customer" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="支付方式" prop="paymentMethod">
              <el-select v-model="checkoutForm.paymentMethod" placeholder="请选择支付方式" style="width: 100%;">
                <el-option label="微信支付" value="WECHAT"></el-option>
                <el-option label="支付宝" value="ALIPAY"></el-option>
                <el-option label="现金" value="CASH"></el-option>
                <el-option label="刷卡" value="CARD"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider>酒水消费</el-divider>
        <el-table :data="checkoutForm.drinks" size="small" border>
          <el-table-column prop="name" label="酒水名称">
            <template slot-scope="scope">
              <el-select v-model="scope.row.drinkId" placeholder="选择酒水" style="width: 100%;" @change="handleDrinkChange(scope.row)" filterable>
                <el-option 
                  v-for="drink in drinkList" 
                  :key="drink.id" 
                  :label="`${drink.name} (¥${drink.price}/${drink.unit})`"
                  :value="drink.id">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价" width="100" align="right">
            <template slot-scope="scope">¥{{ scope.row.price || 0 }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100">
            <template slot-scope="scope">
              <el-input-number v-model="scope.row.quantity" :min="1" :max="100" @change="calculateDrinkTotal(scope.row)"></el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="total" label="小计" width="100" align="right">
            <template slot-scope="scope">¥{{ scope.row.total || 0 }}</template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template slot-scope="scope">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeDrink(scope.$index)"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="text" icon="el-icon-plus" @click="addDrink" style="margin-top: 10px;">添加酒水</el-button>
        
        <el-divider>费用明细</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="会员折扣">
              <el-select v-model="checkoutForm.memberDiscountRate" placeholder="选择会员等级（可选）" style="width: 100%;" clearable @change="calculateTotal">
                <el-option label="普通会员 (95折)" :value="0.95"></el-option>
                <el-option label="银卡会员 (90折)" :value="0.90"></el-option>
                <el-option label="金卡会员 (85折)" :value="0.85"></el-option>
                <el-option label="钻石会员 (80折)" :value="0.80"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="押金退还">
              <el-input-number v-model="checkoutForm.depositRefund" :min="0" :precision="2" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-card style="background-color: #fdf6ec; border-color: #e6a23c;">
          <el-row>
            <el-col :span="8">
              <div>包厢费：<span style="font-weight: bold;">¥{{ checkoutForm.roomFee || 0 }}</span></div>
            </el-col>
            <el-col :span="8">
              <div>酒水费：<span style="font-weight: bold;">¥{{ checkoutForm.drinkTotal || 0 }}</span></div>
            </el-col>
            <el-col :span="8">
              <div>合计：<span style="font-weight: bold;">¥{{ (checkoutForm.roomFee || 0) + (checkoutForm.drinkTotal || 0) }}</span></div>
            </el-col>
          </el-row>
          <el-row style="margin-top: 10px;">
            <el-col :span="8">
              <div>会员折扣：<span style="font-weight: bold; color: #f56c6c;">{{ checkoutForm.memberDiscountRate ? (checkoutForm.memberDiscountRate * 100).toFixed(0) + '折' : '无' }}</span></div>
            </el-col>
            <el-col :span="8">
              <div>优惠金额：<span style="font-weight: bold; color: #f56c6c;">-¥{{ checkoutForm.discountAmount || 0 }}</span></div>
            </el-col>
            <el-col :span="8">
              <div style="font-size: 18px;">实付金额：<span style="font-weight: bold; color: #f56c6c;">¥{{ checkoutForm.paymentAmount || 0 }}</span></div>
            </el-col>
          </el-row>
        </el-card>
        
        <el-form-item label="备注" style="margin-top: 20px;">
          <el-input type="textarea" v-model="checkoutForm.remark" :rows="2" placeholder="请输入备注（可选）"></el-input>
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="checkoutVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCheckoutSubmit">确认结账</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'BookingManage',
  data() {
    return {
      searchForm: {
        bookingNo: '',
        roomNo: '',
        status: ''
      },
      allBookings: [
        { id: 1, bookingNo: 'BK20240115001', roomNo: '201', roomType: '中包', customer: '张三', phone: '13800138001', bookingDate: '2024-01-15', timeSlot: '晚场', hours: 3, amount: 360, deposit: 200, status: 'CONFIRMED', remark: '需要安静的环境' },
        { id: 2, bookingNo: 'BK20240115002', roomNo: '103', roomType: '小包', customer: '李四', phone: '13800138002', bookingDate: '2024-01-15', timeSlot: '午场', hours: 3, amount: 150, deposit: 100, status: 'PENDING', remark: '' },
        { id: 3, bookingNo: 'BK20240115003', roomNo: '301', roomType: '大包', customer: '王五', phone: '13800138003', bookingDate: '2024-01-15', timeSlot: '晚场', hours: 3, amount: 540, deposit: 300, status: 'CHECKED_IN', remark: '10人聚会' },
        { id: 4, bookingNo: 'BK20240115004', roomNo: '501', roomType: 'VIP包', customer: '赵六', phone: '13800138004', bookingDate: '2024-01-15', timeSlot: '夜场', hours: 4, amount: 880, deposit: 500, status: 'COMPLETED', remark: 'VIP客户，需优先安排' },
        { id: 5, bookingNo: 'BK20240115005', roomNo: '203', roomType: '中包', customer: '孙七', phone: '13800138005', bookingDate: '2024-01-15', timeSlot: '晚场', hours: 3, amount: 360, deposit: 200, status: 'CANCELLED', remark: '用户取消' },
        { id: 6, bookingNo: 'BK20240116001', roomNo: '101', roomType: '小包', customer: '周八', phone: '13800138006', bookingDate: '2024-01-16', timeSlot: '午场', hours: 2, amount: 100, deposit: 100, status: 'PENDING', remark: '' },
        { id: 7, bookingNo: 'BK20240116002', roomNo: '202', roomType: '中包', customer: '吴九', phone: '13800138007', bookingDate: '2024-01-16', timeSlot: '晚场', hours: 4, amount: 480, deposit: 200, status: 'CONFIRMED', remark: '' },
        { id: 8, bookingNo: 'BK20240116003', roomNo: '102', roomType: '小包', customer: '郑十', phone: '13800138008', bookingDate: '2024-01-16', timeSlot: '午场', hours: 3, amount: 150, deposit: 100, status: 'CHECKED_IN', remark: '' },
        { id: 9, bookingNo: 'BK20240116004', roomNo: '302', roomType: '大包', customer: '钱十一', phone: '13800138009', bookingDate: '2024-01-16', timeSlot: '晚场', hours: 3, amount: 540, deposit: 300, status: 'CONFIRMED', remark: '生日聚会' },
        { id: 10, bookingNo: 'BK20240116005', roomNo: '105', roomType: '小包', customer: '李十二', phone: '13800138010', bookingDate: '2024-01-16', timeSlot: '早场', hours: 2, amount: 80, deposit: 100, status: 'COMPLETED', remark: '' },
        { id: 11, bookingNo: 'BK20240117001', roomNo: '502', roomType: 'VIP包', customer: '王十三', phone: '13800138011', bookingDate: '2024-01-17', timeSlot: '夜场', hours: 5, amount: 1100, deposit: 500, status: 'PENDING', remark: '公司团建' },
        { id: 12, bookingNo: 'BK20240117002', roomNo: '204', roomType: '中包', customer: '张十四', phone: '13800138012', bookingDate: '2024-01-17', timeSlot: '晚场', hours: 3, amount: 360, deposit: 200, status: 'CONFIRMED', remark: '' },
        { id: 13, bookingNo: 'BK20240117003', roomNo: '106', roomType: '小包', customer: '刘十五', phone: '13800138013', bookingDate: '2024-01-17', timeSlot: '午场', hours: 3, amount: 150, deposit: 100, status: 'PENDING', remark: '' },
        { id: 14, bookingNo: 'BK20240117004', roomNo: '303', roomType: '大包', customer: '陈十六', phone: '13800138014', bookingDate: '2024-01-17', timeSlot: '晚场', hours: 4, amount: 720, deposit: 300, status: 'CHECKED_IN', remark: '家庭聚会' },
        { id: 15, bookingNo: 'BK20240117005', roomNo: '205', roomType: '中包', customer: '杨十七', phone: '13800138015', bookingDate: '2024-01-17', timeSlot: '午场', hours: 3, amount: 360, deposit: 200, status: 'CANCELLED', remark: '时间冲突' },
        { id: 16, bookingNo: 'BK20240118001', roomNo: '206', roomType: '中包', customer: '黄十八', phone: '13800138016', bookingDate: '2024-01-18', timeSlot: '晚场', hours: 3, amount: 360, deposit: 200, status: 'PENDING', remark: '' },
        { id: 17, bookingNo: 'BK20240118002', roomNo: '104', roomType: '小包', customer: '赵十九', phone: '13800138017', bookingDate: '2024-01-18', timeSlot: '午场', hours: 2, amount: 100, deposit: 100, status: 'CONFIRMED', remark: '' },
        { id: 18, bookingNo: 'BK20240118003', roomNo: '304', roomType: '大包', customer: '吴二十', phone: '13800138018', bookingDate: '2024-01-18', timeSlot: '夜场', hours: 4, amount: 720, deposit: 300, status: 'CONFIRMED', remark: '' }
      ],
      drinkList: [
        { id: 1, name: '青岛啤酒', price: 10, unit: '瓶' },
        { id: 2, name: '百威啤酒', price: 15, unit: '瓶' },
        { id: 3, name: '科罗娜啤酒', price: 25, unit: '瓶' },
        { id: 4, name: '哈尔滨啤酒', price: 8, unit: '瓶' },
        { id: 6, name: '芝华士12年', price: 680, unit: '瓶' },
        { id: 7, name: '黑牌威士忌', price: 580, unit: '瓶' },
        { id: 8, name: '人头马VSOP', price: 1280, unit: '瓶' },
        { id: 10, name: '长城干红', price: 128, unit: '瓶' },
        { id: 11, name: '张裕解百纳', price: 158, unit: '瓶' },
        { id: 13, name: '可口可乐', price: 8, unit: '听' },
        { id: 14, name: '农夫山泉', price: 5, unit: '瓶' },
        { id: 15, name: '脉动', price: 8, unit: '瓶' },
        { id: 16, name: '红牛', price: 10, unit: '听' },
        { id: 17, name: '爆米花', price: 25, unit: '份' },
        { id: 18, name: '炸薯条', price: 20, unit: '份' },
        { id: 19, name: '炸鸡翅', price: 30, unit: '份' },
        { id: 20, name: '水果拼盘(小)', price: 68, unit: '份' },
        { id: 21, name: '水果拼盘(中)', price: 98, unit: '份' },
        { id: 22, name: '水果拼盘(大)', price: 138, unit: '份' },
        { id: 23, name: '瓜子花生', price: 15, unit: '份' }
      ],
      currentPage: 1,
      pageSize: 5,
      detailVisible: false,
      detailData: {},
      checkoutVisible: false,
      checkoutForm: {
        bookingId: null,
        bookingNo: '',
        roomNo: '',
        customer: '',
        paymentMethod: '',
        memberDiscountRate: null,
        depositRefund: 0,
        roomFee: 0,
        drinkTotal: 0,
        discountAmount: 0,
        paymentAmount: 0,
        remark: '',
        drinks: []
      },
      checkoutRules: {
        paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
      }
    }
  },
  computed: {
    filteredBookings() {
      return this.allBookings.filter(booking => {
        const bookingNoMatch = !this.searchForm.bookingNo || booking.bookingNo.includes(this.searchForm.bookingNo.toUpperCase())
        const roomNoMatch = !this.searchForm.roomNo || booking.roomNo.includes(this.searchForm.roomNo)
        const statusMatch = !this.searchForm.status || booking.status === this.searchForm.status
        return bookingNoMatch && roomNoMatch && statusMatch
      })
    },
    total() {
      return this.filteredBookings.length
    },
    pageData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredBookings.slice(start, end)
    }
  },
  methods: {
    getStatusText(status) {
      const textMap = { 'PENDING': '待确认', 'CONFIRMED': '已确认', 'CHECKED_IN': '已入住', 'COMPLETED': '已完成', 'CANCELLED': '已取消' }
      return textMap[status] || status
    },
    getStatusType(status) {
      const typeMap = { 'PENDING': 'warning', 'CONFIRMED': 'primary', 'CHECKED_IN': 'success', 'COMPLETED': 'info', 'CANCELLED': 'danger' }
      return typeMap[status] || 'info'
    },
    handleSearch() {
      this.currentPage = 1
      this.$message.success(`搜索成功，共找到 ${this.total} 条记录`)
    },
    handleReset() {
      this.searchForm = { bookingNo: '', roomNo: '', status: '' }
      this.currentPage = 1
    },
    updateBookingStatus(id, newStatus, successMsg) {
      const index = this.allBookings.findIndex(item => item.id === id)
      if (index > -1) {
        this.allBookings[index].status = newStatus
        this.$message.success(successMsg)
      }
    },
    handleConfirm(row) {
      this.$confirm(`确认预订 ${row.bookingNo}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.updateBookingStatus(row.id, 'CONFIRMED', '确认成功')
      }).catch(() => {})
    },
    handleCheckIn(row) {
      this.$confirm(`确认 ${row.roomNo} 号包厢入住？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.updateBookingStatus(row.id, 'CHECKED_IN', '入住成功')
      }).catch(() => {})
    },
    handleCheckout(row) {
      this.checkoutForm = {
        bookingId: row.id,
        bookingNo: row.bookingNo,
        roomNo: row.roomNo,
        customer: row.customer,
        paymentMethod: '',
        memberDiscountRate: null,
        depositRefund: row.deposit || 0,
        roomFee: row.amount,
        drinkTotal: 0,
        discountAmount: 0,
        paymentAmount: row.amount,
        remark: '',
        drinks: []
      }
      this.checkoutVisible = true
    },
    handleCancel(row) {
      this.$confirm(`确认取消预订 ${row.bookingNo}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.updateBookingStatus(row.id, 'CANCELLED', '取消成功')
      }).catch(() => {})
    },
    handleView(row) {
      this.detailData = { ...row }
      this.detailVisible = true
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleDrinkChange(row) {
      const drink = this.drinkList.find(d => d.id === row.drinkId)
      if (drink) {
        row.name = drink.name
        row.price = drink.price
        row.unit = drink.unit
        this.calculateDrinkTotal(row)
      }
    },
    calculateDrinkTotal(row) {
      row.total = (row.price || 0) * (row.quantity || 1)
      this.calculateTotal()
    },
    calculateTotal() {
      this.checkoutForm.drinkTotal = this.checkoutForm.drinks.reduce((sum, d) => sum + (d.total || 0), 0)
      const subtotal = this.checkoutForm.roomFee + this.checkoutForm.drinkTotal
      if (this.checkoutForm.memberDiscountRate) {
        this.checkoutForm.discountAmount = parseFloat((subtotal * (1 - this.checkoutForm.memberDiscountRate)).toFixed(2))
        this.checkoutForm.paymentAmount = parseFloat((subtotal * this.checkoutForm.memberDiscountRate).toFixed(2))
      } else {
        this.checkoutForm.discountAmount = 0
        this.checkoutForm.paymentAmount = subtotal
      }
    },
    addDrink() {
      this.checkoutForm.drinks.push({
        drinkId: null,
        name: '',
        price: 0,
        quantity: 1,
        total: 0
      })
    },
    removeDrink(index) {
      this.checkoutForm.drinks.splice(index, 1)
      this.calculateTotal()
    },
    handleCheckoutSubmit() {
      this.$refs.checkoutFormRef.validate(valid => {
        if (valid) {
          this.$confirm(`确认结账？实付金额 ¥${this.checkoutForm.paymentAmount}`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.updateBookingStatus(this.checkoutForm.bookingId, 'COMPLETED', `结账成功！实付金额 ¥${this.checkoutForm.paymentAmount}`)
            this.checkoutVisible = false
          }).catch(() => {})
        }
      })
    }
  }
}
</script>

<style scoped>
.booking-manage {
  min-height: 100%;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
