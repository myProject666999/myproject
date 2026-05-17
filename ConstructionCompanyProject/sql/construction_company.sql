CREATE DATABASE IF NOT EXISTS construction_company DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE construction_company;

DROP TABLE IF EXISTS warranty;
DROP TABLE IF EXISTS acceptance;
DROP TABLE IF EXISTS customer_progress;
DROP TABLE IF EXISTS material_arrival;
DROP TABLE IF EXISTS material_purchase;
DROP TABLE IF EXISTS material;
DROP TABLE IF EXISTS daily_report;
DROP TABLE IF EXISTS work_order;
DROP TABLE IF EXISTS worker;
DROP TABLE IF EXISTS construction_node;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS contract;
DROP TABLE IF EXISTS quotation;
DROP TABLE IF EXISTS customer;

CREATE TABLE customer (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255),
    email VARCHAR(100),
    remark TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE quotation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    quotation_no VARCHAR(50) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 0 COMMENT '0:待确认,1:已确认,2:已拒绝',
    remark TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE contract (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    quotation_id BIGINT,
    contract_no VARCHAR(50) NOT NULL,
    contract_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status TINYINT NOT NULL DEFAULT 0 COMMENT '0:草稿,1:已签订,2:已终止',
    sign_date DATE,
    remark TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    FOREIGN KEY (quotation_id) REFERENCES quotation(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE project (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    project_name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    project_manager VARCHAR(50),
    status TINYINT NOT NULL DEFAULT 0 COMMENT '0:未开工,1:施工中,2:已暂停,3:已竣工,4:已验收',
    start_date DATE,
    end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    remark TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contract(id),
    FOREIGN KEY (customer_id) REFERENCES customer(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE construction_node (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL,
    node_name VARCHAR(50) NOT NULL COMMENT '水电/泥木/油漆/软装',
    node_type TINYINT NOT NULL COMMENT '1:水电,2:泥木,3:油漆,4:软装',
    plan_start_date DATE,
    plan_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    status TINYINT NOT NULL DEFAULT 0 COMMENT '0:未开始,1:进行中,2:已完成',
    progress INT NOT NULL DEFAULT 0 COMMENT '进度百分比0-100',
    remark TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES project(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE worker (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    id_card VARCHAR(18),
    skill VARCHAR(50) COMMENT '工种:水电工/木工/泥瓦工/油漆工等',
    work_years INT,
    status TINYINT NOT NULL DEFAULT 1 COMMENT '0:离职,1:在职',
    remark TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE work_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL,
    node_id BIGINT,
    worker_id BIGINT NOT NULL,
    work_content TEXT NOT NULL,
    plan_start_date DATE,
    plan_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    status TINYINT NOT NULL DEFAULT 0 COMMENT '0:待派工,1:已派工,2:施工中,3:已完成',
    work_hours DECIMAL(5,1),
    salary DECIMAL(10,2),
    remark TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (node_id) REFERENCES construction_node(id),
    FOREIGN KEY (worker_id) REFERENCES worker(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE daily_report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    work_order_id BIGINT NOT NULL,
    worker_id BIGINT NOT NULL,
    report_date DATE NOT NULL,
    work_content TEXT NOT NULL,
    work_hours DECIMAL(4,1) NOT NULL,
    problem TEXT,
    solution TEXT,
    tomorrow_plan TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (work_order_id) REFERENCES work_order(id),
    FOREIGN KEY (worker_id) REFERENCES worker(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE material (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    material_name VARCHAR(100) NOT NULL,
    material_code VARCHAR(50),
    specification VARCHAR(100),
    unit VARCHAR(20),
    unit_price DECIMAL(10,2),
    supplier VARCHAR(100),
    stock INT NOT NULL DEFAULT 0,
    remark TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE material_purchase (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL,
    material_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    purchase_date DATE,
    expected_arrival_date DATE,
    status TINYINT NOT NULL DEFAULT 0 COMMENT '0:待采购,1:已采购,2:已到货',
    purchaser VARCHAR(50),
    remark TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (material_id) REFERENCES material(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE material_arrival (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    purchase_id BIGINT NOT NULL,
    arrival_date DATE NOT NULL,
    arrival_quantity INT NOT NULL,
    inspector VARCHAR(50),
    inspection_result TEXT,
    photo_url VARCHAR(255),
    remark TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES material_purchase(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE customer_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL,
    node_id BIGINT,
    progress_date DATE NOT NULL,
    content TEXT NOT NULL,
    photo_urls TEXT COMMENT '多个照片URL用逗号分隔',
    customer_id BIGINT NOT NULL,
    customer_signature VARCHAR(255),
    status TINYINT NOT NULL DEFAULT 0 COMMENT '0:待确认,1:已确认,2:有异议',
    customer_feedback TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (node_id) REFERENCES construction_node(id),
    FOREIGN KEY (customer_id) REFERENCES customer(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE acceptance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL,
    node_id BIGINT,
    acceptance_type TINYINT NOT NULL COMMENT '1:节点验收,2:竣工验收',
    acceptance_date DATE,
    inspector VARCHAR(50),
    customer_id BIGINT NOT NULL,
    result TINYINT NOT NULL DEFAULT 0 COMMENT '0:待验收,1:合格,2:不合格需整改',
    problem TEXT,
    rectification TEXT,
    rectification_deadline DATE,
    remark TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (node_id) REFERENCES construction_node(id),
    FOREIGN KEY (customer_id) REFERENCES customer(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE warranty (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    acceptance_id BIGINT NOT NULL,
    warranty_start_date DATE NOT NULL,
    warranty_end_date DATE NOT NULL,
    warranty_content TEXT NOT NULL,
    warranty_items TEXT,
    status TINYINT NOT NULL DEFAULT 1 COMMENT '0:已过期,1:保修中',
    remark TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    FOREIGN KEY (acceptance_id) REFERENCES acceptance(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO customer (name, phone, address, email, remark) VALUES
('张三', '13800138001', '北京市朝阳区建国路88号', 'zhangsan@example.com', '老客户推荐'),
('李四', '13800138002', '北京市海淀区中关村大街1号', 'lisi@example.com', '全包'),
('王五', '13800138003', '北京市西城区金融街1号', 'wangwu@example.com', '半包');

INSERT INTO quotation (customer_id, quotation_no, total_amount, status, remark) VALUES
(1, 'Q2024001', 150000.00, 1, '120平米三居室'),
(2, 'Q2024002', 200000.00, 1, '150平米四居室'),
(3, 'Q2024003', 100000.00, 0, '90平米两居室');

INSERT INTO contract (customer_id, quotation_id, contract_no, contract_amount, start_date, end_date, status, sign_date, remark) VALUES
(1, 1, 'C2024001', 150000.00, '2024-03-01', '2024-07-01', 1, '2024-02-28', '标准合同'),
(2, 2, 'C2024002', 200000.00, '2024-03-15', '2024-08-15', 1, '2024-03-10', '高端装修');

INSERT INTO project (contract_id, customer_id, project_name, address, project_manager, status, start_date, end_date, actual_start_date, remark) VALUES
(1, 1, '张三家庭装修', '北京市朝阳区建国路88号', '王经理', 1, '2024-03-01', '2024-07-01', '2024-03-01', '按期开工'),
(2, 2, '李四家庭装修', '北京市海淀区中关村大街1号', '李经理', 0, '2024-03-15', '2024-08-15', NULL, '准备中');

INSERT INTO construction_node (project_id, node_name, node_type, plan_start_date, plan_end_date, actual_start_date, status, progress, remark) VALUES
(1, '水电改造', 1, '2024-03-01', '2024-03-15', '2024-03-01', 2, 100, '已完成'),
(1, '泥木工程', 2, '2024-03-16', '2024-04-30', '2024-03-16', 1, 60, '进行中'),
(1, '油漆工程', 3, '2024-05-01', '2024-05-31', NULL, 0, 0, '未开始'),
(1, '软装安装', 4, '2024-06-01', '2024-07-01', NULL, 0, 0, '未开始'),
(2, '水电改造', 1, '2024-03-15', '2024-03-30', NULL, 0, 0, '未开始');

INSERT INTO worker (name, phone, id_card, skill, work_years, status, remark) VALUES
('刘水电', '13900139001', '110101199001011234', '水电工', 8, 1, '技术熟练'),
('陈木工', '13900139002', '110101198501011234', '木工', 12, 1, '老师傅'),
('赵瓦工', '13900139003', '110101198801011234', '泥瓦工', 10, 1, '贴砖专业'),
('孙油漆', '13900139004', '110101199201011234', '油漆工', 6, 1, '喷漆无死角');

INSERT INTO work_order (project_id, node_id, worker_id, work_content, plan_start_date, plan_end_date, actual_start_date, status, work_hours, salary, remark) VALUES
(1, 1, 1, '全屋水电改造', '2024-03-01', '2024-03-15', '2024-03-01', 3, 120, 18000.00, '已完成'),
(1, 2, 2, '吊顶、衣柜制作', '2024-03-16', '2024-04-15', '2024-03-16', 2, 80, 12000.00, '进行中'),
(1, 2, 3, '墙面找平、贴砖', '2024-03-20', '2024-04-30', '2024-03-20', 2, 60, 9000.00, '进行中');

INSERT INTO daily_report (work_order_id, worker_id, report_date, work_content, work_hours, problem, solution, tomorrow_plan) VALUES
(2, 2, '2024-03-20', '完成客厅吊顶龙骨安装', 8.0, '无', '无', '继续安装卧室吊顶'),
(3, 3, '2024-03-20', '完成厨房墙面找平', 8.0, '无', '无', '开始贴厨房墙砖');

INSERT INTO material (material_name, material_code, specification, unit, unit_price, supplier, stock, remark) VALUES
('PPR水管', 'M001', '20mm', '米', 15.00, '伟星管业', 500, '冷热水管'),
('电线', 'M002', '2.5平方', '卷', 180.00, '远东电缆', 100, '国标铜线'),
('瓷砖', 'M003', '800x800mm', '块', 120.00, '东鹏瓷砖', 200, '抛釉砖'),
('乳胶漆', 'M004', '5L', '桶', 380.00, '多乐士', 50, '净味环保');

INSERT INTO material_purchase (project_id, material_id, quantity, unit_price, total_amount, purchase_date, expected_arrival_date, status, purchaser, remark) VALUES
(1, 1, 200, 15.00, 3000.00, '2024-02-28', '2024-03-01', 2, '采购员小张', '水电材料'),
(1, 2, 10, 180.00, 1800.00, '2024-02-28', '2024-03-01', 2, '采购员小张', '水电材料'),
(1, 3, 150, 120.00, 18000.00, '2024-03-15', '2024-03-18', 1, '采购员小张', '泥木材料');

INSERT INTO material_arrival (purchase_id, arrival_date, arrival_quantity, inspector, inspection_result, photo_url, remark) VALUES
(1, '2024-03-01', 200, '仓管员小李', '验收合格', '/images/m1.jpg', '数量正确'),
(2, '2024-03-01', 10, '仓管员小李', '验收合格', '/images/m2.jpg', '数量正确');

INSERT INTO customer_progress (project_id, node_id, progress_date, content, photo_urls, customer_id, status, customer_feedback) VALUES
(1, 1, '2024-03-10', '水电改造完成50%，管线铺设整齐', '/images/p1.jpg,/images/p2.jpg', 1, 1, '施工规范，满意'),
(1, 1, '2024-03-15', '水电改造全部完成，打压测试合格', '/images/p3.jpg,/images/p4.jpg', 1, 1, '很好'),
(1, 2, '2024-03-20', '泥木工程开始，吊顶龙骨安装中', '/images/p5.jpg', 1, 1, '进度正常');

INSERT INTO acceptance (project_id, node_id, acceptance_type, acceptance_date, inspector, customer_id, result, problem, remark) VALUES
(1, 1, 1, '2024-03-16', '监理王工', 1, 1, '无', '水电节点验收合格'),
(1, NULL, 2, NULL, '监理王工', 1, 0, NULL, '待竣工验收');

INSERT INTO warranty (project_id, customer_id, acceptance_id, warranty_start_date, warranty_end_date, warranty_content, warranty_items, status, remark) VALUES
(1, 1, 1, '2024-03-16', '2029-03-15', '水电工程质保5年', '水电管线、开关插座', 1, '质保期内免费维修');
