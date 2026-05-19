# 通讯录云备份系统

## 项目简介

基于 Spring Boot + Vue + MySQL 实现的通讯录云备份系统，支持 vCard 文件上传解析、版本快照、增量对比、还原下载、合并去重等核心功能。

## 技术栈

### 后端
- Spring Boot 3.2.0
- MyBatis-Plus 3.5.5
- MySQL 8.0+
- ez-vcard (vCard 解析库)
- Hutool 工具库

### 前端
- Vue 3.4
- Element Plus 2.4
- Vue Router 4
- Axios
- Vite

## 核心功能

1. **vCard 上传解析** - 支持 .vcf/.vcard 格式文件上传，自动解析联系人信息
2. **版本快照** - 每次操作自动生成版本快照，记录历史数据
3. **增量对比** - 对比两个版本之间的差异（新增、删除、修改）
4. **还原下载** - 支持从任意历史版本还原，或导出为 vCard 文件
5. **合并去重** - 支持历史版本合并，自动检测并去除重复联系人

## 数据库配置

数据库已创建并导入，配置如下：

- 地址: 127.0.0.1
- 端口: 3306
- 用户名: root
- 密码: 123456
- 数据库名: cloud_backup_address

## 快速开始

### 后端启动

```bash
cd backend
mvn spring-boot:run
```

后端服务启动在 http://localhost:8080/api

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端服务启动在 http://localhost:3000

## API 接口

### 联系人相关
- `POST /api/contacts/upload` - 上传 vCard 文件
- `GET /api/contacts/list` - 获取联系人列表
- `GET /api/contacts/export` - 导出当前通讯录
- `GET /api/contacts/export-version/{snapshotId}` - 导出指定版本
- `POST /api/contacts/restore/{snapshotId}` - 从指定版本还原
- `POST /api/contacts/merge/{snapshotId}` - 合并指定版本
- `POST /api/contacts/deduplicate` - 合并去重

### 版本相关
- `GET /api/versions/list` - 获取版本列表
- `GET /api/versions/{snapshotId}` - 获取版本详情
- `GET /api/versions/compare` - 对比两个版本
- `DELETE /api/versions/{snapshotId}` - 删除版本

## 项目结构

```
CloudBackupAddress/
├── backend/                    # 后端项目
│   ├── src/main/java/com/cloudbackup/
│   │   ├── controller/         # 控制层
│   │   ├── service/            # 业务层
│   │   ├── mapper/             # 数据访问层
│   │   ├── entity/             # 实体类
│   │   ├── config/             # 配置类
│   │   ├── common/             # 公共类
│   │   └── util/               # 工具类
│   └── src/main/resources/
│       └── application.yml     # 配置文件
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   ├── api/                # API 接口
│   │   ├── router/             # 路由配置
│   │   └── App.vue             # 根组件
│   └── package.json
└── sql/
    └── init.sql                # 数据库脚本
```

## 关键页面

1. **上传备份** - 上传 vCard 文件，解析并查看联系人
2. **版本历史** - 查看所有历史版本记录
3. **版本对比** - 选择两个版本进行差异对比
4. **下载还原** - 导出通讯录、还原历史版本、合并去重
