# 二手回收上门估价平台

## 技术栈
- **后端**: SpringBoot 2.7 + MyBatis-Plus + Spring Security + JWT
- **前端**: Vue 3 + Vite + Vant UI (H5移动端)
- **数据库**: MySQL 8.0

## 功能模块

### 用户端
1. **品类与估价模型** - 支持家电、衣物、书籍等多品类，根据图片+描述智能估价
2. **上门预约** - 选择地址、预约时间，一键预约
3. **现场议价** - 回收员上门后现场议价确认
4. **电子单据** - 订单完成后生成电子单据
5. **用户钱包** - 订单结算自动入账，支持提现

### 回收员端
1. **任务管理** - 查看待接单、进行中、已完成订单
2. **接单操作** - 一键接单
3. **现场议价** - 输入最终价格
4. **订单完成** - 完成订单自动结算到用户钱包

## 项目结构
```
SecondHandRecycling/
├── backend/                     # SpringBoot后端
│   ├── src/main/
│   │   ├── java/com/recycling/
│   │   │   ├── common/          # 通用类
│   │   │   ├── config/          # 配置类
│   │   │   ├── controller/      # 控制器
│   │   │   ├── dto/             # 数据传输对象
│   │   │   ├── entity/          # 实体类
│   │   │   ├── exception/       # 异常处理
│   │   │   ├── mapper/          # 数据访问层
│   │   │   ├── security/        # 安全相关
│   │   │   ├── service/         # 业务逻辑层
│   │   │   ├── utils/           # 工具类
│   │   │   └── vo/              # 视图对象
│   │   └── resources/
│   │       ├── sql/             # SQL脚本
│   │       └── application.yml  # 配置文件
│   └── pom.xml
└── frontend/                    # Vue前端
    ├── src/
    │   ├── api/                 # API接口
    │   ├── router/              # 路由配置
    │   ├── styles/              # 样式
    │   ├── utils/               # 工具函数
    │   ├── views/               # 页面组件
    │   ├── App.vue
    │   └── main.js
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 数据库表
- `user` - 用户表
- `collector` - 回收员信息表
- `user_address` - 用户地址表
- `category` - 品类别表
- `estimate_model` - 估价模型表
- `appointment_order` - 预约订单表
- `electronic_receipt` - 电子单据表
- `collector_route` - 回收员行程表
- `inventory` - 库存与售卖表
- `user_wallet` - 用户钱包表
- `wallet_transaction` - 钱包流水表
- `withdraw_request` - 提现申请表

## 启动说明

### 1. 数据库初始化
```bash
# 登录MySQL
mysql -u root -p

# 执行SQL脚本
source backend/src/main/resources/sql/schema.sql
source backend/src/main/resources/sql/data.sql
```

默认数据库配置（application.yml）:
- 数据库名: `recycling_db`
- 用户名: `root`
- 密码: `123456`

### 2. 后端启动
```bash
cd backend

# 编译项目
mvn clean install

# 运行
mvn spring-boot:run
```

后端服务端口: `8080`
API 前缀: `/api`

### 3. 前端启动
```bash
cd frontend

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 生产构建
npm run build
```

前端服务端口: `3000`

## 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 普通用户 | user1 | 123456 |
| 回收员 | collector1 | 123456 |
| 管理员 | admin | 123456 |

## API 接口列表

### 认证接口
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `GET /api/auth/me` - 获取当前用户信息

### 品类接口
- `GET /api/category/list` - 获取一级品类
- `GET /api/category/children/{parentId}` - 获取子品类
- `GET /api/category/{id}` - 获取品类详情

### 估价接口
- `GET /api/estimate/factors/{categoryId}` - 获取估价因素
- `POST /api/estimate/calculate` - 计算预估价格

### 订单接口
- `POST /api/order/create` - 创建订单
- `GET /api/order/list` - 获取用户订单列表
- `GET /api/order/{id}` - 获取订单详情
- `POST /api/order/cancel/{id}` - 取消订单

### 地址接口
- `GET /api/address/list` - 获取地址列表
- `GET /api/address/default` - 获取默认地址
- `POST /api/address/add` - 添加地址
- `POST /api/address/setDefault/{id}` - 设为默认地址
- `DELETE /api/address/{id}` - 删除地址

### 钱包接口
- `GET /api/wallet` - 获取钱包信息
- `GET /api/wallet/transactions` - 获取交易记录
- `POST /api/wallet/withdraw` - 申请提现

### 回收员接口 (需要COLLECTOR角色)
- `GET /api/collector/orders` - 获取回收员订单
- `POST /api/collector/order/accept/{orderId}` - 接单
- `POST /api/collector/order/status/{orderId}` - 更新订单状态
- `POST /api/collector/order/negotiate/{orderId}` - 现场议价
- `POST /api/collector/order/complete/{orderId}` - 完成订单

## 订单状态流转
```
PENDING (待接单) 
    ↓
ACCEPTED (已接单) 
    ↓
ONWAY (上门中) 
    ↓
NEGOTIATING (议价中) 
    ↓
COMPLETED (已完成)
    ↓
CANCELLED (已取消) - 可在PENDING/ACCEPTED状态取消
```

## 核心业务流程

1. **用户下单流程**:
   - 选择品类 → 智能估价 → 填写地址 → 预约时间 → 生成订单

2. **回收员接单流程**:
   - 查看待接单 → 接单 → 上门 → 现场议价 → 完成订单 → 用户钱包自动入账

3. **结算流程**:
   - 订单完成 → 金额自动转入用户钱包 → 用户申请提现
