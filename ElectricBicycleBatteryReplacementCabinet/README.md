# 电动自行车换电柜运营管理系统

## 项目简介

本项目是一个完整的电动自行车换电柜运营管理系统，用于外卖骑手电动车换电场景。运营方可以通过本系统监控各换电柜的电池状态、调度满电电池并进行计费管理。

## 技术栈

- **后端**: Go 1.20 + Gin 1.9.0 + GORM 1.26.1
- **数据库**: MySQL 8.0+ + Redis 6.0+
- **前端**: Vue 2.7 + Element UI + ECharts + Leaflet (地图)
- **部署**: 单二进制文件，开箱即用

## 核心功能

### 1. 换电柜与电池管理
- 换电柜信息管理（位置、状态、槽位）
- 电池全生命周期管理（入库、使用、充电、维护、报废）
- 电池状态实时上报（电量、温度、健康度）
- 异常电池自动检测与手动下线

### 2. 换电交易（核心）
- **幂等性保证**: 通过唯一幂等键 + 数据库唯一索引 + 状态机，确保换电交易不重复执行
- **并发安全**: 使用数据库事务 + `FOR UPDATE` 行级锁，保证资源竞争时的数据一致性
- **完整交易流程**:
  1. 用户扫码开柜，归还低电量电池
  2. 系统验证电池归属，锁定空槽位
  3. 系统查找满电电池，锁定对应槽位
  4. 优先扣除套餐次数，不足则扣除钱包余额
  5. 更新电池状态、槽位状态、创建订单
  6. 提交事务，标记幂等成功

### 3. 订单与计费
- 换电订单全生命周期管理
- 支持两种支付方式：套餐次数抵扣 / 钱包余额
- 订单统计（今日/累计订单数、营收金额）
- 实时交易流水记录

### 4. 套餐与钱包
- 多种套餐类型（次卡、月卡、季卡）
- 套餐购买与使用管理
- 钱包余额管理（充值、消费、退款）
- **乐观锁**: 钱包使用 version 字段实现乐观锁，防止并发扣减超支
- 完整的账务流水记录

### 5. 调度补给
- **缺口算法**: 根据满电电池数量计算缺口等级（紧急/重要/一般）
- **距离计算**: 使用 Haversine 公式计算经纬度距离
- **智能路径规划**: 基于缺口优先级 + 地理位置距离，生成最优补给路线
- 调度任务全流程管理（创建 → 分配 → 执行 → 完成）

### 6. 异常告警
- 多类型告警（电池异常、换电柜异常、电量不足、温度异常）
- 多级别告警（紧急/重要/一般）
- 告警自动检测（低电量、低健康度、超高温）
- 告警处理流程（未处理 → 处理中 → 已处理/已忽略）

## 数据库设计

### 核心表结构

| 表名 | 说明 | 核心字段 |
|------|------|----------|
| `cabinet` | 换电柜主表 | id, cabinet_no, name, address, longitude, latitude, status, total_slots |
| `cabinet_slot` | 换电柜槽位表 | id, cabinet_id, slot_no, status, battery_id, lock_status |
| `battery` | 电池主表 | id, battery_no, model, capacity, current_soc, health_status, status, temperature |
| `battery_status_history` | 电池状态历史 | id, battery_id, soc, temperature, status, created_at |
| `order` | 换电订单表 | id, order_no, user_id, cabinet_id, out_battery_id, in_battery_id, amount, pay_amount, order_status, pay_status, **idempotent_key** |
| `package` | 套餐表 | id, name, type, total_times, duration_days, price, status |
| `user_package` | 用户套餐表 | id, user_id, package_id, total_times, remaining_times, start_time, end_time, status |
| `wallet` | 钱包表 | id, user_id, balance, total_recharge, total_consume, **version** |
| `wallet_transaction` | 钱包流水表 | id, trans_no, user_id, type, amount, balance_before, balance_after, idempotent_key |
| `dispatch_task` | 调度任务表 | id, task_no, type, priority, to_cabinet_id, battery_count, operator_id, status |
| `alert` | 告警表 | id, alert_no, type, level, cabinet_id, battery_id, title, content, status, handler_id |
| `idempotent_record` | 幂等记录表 | id, idempotent_key, biz_type, request_data, response_data, status |
| `user` | 用户表 | id, user_name, phone, password_hash, status |
| `operator` | 运维人员表 | id, name, phone, status |

### 关键设计

1. **幂等性**: `idempotent_key` 唯一索引保证交易不重复
2. **乐观锁**: `wallet.version` 防止并发扣减
3. **行级锁**: 事务中使用 `FOR UPDATE` 锁定资源
4. **索引优化**: 所有查询字段均建立合适索引

## 项目结构

```
ElectricBicycleBatteryReplacementCabinet/
├── config/                    # 配置模块
│   ├── config.yaml           # 配置文件
│   └── config.go             # 配置加载
├── sql/                       # 数据库脚本
│   └── init.sql              # 初始化脚本（含测试数据）
├── internal/
│   ├── pkg/                   # 公共包
│   │   ├── database/         # 数据库连接
│   │   │   ├── mysql.go
│   │   │   └── redis.go
│   │   ├── response/         # 统一响应
│   │   │   └── response.go
│   │   └── utils/            # 工具函数
│   │       └── idempotent.go # 幂等工具
│   ├── model/                 # 模型层
│   │   ├── cabinet.go
│   │   ├── battery.go
│   │   ├── order.go
│   │   ├── package.go
│   │   ├── wallet.go
│   │   ├── dispatch.go
│   │   ├── alert.go
│   │   └── user.go
│   ├── dao/                   # 数据访问层
│   │   ├── cabinet.go
│   │   ├── battery.go
│   │   ├── order.go
│   │   ├── package.go
│   │   ├── wallet.go
│   │   ├── dispatch.go
│   │   ├── alert.go
│   │   └── user.go
│   ├── service/               # 业务服务层
│   │   └── exchange.go       # 核心换电交易服务
│   ├── handler/               # API处理器
│   │   ├── cabinet.go
│   │   ├── battery.go
│   │   ├── order.go
│   │   ├── package.go
│   │   ├── wallet.go
│   │   ├── dispatch.go
│   │   ├── alert.go
│   │   └── auth.go
│   └── router/                # 路由配置
│       └── router.go
├── web/                       # 前端页面
│   ├── index.html            # 主页面
│   └── app.js                # 前端逻辑
├── main.go                    # 程序入口
├── go.mod
├── go.sum
├── server.exe                 # 编译后的可执行文件
└── README.md
```

## 快速开始

### 1. 环境要求

- Go 1.20+
- MySQL 8.0+
- Redis 6.0+ (可选，用于缓存和分布式锁)

### 2. 数据库配置

修改 `config/config.yaml`:

```yaml
mysql:
  host: 127.0.0.1
  port: 3306
  user: root
  password: "123456"
  database: battery_cabinet
```

### 3. 导入数据库

```bash
# 方式1：使用命令行
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < sql/init.sql

# 方式2：使用source命令
mysql -h 127.0.0.1 -P 3306 -u root -p123456
source d:/path/to/sql/init.sql
```

### 4. 编译运行

```bash
# 下载依赖
go mod tidy

# 编译
go build -o server.exe main.go

# 运行
.\server.exe
```

### 5. 访问系统

服务启动后，访问:
- 前端管理后台: http://localhost:8080/
- API文档: http://localhost:8080/api/

## API 接口列表

### 认证与仪表盘

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 登录 |
| GET | /api/dashboard | 仪表盘数据 |

### 换电柜管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/cabinet/list | 换电柜列表 |
| GET | /api/cabinet/map | 换电柜地图数据 |
| GET | /api/cabinet/stats | 换电柜统计 |
| GET | /api/cabinet/:id | 换电柜详情 |
| POST | /api/cabinet | 创建换电柜 |
| PUT | /api/cabinet/:id | 更新换电柜 |
| POST | /api/cabinet/exchange | **换电交易（核心）** |

### 电池管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/battery/list | 电池列表 |
| GET | /api/battery/stats | 电池统计 |
| GET | /api/battery/:id | 电池详情 |
| GET | /api/battery/:id/history | 电池状态历史 |
| POST | /api/battery/report | 电池状态上报 |
| POST | /api/battery/offline | 电池下线 |

### 订单管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/order/list | 订单列表 |
| GET | /api/order/stats | 订单统计 |
| GET | /api/order/:id | 订单详情 |

### 套餐管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/package/list | 套餐列表 |
| GET | /api/package/user/:user_id | 用户套餐列表 |
| POST | /api/package/purchase | 购买套餐 |

### 钱包管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/wallet/:user_id | 钱包详情 |
| POST | /api/wallet/recharge | 钱包充值 |
| POST | /api/wallet/consume | 钱包消费 |
| GET | /api/wallet/transaction/list | 交易流水 |

### 调度管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/dispatch/task/list | 调度任务列表 |
| GET | /api/dispatch/task/:id | 任务详情 |
| POST | /api/dispatch/task | 创建任务 |
| POST | /api/dispatch/task/assign | 分配任务 |
| POST | /api/dispatch/task/:id/start | 开始任务 |
| POST | /api/dispatch/task/complete | 完成任务 |
| GET | /api/dispatch/gaps | 电量缺口计算 |
| POST | /api/dispatch/plan | 生成调度路线 |
| POST | /api/dispatch/auto-create | 自动创建任务 |
| GET | /api/dispatch/operator/list | 运维人员列表 |

### 告警管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/alert/list | 告警列表 |
| GET | /api/alert/stats | 告警统计 |
| GET | /api/alert/:id | 告警详情 |
| POST | /api/alert | 创建告警 |
| POST | /api/alert/handle | 处理告警 |
| POST | /api/alert/check-battery | 自动检测电池告警 |

## 核心技术实现

### 1. 换电交易幂等性

```go
// 1. 前置幂等校验
record, err := utils.CheckIdempotent(idempotentKey, "battery_exchange", req)
if record != nil && record.Status == 2 {
    return record.ResponseData, nil // 已成功处理，直接返回
}

// 2. 开启事务，FOR UPDATE锁定所有资源
tx := database.DB.Begin()
defer tx.Rollback()

// 3. 验证归还电池归属
// 4. 获取满电电池和空槽位
// 5. 优先扣套餐次数，失败则扣钱包余额
// 6. 更新电池状态、槽位状态
// 7. 创建订单、记录电池状态历史

// 8. 提交事务，标记幂等成功
tx.Commit()
utils.SetIdempotentSuccess(idempotentKey, resp)
```

### 2. 钱包乐观锁

```go
// 使用 version 字段实现乐观锁
result := tx.Model(&wallet).
    Where("id = ? AND version = ?", wallet.ID, wallet.Version).
    Updates(map[string]interface{}{
        "balance":        wallet.Balance - req.Amount,
        "total_consume":  wallet.TotalConsume + req.Amount,
        "version":        wallet.Version + 1,
    })

if result.RowsAffected == 0 {
    return errors.New("并发冲突，请重试")
}
```

### 3. Haversine 距离计算

```go
func CalculateDistance(lat1, lng1, lat2, lng2 float64) float64 {
    const earthRadius = 6371.0 // 地球半径，单位：公里
    
    dLat := radians(lat2 - lat1)
    dLng := radians(lng2 - lng1)
    
    a := math.Sin(dLat/2)*math.Sin(dLat/2) +
        math.Cos(radians(lat1))*math.Cos(radians(lat2))*
        math.Sin(dLng/2)*math.Sin(dLng/2)
    
    c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
    
    return earthRadius * c
}
```

### 4. 智能调度规划

```go
// 1. 计算所有换电柜的满电电池缺口
gaps := calculateBatteryGaps()

// 2. 按缺口等级和距离排序
sort.Slice(gaps, func(i, j int) bool {
    if gaps[i].GapLevel != gaps[j].GapLevel {
        return gaps[i].GapLevel < gaps[j].GapLevel // 优先处理紧急缺口
    }
    return gaps[i].Distance < gaps[j].Distance // 同级优先近距离
})

// 3. 贪心算法生成路线，不超过最大运载量
plan := generateOptimalRoute(gaps, maxBatteries)
```

## 前端页面

系统包含5个核心管理页面：

### 1. 数据概览页
- 6个核心统计卡片（换电柜、电池、订单、告警、营收、低电量）
- 电池状态分布饼图
- 近7日订单趋势折线图
- 最新订单和最新告警列表

### 2. 换电柜地图页
- Leaflet 地图展示所有换电柜位置
- 不同颜色区分换电柜状态（正常/维护/离线）
- 点击标记查看换电柜详细信息
- 换电柜列表卡片，显示满电/空槽/低电量数量

### 3. 电池监控页
- 电池卡片网格布局，显示电量、健康度、状态
- 电量进度条可视化（绿色/橙色/红色）
- 支持按编号、状态、最低电量筛选
- 可查看电池详情，支持手动下线异常电池
- 一键自动检测电池告警

### 4. 换电订单页
- 订单列表，显示订单号、用户、换电柜、电池、金额、状态
- 支持按订单号、状态、支付状态筛选
- 分页显示

### 5. 调度补给页
- 左侧：电量缺口预警列表（紧急/重要/一般）
- 右侧：智能调度路线规划，支持一键生成
- 下方：调度任务列表，支持分配、开始、完成操作

### 6. 套餐钱包页
- 左侧：套餐展示卡片，支持在线购买
- 右侧：钱包余额显示、充值入口
- 我的套餐列表，显示剩余次数和有效期
- 交易流水记录

### 7. 异常告警页
- 6个告警统计卡片
- 告警列表，支持按类型、级别、状态筛选
- 告警处理流程（处理/忽略）
- 查看告警详情

## 测试数据

数据库初始化脚本已包含以下测试数据：

- 6个换电柜（不同位置，分布在北京市区）
- 72个槽位（每个换电柜12个槽位）
- 20个电池（不同电量、健康度、状态）
- 5个用户（含测试用户：张三、李四、王五等）
- 3个运维人员
- 3个套餐（10次卡、月卡、季卡）
- 3个历史订单
- 3个告警记录
- 2个调度任务

## 注意事项

1. **端口冲突**: 如果8080端口被占用，请修改 `config/config.yaml` 中的端口
2. **Redis连接**: 如果没有Redis，系统会自动降级，不影响核心功能
3. **时区**: 数据库连接默认使用本地时区，请根据需要调整
4. **生产部署**: 请将 `server.mode` 改为 `release`，并配置正确的日志路径

## 常见问题

### Q: 如何修改服务端口？
A: 修改 `config/config.yaml` 中的 `server.port` 字段。

### Q: 换电交易如何保证不重复？
A: 每次换电请求必须携带唯一的 `idempotent_key`，系统通过幂等记录表 + 唯一索引保证同一请求只处理一次。

### Q: 并发换电如何保证数据一致？
A: 系统使用数据库事务 + `FOR UPDATE` 行级锁，在事务开始时就锁定所有涉及的资源（槽位、电池、套餐、钱包），确保并发时的数据一致性。

### Q: 调度路线是如何计算的？
A: 系统使用 Haversine 公式计算两点经纬度距离，然后按缺口等级（优先）+ 距离（次优）进行贪心排序，生成最优补给路线。

## License

MIT
