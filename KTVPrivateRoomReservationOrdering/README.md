
# KTV包厢预订与点歌系统

## 项目简介

这是一个基于 SpringBoot + Vue + MySQL 的 KTV 包厢预订与点歌系统，包含以下功能模块：

- 包厢类型与时段管理
- 在线预订（含押金）
- 包厢内点歌（多端控制）
- 酒水点单送达
- 结账与会员折扣

## 技术栈

### 后端
- Java 8
- Spring Boot 2.7.18
- MyBatis-Plus 3.5.3
- MySQL 8.x
- Druid 连接池
- Spring Security + JWT
- Lombok
- Hutool 工具库

### 前端
- Vue 2.6.14
- Vue Router 3.5.1
- Vuex 3.6.2
- Element UI 2.15.13
- Axios 0.27.2
- ECharts 5.4.0

## 项目结构

```
KTVPrivateRoomReservationOrdering/
├── backend/                    # 后端项目
│   ├── src/main/java/com/ktv/
│   │   ├── config/            # 配置类
│   │   ├── controller/        # 控制器
│   │   ├── service/           # 业务逻辑层
│   │   │   └── impl/          # 实现类
│   │   ├── mapper/            # 数据访问层
│   │   ├── entity/            # 实体类
│   │   ├── dto/               # 数据传输对象
│   │   ├── exception/         # 异常处理
│   │   ├── common/            # 通用模块
│   │   └── KtvApplication.java  # 启动类
│   ├── src/main/resources/
│   │   ├── db/                # 数据库脚本
│   │   │   ├── schema.sql     # 数据库表结构
│   │   │   └── data.sql       # 初始化数据
│   │   └── application.yml    # 配置文件
│   └── pom.xml
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── api/               # API 接口
│   │   ├── assets/            # 静态资源
│   │   ├── components/        # 公共组件
│   │   ├── router/            # 路由配置
│   │   ├── store/             # Vuex 状态管理
│   │   ├── views/             # 页面组件
│   │   │   ├── admin/         # 管理后台页面
│   │   │   ├── Home.vue
│   │   │   ├── Login.vue
│   │   │   ├── Booking.vue
│   │   │   ├── Order.vue
│   │   │   └── Song.vue
│   │   ├── App.vue
│   │   └── main.js
│   ├── public/
│   ├── package.json
│   └── vue.config.js
└── README.md
```

## 数据库设计

### 数据库名称
`ktv_booking_system`

### 数据表清单
1. `user` - 用户表（管理员、员工、会员）
2. `room_type` - 包厢类型表
3. `time_slot` - 时段表
4. `room_price` - 包厢价格表
5. `room` - 包厢表
6. `booking` - 预订表
7. `drink_category` - 酒水类别表
8. `drink` - 酒水表
9. `order` - 点单表
10. `order_detail` - 点单明细表
11. `song` - 歌曲库表
12. `song_queue` - 点歌队列表
13. `checkout` - 结账记录表
14. `payment` - 支付记录表
15. `member_discount` - 会员等级折扣表

## 快速开始

### 环境要求
- JDK 8+
- Node.js 14+
- MySQL 8.0+
- Maven 3.6+

### 1. 数据库配置

数据库连接信息（已在 application.yml 中配置）：
- IP: 127.0.0.1
- Port: 3306
- Username: root
- Password: 123456

### 2. 初始化数据库

数据库脚本已自动执行，包含：

**初始化数据概览：**
- 用户：6个（1个管理员、2个员工、3个会员）
- 包厢：18个（6个小包、6个中包、4个大包、2个VIP）
- 歌曲：64首（含周杰伦、Beyond、陈奕迅等热门歌手）
- 酒水：23种（啤酒、洋酒、红酒、饮料、小吃、水果）
- 时段：4个（早场、午场、晚场、夜场）

**测试账号：**
- 管理员：`admin` / `123456`
- 员工：`staff01` / `123456`
- 会员：`member01` / `123456`（金卡会员）

### 3. 启动后端

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

后端服务地址：http://localhost:8080

### 4. 启动前端

```bash
cd frontend
npm install
npm run serve
```

前端服务地址：http://localhost:8081

## 功能模块说明

### 1. 包厢类型与时段
- 支持多种包厢类型（小包、中包、大包、VIP）
- 时段定价（早场、午场、晚场、夜场）
- 押金机制

### 2. 在线预订
- 选择包厢类型、日期、时段
- 在线支付押金
- 预订状态追踪

### 3. 点歌系统（多端控制）
- 搜索歌曲（按歌名、歌手、专辑、语言）
- 点歌队列管理
- 歌曲置顶、删除
- WebSocket 实时同步

### 4. 酒水点单
- 酒水分类展示
- 购物车功能
- 订单状态追踪
- 配送管理

### 5. 结账与会员折扣
- 自动计算包厢费用+酒水费用
- 会员等级折扣
- 支持多种支付方式
- 积分累计

## 后续开发建议

1. **后端业务逻辑**：实现各模块的 Controller、Service、Mapper
2. **WebSocket**：实现点歌队列实时同步
3. **支付集成**：集成微信、支付宝支付
4. **文件上传**：实现酒水图片、歌曲文件上传
5. **数据报表**：完善 Dashboard 数据可视化

## 许可证

MIT License
