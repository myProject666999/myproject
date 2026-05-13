
<template>
  <div class="order">
    <el-header>
      <div class="header-content">
        <div class="logo" @click="goHome">🎤 KTV包厢预订与点歌系统</div>
      </div>
    </el-header>
    
    <el-main>
      <h2>酒水点单</h2>
      <el-row :gutter="20">
        <el-col :span="4">
          <el-card class="category-card">
            <el-menu
              :default-active="activeCategory"
              mode="vertical"
              @select="handleCategorySelect">
              <el-menu-item index="0">全部</el-menu-item>
              <el-menu-item index="1">🍺 啤酒</el-menu-item>
              <el-menu-item index="2">🥃 洋酒</el-menu-item>
              <el-menu-item index="3">🍷 红酒</el-menu-item>
              <el-menu-item index="4">🥤 饮料</el-menu-item>
              <el-menu-item index="5">🍿 小吃</el-menu-item>
              <el-menu-item index="6">🍉 水果</el-menu-item>
            </el-menu>
          </el-card>
        </el-col>
        <el-col :span="14">
          <el-card>
            <el-row :gutter="20">
              <el-col :span="8" v-for="drink in drinks" :key="drink.id">
                <el-card class="drink-card" shadow="hover">
                  <div class="drink-icon">{{ getDrinkIcon(drink.categoryId) }}</div>
                  <div class="drink-name">{{ drink.name }}</div>
                  <div class="drink-price">¥{{ drink.price }}/{{ drink.unit }}</div>
                  <div class="drink-action">
                    <el-button size="small" type="primary" @click="addToCart(drink)">加入购物车</el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="cart-card">
            <div class="cart-header">
              <h3>🛒 购物车</h3>
              <el-button type="text" @click="clearCart">清空</el-button>
            </div>
            <div class="cart-items">
              <div v-if="cart.length === 0" class="empty-cart">
                购物车空空如也~
              </div>
              <div v-else class="cart-item" v-for="item in cart" :key="item.id">
                <div class="item-info">
                  <span>{{ item.name }}</span>
                  <span class="item-price">¥{{ item.price }}</span>
                </div>
                <div class="item-quantity">
                  <el-button size="mini" @click="decreaseQuantity(item)">-</el-button>
                  <span>{{ item.quantity }}</span>
                  <el-button size="mini" type="primary" @click="increaseQuantity(item)">+</el-button>
                </div>
              </div>
            </div>
            <div class="cart-footer">
              <div class="total">
                总计：<span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
              </div>
              <el-button type="primary" style="width: 100%;" :disabled="cart.length === 0" @click="submitOrder">
                立即下单
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script>
export default {
  name: 'Order',
  data() {
    return {
      activeCategory: '0',
      cart: [],
      drinks: [
        { id: 1, name: '青岛啤酒', price: 10, unit: '瓶', categoryId: 1 },
        { id: 2, name: '百威啤酒', price: 15, unit: '瓶', categoryId: 1 },
        { id: 3, name: '科罗娜啤酒', price: 25, unit: '瓶', categoryId: 1 },
        { id: 4, name: '芝华士12年', price: 680, unit: '瓶', categoryId: 2 },
        { id: 5, name: '黑牌威士忌', price: 580, unit: '瓶', categoryId: 2 },
        { id: 6, name: '长城干红', price: 128, unit: '瓶', categoryId: 3 },
        { id: 7, name: '可口可乐', price: 8, unit: '听', categoryId: 4 },
        { id: 8, name: '农夫山泉', price: 5, unit: '瓶', categoryId: 4 },
        { id: 9, name: '爆米花', price: 25, unit: '份', categoryId: 5 },
        { id: 10, name: '花生', price: 15, unit: '份', categoryId: 5 },
        { id: 11, name: '水果拼盘(小)', price: 68, unit: '份', categoryId: 6 },
        { id: 12, name: '西瓜', price: 38, unit: '份', categoryId: 6 }
      ]
    }
  },
  computed: {
    totalPrice() {
      return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }
  },
  methods: {
    handleCategorySelect(index) {
      this.activeCategory = index
    },
    getDrinkIcon(categoryId) {
      const icons = {
        1: '🍺',
        2: '🥃',
        3: '🍷',
        4: '🥤',
        5: '🍿',
        6: '🍉'
      }
      return icons[categoryId] || '🍹'
    },
    addToCart(drink) {
      const existingItem = this.cart.find(item => item.id === drink.id)
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.cart.push({ ...drink, quantity: 1 })
      }
      this.$message.success(`${drink.name} 已加入购物车`)
    },
    increaseQuantity(item) {
      item.quantity++
    },
    decreaseQuantity(item) {
      if (item.quantity > 1) {
        item.quantity--
      } else {
        this.cart = this.cart.filter(cartItem => cartItem.id !== item.id)
      }
    },
    clearCart() {
      this.cart = []
      this.$message.info('购物车已清空')
    },
    submitOrder() {
      this.$message.success('下单成功！服务员将尽快为您送达')
      this.cart = []
    },
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.order {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.el-header {
  background-color: #409EFF;
  color: white;
  padding: 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
}

.el-main {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 40px 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}

.category-card {
  padding: 0;
}

.drink-card {
  margin-bottom: 20px;
  text-align: center;
}

.drink-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.drink-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.drink-price {
  color: #F56C6C;
  font-size: 14px;
  margin-bottom: 10px;
}

.cart-card {
  position: sticky;
  top: 40px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.cart-header h3 {
  margin: 0;
}

.empty-cart {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #F2F6FC;
}

.item-price {
  color: #F56C6C;
  margin-left: 10px;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-quantity span {
  min-width: 20px;
  text-align: center;
}

.cart-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.total {
  margin-bottom: 15px;
  text-align: right;
  font-size: 16px;
}

.total-price {
  font-size: 24px;
  font-weight: bold;
  color: #F56C6C;
}
</style>
