CREATE DATABASE IF NOT EXISTS online_invoice_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE online_invoice_management;

-- 抬头管理
CREATE TABLE IF NOT EXISTS titles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '抬头名称',
    tax_number VARCHAR(50) NOT NULL COMMENT '税号',
    address VARCHAR(255) DEFAULT NULL COMMENT '地址',
    phone VARCHAR(50) DEFAULT NULL COMMENT '电话',
    bank_account VARCHAR(100) DEFAULT NULL COMMENT '银行账户',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tax_number (tax_number),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='抬头管理';

-- 开票申请
CREATE TABLE IF NOT EXISTS invoice_applications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title_id BIGINT UNSIGNED NOT NULL COMMENT '抬头ID',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-待审核 2-已通过 3-已驳回 4-已开票',
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '价税合计',
    net_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '不含税金额',
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '税额合计',
    applicant VARCHAR(100) DEFAULT NULL COMMENT '申请人',
    remark TEXT DEFAULT NULL COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title_id (title_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='开票申请';

-- 开票明细
CREATE TABLE IF NOT EXISTS invoice_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT UNSIGNED NOT NULL COMMENT '申请ID',
    product_name VARCHAR(255) NOT NULL COMMENT '商品/服务名称',
    specification VARCHAR(255) DEFAULT NULL COMMENT '规格型号',
    unit VARCHAR(50) DEFAULT NULL COMMENT '单位',
    quantity DECIMAL(15,4) NOT NULL DEFAULT 1.0000 COMMENT '数量',
    unit_price DECIMAL(15,4) NOT NULL DEFAULT 0.0000 COMMENT '单价(不含税)',
    amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '金额(不含税)',
    tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000 COMMENT '税率',
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '税额',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_application_id (application_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='开票明细';

-- 发票记录
CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT UNSIGNED NOT NULL COMMENT '申请ID',
    title_id BIGINT UNSIGNED NOT NULL COMMENT '抬头ID',
    invoice_number VARCHAR(50) NOT NULL COMMENT '发票号码',
    invoice_code VARCHAR(50) DEFAULT NULL COMMENT '发票代码',
    issued_date DATE NOT NULL COMMENT '开票日期',
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '价税合计',
    net_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '不含税金额',
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '税额',
    pdf_path VARCHAR(500) DEFAULT NULL COMMENT 'PDF文件路径',
    remark TEXT DEFAULT NULL COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_invoice_number (invoice_number),
    INDEX idx_application_id (application_id),
    INDEX idx_title_id (title_id),
    INDEX idx_issued_date (issued_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发票记录';

-- 插入测试抬头数据
INSERT INTO titles (name, tax_number, address, phone, bank_account) VALUES
('示例科技有限公司', '91330100MA2H123456', '浙江省杭州市西湖区文三路100号', '0571-88888888', '中国工商银行 1234567890123456789'),
('测试贸易有限公司', '91330200MA2H654321', '浙江省宁波市鄞州区人民路200号', '0574-66666666', '中国建设银行 9876543210987654321');

-- 插入测试申请数据
INSERT INTO invoice_applications (title_id, status, total_amount, net_amount, tax_amount, applicant, remark) VALUES
(1, 4, 11300.00, 10000.00, 1300.00, '张三', '2024年第一季度服务费'),
(1, 2, 5650.00, 5000.00, 650.00, '李四', '软件开发服务费'),
(2, 1, 22600.00, 20000.00, 2600.00, '王五', '设备采购费'),
(1, 3, 1000.00, 884.96, 115.04, '赵六', '驳回测试');

-- 插入测试明细数据
INSERT INTO invoice_items (application_id, product_name, specification, unit, quantity, unit_price, amount, tax_rate, tax_amount) VALUES
(1, '技术咨询服务', '', '次', 1.0000, 10000.0000, 10000.00, 0.1300, 1300.00),
(2, '软件开发服务', '', '项', 1.0000, 5000.0000, 5000.00, 0.1300, 650.00),
(3, '服务器设备', 'R740', '台', 2.0000, 10000.0000, 20000.00, 0.1300, 2600.00),
(4, '办公用品', '', '批', 1.0000, 884.9600, 884.96, 0.1300, 115.04);

-- 插入测试发票记录
INSERT INTO invoices (application_id, title_id, invoice_number, invoice_code, issued_date, total_amount, net_amount, tax_amount, pdf_path, remark) VALUES
(1, 1, '202401150001', '033001900111', '2024-01-15', 11300.00, 10000.00, 1300.00, '/pdf/202401150001.pdf', '第一季度服务费开票');