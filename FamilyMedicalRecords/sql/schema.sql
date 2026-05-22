CREATE DATABASE IF NOT EXISTS family_medical_records
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE family_medical_records;

-- 家庭成员
CREATE TABLE IF NOT EXISTS family_member (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(64)  NOT NULL COMMENT '姓名(加密存储)',
    gender          TINYINT      NOT NULL COMMENT '1男 2女',
    birth_date      DATE         NOT NULL,
    id_card_no      VARCHAR(255) NOT NULL COMMENT '身份证号(加密存储)',
    phone           VARCHAR(255) NULL COMMENT '手机号(加密存储)',
    blood_type      VARCHAR(16)  NULL,
    height          DECIMAL(5,2) NULL,
    weight          DECIMAL(5,2) NULL,
    address         VARCHAR(255) NULL COMMENT '地址(加密存储)',
    relation        VARCHAR(32)  NOT NULL COMMENT '与户主关系',
    remark          VARCHAR(500) NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='家庭成员';

-- 就诊记录
CREATE TABLE IF NOT EXISTS visit_record (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    member_id       BIGINT UNSIGNED NOT NULL,
    visit_date      DATE         NOT NULL,
    hospital        VARCHAR(128) NOT NULL,
    department      VARCHAR(64)  NOT NULL,
    doctor          VARCHAR(64)  NULL,
    chief_complaint VARCHAR(500) NULL COMMENT '主诉',
    diagnosis       VARCHAR(500) NOT NULL COMMENT '诊断',
    prescription    TEXT         NULL COMMENT '处方/用药',
    medical_fee     DECIMAL(10,2) NULL,
    next_visit_date DATE         NULL COMMENT '复诊日期',
    remark          VARCHAR(500) NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_member_date (member_id, visit_date),
    CONSTRAINT fk_visit_member FOREIGN KEY (member_id) REFERENCES family_member(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='就诊记录';

-- 过敏史
CREATE TABLE IF NOT EXISTS allergy (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    member_id      BIGINT UNSIGNED NOT NULL,
    allergen       VARCHAR(128) NOT NULL COMMENT '过敏原',
    severity       TINYINT      NOT NULL DEFAULT 1 COMMENT '1轻 2中 3重',
    symptom        VARCHAR(500) NULL,
    first_occur_at DATE         NULL,
    remark         VARCHAR(500) NULL,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_member (member_id),
    CONSTRAINT fk_allergy_member FOREIGN KEY (member_id) REFERENCES family_member(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='过敏史';

-- 家族病史
CREATE TABLE IF NOT EXISTS family_history (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    member_id      BIGINT UNSIGNED NOT NULL,
    disease        VARCHAR(128) NOT NULL COMMENT '疾病名称',
    relation       VARCHAR(32)  NOT NULL COMMENT '患病亲属关系',
    relative_name  VARCHAR(64)  NULL COMMENT '亲属姓名(加密存储)',
    onset_age      INT          NULL,
    is_hereditary  TINYINT      NOT NULL DEFAULT 0 COMMENT '是否遗传性 0否1是',
    remark         VARCHAR(500) NULL,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_member (member_id),
    CONSTRAINT fk_history_member FOREIGN KEY (member_id) REFERENCES family_member(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='家族病史';

-- 复诊提醒
CREATE TABLE IF NOT EXISTS followup_reminder (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    visit_id       BIGINT UNSIGNED NOT NULL,
    member_id      BIGINT UNSIGNED NOT NULL,
    remind_date    DATE     NOT NULL,
    content        VARCHAR(500) NOT NULL,
    status         TINYINT  NOT NULL DEFAULT 0 COMMENT '0未提醒 1已提醒 2已完成',
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_remind_date (remind_date),
    INDEX idx_member (member_id),
    CONSTRAINT fk_remind_visit FOREIGN KEY (visit_id) REFERENCES visit_record(id) ON DELETE CASCADE,
    CONSTRAINT fk_remind_member FOREIGN KEY (member_id) REFERENCES family_member(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='复诊提醒';
