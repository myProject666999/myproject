<template>
  <div class="equipment-page">
    <el-card>
      <div slot="header">
        <span style="font-size: 18px; font-weight: bold;">🎣 渔具与饵料商城</span>
        <el-badge :value="cartTotal" class="cart-badge" style="float: right; margin-top: -5px;">
          <el-button icon="el-icon-shopping-cart-2" circle @click="showCart = true"></el-button>
        </el-badge>
      </div>

      <div style="margin-bottom: 20px;">
        <el-form :inline="true">
          <el-form-item label="商品分类">
            <el-select v-model="category" placeholder="全部分类" style="width: 150px;" @change="loadEquipment">
              <el-option label="全部分类" value=""></el-option>
              <el-option v-for="c in categories" :key="c" :label="c" :value="c"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <el-row :gutter="20">
        <el-col :span="6" v-for="item in equipment" :key="item.id" style="margin-bottom: 20px;">
          <el-card class="equipment-card" shadow="hover">
            <div class="equipment-image">
              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fishing%20gear%20equipment%20store%20product&image_size=square" alt="" class="equip-img" />
            </div>
            <div class="equipment-info">
              <h4 class="equip-name">{{ item.name }}</h4>
              <el-tag size="mini">{{ item.category }}</el-tag>
              <p class="equip-desc">{{ item.description }}</p>
              <div class="equip-footer">
                <span class="price">¥{{ item.price }}/{{ item.unit }}</span>
                <span class="stock" :class="{ 'low-stock': item.stock < 10 }">
                  库存: {{ item.stock }}
                </span>
              </div>
              <div style="display: flex; gap: 10px; margin-top: 10px;">
                <el-input-number v-model="item.cartQty" :min="1" :max="item.stock" size="small" style="width: 100px;"></el-input-number>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="addToCart(item)"
                  :disabled="item.stock === 0">
                  加入购物车
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog title="购物车" :visible.sync="showCart" width="600px">
      <el-table :data="cart" border v-if="cart.length > 0">
        <el-table-column prop="name" label="商品名称"></el-table-column>
        <el-table-column prop="category" label="分类" width="100"></el-table-column>
        <el-table-column prop="price" label="单价" width="100">
          <template slot-scope="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column label="数量" width="150">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.quantity" :min="1" size="small" @change="calculateTotal"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column label="小计" width="100">
          <template slot-scope="scope">
            ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeFromCart(scope.$index)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty description="购物车为空" v-else></el-empty>

      <div slot="footer" v-if="cart.length > 0" style="text-align: right;">
        <span style="margin-right: 20px; font-size: 16px;">
          合计: <span style="color: #f56c6c; font-weight: bold; font-size: 20px;">¥{{ cartTotalPrice.toFixed(2) }}</span>
        </span>
        <el-button @click="showCart = false">继续购物</el-button>
        <el-button type="primary" @click="checkout" :loading="checkingOut">结算</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'Equipment',
  data() {
    return {
      category: '',
      categories: [],
      equipment: [],
      showCart: false,
      cart: [],
      checkingOut: false
    }
  },
  computed: {
    cartTotal() {
      return this.cart.reduce((sum, item) => sum + item.quantity, 0)
    },
    cartTotalPrice() {
      return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },
    user() {
      return this.$store.state.user || {}
    }
  },
  mounted() {
    this.loadCategories()
    this.loadEquipment()
  },
  methods: {
    async loadCategories() {
      try {
        const res = await request.get('/equipment/categories')
        this.categories = res.data
      } catch (error) {
        console.error(error)
      }
    },
    async loadEquipment() {
      try {
        const params = {}
        if (this.category) params.category = this.category
        const res = await request.get('/equipment/list', { params })
        this.equipment = res.data.map(item => ({ ...item, cartQty: 1 }))
      } catch (error) {
        console.error(error)
      }
    },
    addToCart(item) {
      const existItem = this.cart.find(c => c.id === item.id)
      if (existItem) {
        existItem.quantity += item.cartQty
      } else {
        this.cart.push({
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          quantity: item.cartQty
        })
      }
      this.$message.success('已加入购物车')
    },
    removeFromCart(index) {
      this.cart.splice(index, 1)
    },
    calculateTotal() {
    },
    async checkout() {
      if (this.cart.length === 0) {
        this.$message.warning('购物车为空')
        return
      }

      this.checkingOut = true
      try {
        await request.post('/order', {
          userId: this.user.id,
          paymentType: 'cash',
          items: this.cart.map(item => ({
            equipmentId: item.id,
            quantity: item.quantity
          }))
        })
        this.$message.success('下单成功！')
        this.cart = []
        this.showCart = false
        this.loadEquipment()
      } catch (error) {
        console.error(error)
      } finally {
        this.checkingOut = false
      }
    }
  }
}
</script>

<style scoped>
.equipment-page {
  padding: 10px;
}
.cart-badge {
  float: right;
}
.equipment-card {
  transition: all 0.3s;
}
.equipment-card:hover {
  transform: translateY(-5px);
}
.equipment-image {
  text-align: center;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}
.equip-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
.equipment-info {
  padding: 10px 5px;
}
.equip-name {
  margin: 10px 0 5px 0;
  font-size: 15px;
  color: #303133;
}
.equip-desc {
  color: #909399;
  font-size: 12px;
  margin: 10px 0;
  min-height: 30px;
}
.equip-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}
.stock {
  color: #67c23a;
  font-size: 13px;
}
.stock.low-stock {
  color: #e6a23c;
}
</style>
