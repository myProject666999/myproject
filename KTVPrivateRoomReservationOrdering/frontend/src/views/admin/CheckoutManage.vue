
<template>
  <div class="checkout-manage">
    <el-card>
      <div slot="header">
        <el-row :gutter="20">
          <el-col :span="16">
            <span>结账管理</span>
          </el-col>
          <el-col :span="8" style="text-align: right;">
            <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
              新增结账
            </el-button>
          </el-col>
        </el-row>
      </div>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="结账编号">
          <el-input v-model="searchForm.checkoutNo" placeholder="请输入结账编号" clearable></el-input>
        </el-form-item>
        <el-form-item label="包厢号">
          <el-input v-model="searchForm.roomNo" placeholder="请输入包厢号" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="已完成" value="COMPLETED"></el-option>
            <el-option label="已退款" value="REFUNDED"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="pageData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="checkoutNo" label="结账编号" width="160"></el-table-column>
        <el-table-column prop="bookingNo" label="预订编号" width="160"></el-table-column>
        <el-table-column prop="roomNo" label="包厢号" width="80"></el-table-column>
        <el-table-column prop="customer" label="客户" width="90"></el-table-column>
        <el-table-column prop="roomFee" label="包厢费" width="90">
          <template slot-scope="scope">¥{{ scope.row.roomFee }}</template>
        </el-table-column>
        <el-table-column prop="drinkTotal" label="酒水费" width="90">
          <template slot-scope="scope">¥{{ scope.row.drinkTotal }}</template>
        </el-table-column>
        <el-table-column prop="discountAmount" label="优惠" width="80">
          <template slot-scope="scope">¥{{ scope.row.discountAmount }}</template>
        </el-table-column>
        <el-table-column prop="paymentAmount" label="实付" width="90">
          <template slot-scope="scope">¥{{ scope.row.paymentAmount }}</template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="90">
          <template slot-scope="scope">
            <el-tag size="mini">{{ getPaymentMethodText(scope.row.paymentMethod) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="memberDiscountRate" label="会员折扣" width="90">
          <template slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.memberDiscountRate">
              {{ (scope.row.memberDiscountRate * 100).toFixed(0) }}折
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleView(scope.row)">详情</el-button>
            <el-button size="mini" type="warning" v-if="scope.row.status === 'COMPLETED'" @click="handleRefund(scope.row)">退款</el-button>
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
    
    <el-dialog title="新增结账" :visible.sync="checkoutVisible" width="900px" :close-on-click-modal="false">
      <el-form :model="checkoutForm" :rules="checkoutRules" ref="checkoutFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="选择预订" prop="bookingId">
              <el-select v-model="checkoutForm.bookingId" placeholder="请选择已入住的预订" style="width: 100%;" @change="handleBookingChange" filterable>
                <el-option 
                  v-for="booking in availableBookings" 
                  :key="booking.id" 
                  :label="`${booking.bookingNo} - ${booking.roomNo}(${booking.roomType}) - ${booking.customer}`"
                  :value="booking.id">
                </el-option>
              </el-select>
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
        
        <el-divider>预订信息</el-divider>
        <el-descriptions :column="2" border size="small" v-if="selectedBooking">
          <el-descriptions-item label="预订编号">{{ selectedBooking.bookingNo }}</el-descriptions-item>
          <el-descriptions-item label="包厢号">{{ selectedBooking.roomNo }}</el-descriptions-item>
          <el-descriptions-item label="包厢类型">{{ selectedBooking.roomType }}</el-descriptions-item>
          <el-descriptions-item label="客户姓名">{{ selectedBooking.customer }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ selectedBooking.phone }}</el-descriptions-item>
          <el-descriptions-item label="预订时段">{{ selectedBooking.timeSlot }} / {{ selectedBooking.hours }}小时</el-descriptions-item>
          <el-descriptions-item label="预订金额" label-style="font-weight: bold;">
            <span style="color: #f56c6c;">¥{{ selectedBooking.amount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="押金" label-style="font-weight: bold;">
            <span style="color: #f56c6c;">¥{{ selectedBooking.deposit || 0 }}</span>
          </el-descriptions-item>
        </el-descriptions>
        
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
              <div>合计：<span style="font-weight: bold;">¥{{ checkoutForm.roomFee + checkoutForm.drinkTotal || 0 }}</span></div>
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
    
    <el-dialog title="结账详情" :visible.sync="detailVisible" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="结账编号">{{ detailData.checkoutNo }}</el-descriptions-item>
        <el-descriptions-item label="预订编号">{{ detailData.bookingNo }}</el-descriptions-item>
        <el-descriptions-item label="包厢号">{{ detailData.roomNo }}</el-descriptions-item>
        <el-descriptions-item label="客户姓名">{{ detailData.customer }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detailData.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="结账时间">{{ detailData.checkoutTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="包厢费" label-style="font-weight: bold;">
          <span style="color: #606266;">¥{{ detailData.roomFee }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="酒水费" label-style="font-weight: bold;">
          <span style="color: #606266;">¥{{ detailData.drinkTotal }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="押金退还" label-style="font-weight: bold;">
          <span style="color: #606266;">¥{{ detailData.depositRefund || 0 }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="会员折扣">
          <el-tag size="mini" v-if="detailData.memberDiscountRate">
            {{ (detailData.memberDiscountRate * 100).toFixed(0) }}折
          </el-tag>
          <span v-else>无</span>
        </el-descriptions-item>
        <el-descriptions-item label="优惠金额" label-style="font-weight: bold;">
          <span style="color: #f56c6c;">-¥{{ detailData.discountAmount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="实付金额" label-style="font-weight: bold;">
          <span style="color: #f56c6c; font-size: 18px;">¥{{ detailData.paymentAmount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">
          <el-tag>{{ getPaymentMethodText(detailData.paymentMethod) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="结账状态">
          <el-tag :type="getStatusType(detailData.status)">{{ getStatusText(detailData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ detailData.remark || '无' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <div v-if="detailData.drinks && detailData.drinks.length > 0" style="margin-top: 20px;">
        <h4 style="margin-bottom: 10px; color: #606266;">酒水清单</h4>
        <el-table :data="detailData.drinks" size="small" border>
          <el-table-column prop="name" label="酒水名称"></el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center"></el-table-column>
          <el-table-column prop="price" label="单价" width="100" align="right">
            <template slot-scope="scope">¥{{ scope.row.price }}</template>
          </el-table-column>
          <el-table-column prop="total" label="小计" width="100" align="right">
            <template slot-scope="scope">¥{{ scope.row.total }}</template>
          </el-table-column>
        </el-table>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CheckoutManage',
  data() {
    return {
      searchForm: {
        checkoutNo: '',
        roomNo: '',
        status: ''
      },
      allCheckouts: [
        { 
          id: 1, 
          checkoutNo: 'CK20240115001', 
          bookingNo: 'BK20240115001', 
          roomNo: '201', 
          customer: '张三', 
          phone: '13800138001',
          roomFee: 360, 
          drinkTotal: 280, 
          depositRefund: 200,
          discountAmount: 50.4, 
          paymentAmount: 589.6, 
          paymentMethod: 'WECHAT', 
          memberDiscountRate: 0.88, 
          status: 'COMPLETED',
          checkoutTime: '2024-01-15 22:30:15',
          remark: '',
          drinks: [
            { name: '青岛啤酒', quantity: 12, price: 10, total: 120 },
            { name: '炸薯条', quantity: 2, price: 20, total: 40 },
            { name: '水果拼盘(小)', quantity: 2, price: 68, total: 136 }
          ]
        },
        { 
          id: 2, 
          checkoutNo: 'CK20240115002', 
          bookingNo: 'BK20240115004', 
          roomNo: '501', 
          customer: '赵六', 
          phone: '13800138004',
          roomFee: 880, 
          drinkTotal: 1560, 
          depositRefund: 500,
          discountAmount: 488, 
          paymentAmount: 1952, 
          paymentMethod: 'ALIPAY', 
          memberDiscountRate: 0.80, 
          status: 'COMPLETED',
          checkoutTime: '2024-01-15 23:45:30',
          remark: 'VIP客户，服务很好',
          drinks: [
            { name: '芝华士12年', quantity: 2, price: 680, total: 1360 },
            { name: '脉动', quantity: 8, price: 8, total: 64 },
            { name: '水果拼盘(大)', quantity: 2, price: 138, total: 276 }
          ]
        },
        { 
          id: 3, 
          checkoutNo: 'CK20240114001', 
          bookingNo: 'BK20240114001', 
          roomNo: '301', 
          customer: '周八', 
          phone: '13800138006',
          roomFee: 540, 
          drinkTotal: 320, 
          depositRefund: 300,
          discountAmount: 0, 
          paymentAmount: 860, 
          paymentMethod: 'CASH', 
          memberDiscountRate: null, 
          status: 'COMPLETED',
          checkoutTime: '2024-01-14 22:15:45',
          remark: '非会员，无折扣',
          drinks: [
            { name: '百威啤酒', quantity: 20, price: 15, total: 300 },
            { name: '爆米花', quantity: 1, price: 25, total: 25 }
          ]
        },
        { 
          id: 4, 
          checkoutNo: 'CK20240114002', 
          bookingNo: 'BK20240114002', 
          roomNo: '102', 
          customer: '吴九', 
          phone: '13800138007',
          roomFee: 240, 
          drinkTotal: 150, 
          depositRefund: 100,
          discountAmount: 19.5, 
          paymentAmount: 370.5, 
          paymentMethod: 'WECHAT', 
          memberDiscountRate: 0.95, 
          status: 'REFUNDED',
          checkoutTime: '2024-01-14 20:30:00',
          remark: '用户不满意，全额退款',
          drinks: [
            { name: '可口可乐', quantity: 5, price: 8, total: 40 },
            { name: '炸鸡翅', quantity: 2, price: 30, total: 60 },
            { name: '瓜子花生', quantity: 3, price: 15, total: 45 }
          ]
        },
        { 
          id: 5, 
          checkoutNo: 'CK20240113001', 
          bookingNo: 'BK20240113001', 
          roomNo: '203', 
          customer: '郑十', 
          phone: '13800138008',
          roomFee: 360, 
          drinkTotal: 180, 
          depositRefund: 200,
          discountAmount: 54, 
          paymentAmount: 486, 
          paymentMethod: 'CARD', 
          memberDiscountRate: 0.90, 
          status: 'COMPLETED',
          checkoutTime: '2024-01-13 23:00:20',
          remark: '',
          drinks: [
            { name: '科罗娜啤酒', quantity: 6, price: 25, total: 150 },
            { name: '农夫山泉', quantity: 6, price: 5, total: 30 }
          ]
        },
        { 
          id: 6, 
          checkoutNo: 'CK20240113002', 
          bookingNo: 'BK20240113002', 
          roomNo: '303', 
          customer: '钱十一', 
          phone: '13800138009',
          roomFee: 720, 
          drinkTotal: 980, 
          depositRefund: 300,
          discountAmount: 255, 
          paymentAmount: 1445, 
          paymentMethod: 'ALIPAY', 
          memberDiscountRate: 0.85, 
          status: 'COMPLETED',
          checkoutTime: '2024-01-14 01:20:10',
          remark: '生日聚会，赠送果盘',
          drinks: [
            { name: '黑牌威士忌', quantity: 1, price: 580, total: 580 },
            { name: '长城干红', quantity: 2, price: 128, total: 256 },
            { name: '脉动', quantity: 10, price: 8, total: 80 },
            { name: '水果拼盘(中)', quantity: 1, price: 98, total: 98 }
          ]
        },
        { 
          id: 7, 
          checkoutNo: 'CK20240112001', 
          bookingNo: 'BK20240112001', 
          roomNo: '101', 
          customer: '李十二', 
          phone: '13800138010',
          roomFee: 100, 
          drinkTotal: 40, 
          depositRefund: 100,
          discountAmount: 14, 
          paymentAmount: 126, 
          paymentMethod: 'WECHAT', 
          memberDiscountRate: 0.90, 
          status: 'COMPLETED',
          checkoutTime: '2024-01-12 18:30:00',
          remark: '',
          drinks: [
            { name: '可口可乐', quantity: 5, price: 8, total: 40 }
          ]
        },
        { 
          id: 8, 
          checkoutNo: 'CK20240112002', 
          bookingNo: 'BK20240112002', 
          roomNo: '502', 
          customer: '王十三', 
          phone: '13800138011',
          roomFee: 1100, 
          drinkTotal: 2680, 
          depositRefund: 500,
          discountAmount: 756, 
          paymentAmount: 3024, 
          paymentMethod: 'CARD', 
          memberDiscountRate: 0.80, 
          status: 'COMPLETED',
          checkoutTime: '2024-01-13 03:00:00',
          remark: '公司团建',
          drinks: [
            { name: '人头马VSOP', quantity: 2, price: 1280, total: 2560 },
            { name: '水果拼盘(大)', quantity: 1, price: 138, total: 138 }
          ]
        }
      ],
      allBookings: [
        { id: 3, bookingNo: 'BK20240115003', roomNo: '301', roomType: '大包', customer: '王五', phone: '13800138003', bookingDate: '2024-01-15', timeSlot: '晚场', hours: 3, amount: 540, deposit: 300, status: 'CHECKED_IN', remark: '10人聚会' },
        { id: 8, bookingNo: 'BK20240116003', roomNo: '102', roomType: '小包', customer: '郑十', phone: '13800138008', bookingDate: '2024-01-16', timeSlot: '午场', hours: 3, amount: 150, deposit: 100, status: 'CHECKED_IN', remark: '' },
        { id: 14, bookingNo: 'BK20240117004', roomNo: '303', roomType: '大包', customer: '陈十六', phone: '13800138014', bookingDate: '2024-01-17', timeSlot: '晚场', hours: 4, amount: 720, deposit: 300, status: 'CHECKED_IN', remark: '家庭聚会' }
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
        bookingId: [{ required: true, message: '请选择预订', trigger: 'change' }],
        paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
      }
    }
  },
  computed: {
    availableBookings() {
      return this.allBookings.filter(b => b.status === 'CHECKED_IN')
    },
    selectedBooking() {
      if (!this.checkoutForm.bookingId) return null
      return this.allBookings.find(b => b.id === this.checkoutForm.bookingId)
    },
    filteredCheckouts() {
      return this.allCheckouts.filter(checkout => {
        const checkoutNoMatch = !this.searchForm.checkoutNo || checkout.checkoutNo.toUpperCase().includes(this.searchForm.checkoutNo.toUpperCase())
        const roomNoMatch = !this.searchForm.roomNo || checkout.roomNo.includes(this.searchForm.roomNo)
        const statusMatch = !this.searchForm.status || checkout.status === this.searchForm.status
        return checkoutNoMatch && roomNoMatch && statusMatch
      })
    },
    total() {
      return this.filteredCheckouts.length
    },
    pageData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredCheckouts.slice(start, end)
    }
  },
  methods: {
    getStatusText(status) {
      const textMap = { 'COMPLETED': '已完成', 'REFUNDED': '已退款' }
      return textMap[status] || status
    },
    getStatusType(status) {
      const typeMap = { 'COMPLETED': 'success', 'REFUNDED': 'info' }
      return typeMap[status] || 'info'
    },
    getPaymentMethodText(method) {
      const textMap = { 'CASH': '现金', 'WECHAT': '微信', 'ALIPAY': '支付宝', 'CARD': '刷卡' }
      return textMap[method] || method
    },
    handleSearch() {
      this.currentPage = 1
      this.$message.success(`搜索成功，共找到 ${this.total} 条记录`)
    },
    handleReset() {
      this.searchForm = { checkoutNo: '', roomNo: '', status: '' }
      this.currentPage = 1
    },
    handleView(row) {
      this.detailData = { ...row }
      this.detailVisible = true
    },
    handleRefund(row) {
      this.$confirm(`确认对 ${row.checkoutNo} 进行退款？退款金额 ¥${row.paymentAmount}`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.allCheckouts.findIndex(item => item.id === row.id)
        if (index > -1) {
          this.allCheckouts[index].status = 'REFUNDED'
        }
        this.$message.success('退款成功')
      }).catch(() => {})
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleAdd(bookingId = null) {
      this.checkoutForm = {
        bookingId: bookingId,
        paymentMethod: '',
        memberDiscountRate: null,
        depositRefund: 0,
        roomFee: 0,
        drinkTotal: 0,
        discountAmount: 0,
        paymentAmount: 0,
        remark: '',
        drinks: []
      }
      if (bookingId) {
        this.handleBookingChange(bookingId)
      }
      this.checkoutVisible = true
    },
    handleBookingChange(bookingId) {
      const booking = this.allBookings.find(b => b.id === bookingId)
      if (booking) {
        this.checkoutForm.roomFee = booking.amount
        this.checkoutForm.depositRefund = booking.deposit || 0
        this.calculateTotal()
      }
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
          if (!this.checkoutForm.drinks || this.checkoutForm.drinks.length === 0) {
            this.$message.warning('请至少添加一项酒水消费，或确认无酒水消费')
          }
          
          const booking = this.selectedBooking
          const now = new Date()
          const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
          const newId = Math.max(...this.allCheckouts.map(c => c.id), 0) + 1
          const checkoutNo = `CK${dateStr}${String(newId).padStart(3, '0')}`
          
          const newCheckout = {
            id: newId,
            checkoutNo: checkoutNo,
            bookingNo: booking.bookingNo,
            roomNo: booking.roomNo,
            customer: booking.customer,
            phone: booking.phone,
            roomFee: this.checkoutForm.roomFee,
            drinkTotal: this.checkoutForm.drinkTotal,
            depositRefund: this.checkoutForm.depositRefund,
            discountAmount: this.checkoutForm.discountAmount,
            paymentAmount: this.checkoutForm.paymentAmount,
            paymentMethod: this.checkoutForm.paymentMethod,
            memberDiscountRate: this.checkoutForm.memberDiscountRate,
            status: 'COMPLETED',
            checkoutTime: now.toLocaleString('zh-CN'),
            remark: this.checkoutForm.remark,
            drinks: this.checkoutForm.drinks.map(d => ({
              name: d.name,
              quantity: d.quantity,
              price: d.price,
              total: d.total
            }))
          }
          
          this.allCheckouts.unshift(newCheckout)
          
          const bookingIndex = this.allBookings.findIndex(b => b.id === booking.id)
          if (bookingIndex > -1) {
            this.allBookings[bookingIndex].status = 'COMPLETED'
          }
          
          this.checkoutVisible = false
          this.$message.success(`结账成功！结账编号：${checkoutNo}，实付金额：¥${this.checkoutForm.paymentAmount}`)
        }
      })
    }
  }
}
</script>

<style scoped>
.checkout-manage {
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
