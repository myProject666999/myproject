CREATE DATABASE IF NOT EXISTS booklist_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE booklist_management;

DROP TABLE IF EXISTS book_tag;
DROP TABLE IF EXISTS reading_record;
DROP TABLE IF EXISTS book_list;
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS book;

CREATE TABLE book (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(20) UNIQUE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    author VARCHAR(255),
    translator VARCHAR(255),
    publisher VARCHAR(255),
    publish_date DATE,
    pages INT,
    price DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'CNY',
    binding VARCHAR(50),
    summary TEXT,
    cover_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_isbn (isbn),
    INDEX idx_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE book_list (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT NOT NULL,
    status ENUM('WISHLIST', 'READING', 'FINISHED') NOT NULL DEFAULT 'WISHLIST',
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tag (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(20) DEFAULT '#409EFF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE book_tag (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_list_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_list_id) REFERENCES book_list(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE,
    UNIQUE KEY uk_book_tag (book_list_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reading_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_list_id BIGINT NOT NULL,
    read_date DATE NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 0,
    pages_read INT,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_list_id) REFERENCES book_list(id) ON DELETE CASCADE,
    INDEX idx_read_date (read_date),
    INDEX idx_book_list (book_list_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tag (name, color) VALUES
('文学', '#409EFF'),
('历史', '#67C23A'),
('科技', '#E6A23C'),
('哲学', '#F56C6C'),
('经济', '#909399'),
('心理学', '#8e44ad'),
('小说', '#16a085'),
('传记', '#d35400'),
('科幻', '#2980b9'),
('艺术', '#c0392b');

INSERT INTO book (isbn, title, subtitle, author, translator, publisher, publish_date, pages, price, binding, summary, cover_url) VALUES
('9787020002207', '活着', NULL, '余华', NULL, '作家出版社', '2012-08-01', 191, 39.00, '平装', '《活着》是余华的代表作，讲述了农村人福贵悲惨的人生遭遇。', 'https://img3.doubanio.com/view/subject/l/public/s29055571.jpg'),
('9787544270878', '百年孤独', NULL, '加西亚·马尔克斯', '范晔', '南海出版公司', '2017-08-01', 360, 45.00, '精装', '《百年孤独》是魔幻现实主义文学的代表作，描写了布恩迪亚家族七代人的传奇故事。', 'https://img9.doubanio.com/view/subject/l/public/s29257164.jpg'),
('9787111213826', '人类简史', '从动物到上帝', '尤瓦尔·赫拉利', '林俊宏', '中信出版社', '2017-02-01', 440, 68.00, '精装', '从十万年前有生命迹象开始到21世纪资本、科技交织的人类发展史。', 'https://img3.doubanio.com/view/subject/l/public/s27826935.jpg');

INSERT INTO book_list (book_id, status, rating, review, start_date, end_date) VALUES
(1, 'FINISHED', 5, '非常震撼的作品，余华的写作让人深刻感受到生命的意义。', '2024-01-10', '2024-01-25'),
(2, 'READING', NULL, NULL, '2024-03-01', NULL),
(3, 'WISHLIST', NULL, NULL, NULL, NULL);

INSERT INTO book_tag (book_list_id, tag_id) VALUES
(1, 7),
(2, 1),
(2, 7),
(3, 2);

INSERT INTO reading_record (book_list_id, read_date, duration_minutes, pages_read, note) VALUES
(1, '2024-01-10', 60, 50, '开始阅读，被福贵的故事深深吸引'),
(1, '2024-01-12', 90, 80, '看到福贵失去亲人的部分，很感人'),
(1, '2024-01-25', 45, 61, '读完了，心情久久不能平静'),
(2, '2024-03-01', 50, 30, '开始阅读马尔克斯的经典'),
(2, '2024-03-05', 75, 60, '魔幻现实主义的魅力逐渐展现');
