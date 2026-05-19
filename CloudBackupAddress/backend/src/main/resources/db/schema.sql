CREATE TABLE IF NOT EXISTS address_book (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id VARCHAR(64) NOT NULL COMMENT '用户标识',
    name VARCHAR(100) DEFAULT '默认通讯录' COMMENT '通讯录名称',
    description VARCHAR(255) DEFAULT '' COMMENT '描述',
    contact_count INT DEFAULT 0 COMMENT '联系人数量',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    UNIQUE KEY uk_user_id (user_id),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通讯录表';

CREATE TABLE IF NOT EXISTS version_snapshot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    address_book_id BIGINT NOT NULL COMMENT '通讯录ID',
    version INT NOT NULL COMMENT '版本号',
    snapshot_data LONGTEXT NOT NULL COMMENT '快照数据(JSON格式)',
    contact_count INT DEFAULT 0 COMMENT '联系人数量',
    change_type VARCHAR(20) DEFAULT 'upload' COMMENT '变更类型: upload-上传, merge-合并, restore-还原',
    description VARCHAR(255) DEFAULT '' COMMENT '版本描述',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    UNIQUE KEY uk_address_book_version (address_book_id, version),
    INDEX idx_address_book_id (address_book_id),
    INDEX idx_created_time (created_time),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='版本快照表';

CREATE TABLE IF NOT EXISTS contact (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    address_book_id BIGINT NOT NULL COMMENT '通讯录ID',
    uid VARCHAR(64) NOT NULL COMMENT '联系人唯一标识(用于去重)',
    vcard_uid VARCHAR(128) DEFAULT '' COMMENT 'vCard中的UID',
    formatted_name VARCHAR(255) DEFAULT '' COMMENT '格式化姓名',
    first_name VARCHAR(100) DEFAULT '' COMMENT '名',
    last_name VARCHAR(100) DEFAULT '' COMMENT '姓',
    middle_name VARCHAR(100) DEFAULT '' COMMENT '中间名',
    nickname VARCHAR(100) DEFAULT '' COMMENT '昵称',
    title VARCHAR(100) DEFAULT '' COMMENT '职位',
    organization VARCHAR(255) DEFAULT '' COMMENT '公司/组织',
    department VARCHAR(255) DEFAULT '' COMMENT '部门',
    emails TEXT COMMENT '邮箱列表(JSON数组)',
    phones TEXT COMMENT '电话列表(JSON数组)',
    addresses TEXT COMMENT '地址列表(JSON数组)',
    urls TEXT COMMENT '网址列表(JSON数组)',
    birthday DATE DEFAULT NULL COMMENT '生日',
    note TEXT COMMENT '备注',
    photo MEDIUMTEXT COMMENT '头像(base64)',
    vcard_data LONGTEXT COMMENT '原始vCard数据',
    hash_code VARCHAR(64) NOT NULL COMMENT '内容哈希(用于检测变更)',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    UNIQUE KEY uk_address_book_uid (address_book_id, uid),
    INDEX idx_address_book_id (address_book_id),
    INDEX idx_formatted_name (formatted_name),
    INDEX idx_organization (organization),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='联系人表';

CREATE TABLE IF NOT EXISTS contact_version (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    version_snapshot_id BIGINT NOT NULL COMMENT '版本快照ID',
    contact_id BIGINT NOT NULL COMMENT '联系人ID',
    contact_data LONGTEXT NOT NULL COMMENT '联系人快照数据',
    change_type VARCHAR(20) NOT NULL COMMENT '变更类型: add-新增, update-更新, delete-删除, unchanged-未变',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_version_snapshot_id (version_snapshot_id),
    INDEX idx_contact_id (contact_id),
    INDEX idx_change_type (change_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='联系人版本关联表';
