-- 装修公司项目进度管理系统数据库脚本

-- 删除数据库（如果存在）
DROP DATABASE IF EXISTS construction_company;

-- 创建数据库
CREATE DATABASE IF NOT EXISTS construction_company DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE construction_company;

-- 客户表
CREATE TABLE IF NOT EXISTS customer (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 报价单表
CREATE TABLE IF NOT EXISTS quotation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- 合同表
CREATE TABLE IF NOT EXISTS contract (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    quotation_id INT NOT NULL,
    contract_no VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'signed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    FOREIGN KEY (quotation_id) REFERENCES quotation(id)
);

-- 项目表
CREATE TABLE IF NOT EXISTS project (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contract_id INT NOT NULL,
    project_name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contract(id)
);

-- 施工节点表
CREATE TABLE IF NOT EXISTS construction_node (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    node_name VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'pending',
    FOREIGN KEY (project_id) REFERENCES project(id)
);

-- 工人表
CREATE TABLE IF NOT EXISTS worker (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    skill VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'available'
);

-- 派工表
CREATE TABLE IF NOT EXISTS work_assignment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    worker_id INT NOT NULL,
    node_id INT NOT NULL,
    assignment_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'assigned',
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (worker_id) REFERENCES worker(id),
    FOREIGN KEY (node_id) REFERENCES construction_node(id)
);

-- 日报表
CREATE TABLE IF NOT EXISTS daily_report (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    report_date DATE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES work_assignment(id)
);

-- 材料表
CREATE TABLE IF NOT EXISTS material (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- 采购表
CREATE TABLE IF NOT EXISTS purchase (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    material_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    purchase_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ordered',
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (material_id) REFERENCES material(id)
);

-- 到货登记表
CREATE TABLE IF NOT EXISTS delivery (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_id INT NOT NULL,
    delivery_date DATE NOT NULL,
    quantity_received DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'delivered',
    FOREIGN KEY (purchase_id) REFERENCES purchase(id)
);

-- 进度表
CREATE TABLE IF NOT EXISTS progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    progress_date DATE NOT NULL,
    content TEXT NOT NULL,
    photo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES project(id)
);

-- 验收表
CREATE TABLE IF NOT EXISTS inspection (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    inspection_date DATE NOT NULL,
    inspector VARCHAR(50) NOT NULL,
    result VARCHAR(20) NOT NULL,
    comments TEXT,
    FOREIGN KEY (project_id) REFERENCES project(id)
);

-- 质保表
CREATE TABLE IF NOT EXISTS warranty (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (project_id) REFERENCES project(id)
);

-- 创建索引
CREATE INDEX idx_customer_phone ON customer(phone);
CREATE INDEX idx_quotation_customer ON quotation(customer_id);
CREATE INDEX idx_contract_customer ON contract(customer_id);
CREATE INDEX idx_project_contract ON project(contract_id);
CREATE INDEX idx_node_project ON construction_node(project_id);
CREATE INDEX idx_worker_skill ON worker(skill);
CREATE INDEX idx_assignment_project ON work_assignment(project_id);
CREATE INDEX idx_assignment_worker ON work_assignment(worker_id);
CREATE INDEX idx_report_assignment ON daily_report(assignment_id);
CREATE INDEX idx_purchase_project ON purchase(project_id);
CREATE INDEX idx_purchase_material ON purchase(material_id);
CREATE INDEX idx_delivery_purchase ON delivery(purchase_id);
CREATE INDEX idx_progress_project ON progress(project_id);
CREATE INDEX idx_inspection_project ON inspection(project_id);
CREATE INDEX idx_warranty_project ON warranty(project_id);

-- 插入测试数据
INSERT INTO customer (name, phone, address) VALUES
('Zhang San', '13800138001', 'Beijing'),
('Li Si', '13900139002', 'Shanghai'),
('Wang Wu', '13700137003', 'Guangzhou');

INSERT INTO quotation (customer_id, total_amount, status) VALUES
(1, 100000.00, 'accepted'),
(2, 150000.00, 'accepted'),
(3, 80000.00, 'pending');

INSERT INTO contract (customer_id, quotation_id, contract_no, total_amount, start_date, end_date, status) VALUES
(1, 1, 'HT2024001', 100000.00, '2024-01-01', '2024-03-31', 'in_progress'),
(2, 2, 'HT2024002', 150000.00, '2024-02-01', '2024-04-30', 'in_progress');

INSERT INTO project (contract_id, project_name, address, status) VALUES
(1, 'Zhang San Project', 'Beijing', 'in_progress'),
(2, 'Li Si Project', 'Shanghai', 'in_progress');

INSERT INTO construction_node (project_id, node_name, start_date, end_date, status) VALUES
(1, 'Water and Electricity', '2024-01-01', '2024-01-15', 'completed'),
(1, 'Masonry and Wood', '2024-01-16', '2024-02-15', 'in_progress'),
(1, 'Painting', '2024-02-16', '2024-03-15', 'pending'),
(1, 'Soft Decoration', '2024-03-16', '2024-03-31', 'pending'),
(2, 'Water and Electricity', '2024-02-01', '2024-02-15', 'completed'),
(2, 'Masonry and Wood', '2024-02-16', '2024-03-15', 'in_progress');

INSERT INTO worker (name, phone, skill, status) VALUES
('Zhao Master', '13800138004', 'Electrician', 'available'),
('Qian Master', '13900139005', 'Mason', 'busy'),
('Sun Master', '13700137006', 'Carpenter', 'busy'),
('Li Master', '13600136007', 'Painter', 'available');

INSERT INTO work_assignment (project_id, worker_id, node_id, assignment_date, status) VALUES
(1, 1, 1, '2024-01-01', 'completed'),
(1, 2, 2, '2024-01-16', 'in_progress'),
(2, 1, 5, '2024-02-01', 'completed'),
(2, 2, 6, '2024-02-16', 'in_progress');

INSERT INTO daily_report (assignment_id, report_date, content) VALUES
(1, '2024-01-01', 'Start water and electricity construction'),
(1, '2024-01-02', 'Complete circuit wiring'),
(2, '2024-01-16', 'Start masonry construction'),
(2, '2024-01-17', 'Continue wall construction');

INSERT INTO material (name, type, unit, price) VALUES
('Wire', 'Electrical Material', 'meter', 5.00),
('Pipe', 'Plumbing Material', 'meter', 10.00),
('Cement', 'Masonry Material', 'bag', 25.00),
('Wood', 'Wood Material', 'cubic meter', 1000.00),
('Paint', 'Painting Material', 'bucket', 200.00),
('Tile', 'Masonry Material', 'square meter', 80.00);

INSERT INTO purchase (project_id, material_id, quantity, total_price, purchase_date, status) VALUES
(1, 1, 100.00, 500.00, '2024-01-01', 'delivered'),
(1, 2, 50.00, 500.00, '2024-01-01', 'delivered'),
(1, 3, 20.00, 500.00, '2024-01-15', 'delivered'),
(2, 1, 150.00, 750.00, '2024-02-01', 'delivered');

INSERT INTO delivery (purchase_id, delivery_date, quantity_received, status) VALUES
(1, '2024-01-02', 100.00, 'checked'),
(2, '2024-01-02', 50.00, 'checked'),
(3, '2024-01-16', 20.00, 'checked'),
(4, '2024-02-02', 150.00, 'checked');

INSERT INTO progress (project_id, progress_date, content, photo_url) VALUES
(1, '2024-01-01', 'Start water and electricity construction', 'photo1.jpg'),
(1, '2024-01-15', 'Complete water and electricity construction', 'photo2.jpg'),
(1, '2024-01-16', 'Start masonry construction', 'photo3.jpg'),
(2, '2024-02-01', 'Start water and electricity construction', 'photo4.jpg'),
(2, '2024-02-15', 'Complete water and electricity construction', 'photo5.jpg');

INSERT INTO inspection (project_id, inspection_date, inspector, result, comments) VALUES
(1, '2024-01-15', 'Wang Engineer', 'passed', 'Good quality'),
(2, '2024-02-15', 'Li Engineer', 'passed', 'Good quality');

INSERT INTO warranty (project_id, start_date, end_date, status) VALUES
(1, '2024-03-31', '2025-03-31', 'active'),
(2, '2024-04-30', '2025-04-30', 'active');
