DROP TABLE IF EXISTS note_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS books;

CREATE TABLE books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT '书名',
    author VARCHAR(255) NOT NULL COMMENT '作者',
    cover_url VARCHAR(500) DEFAULT NULL COMMENT '封面图片URL',
    total_pages INT DEFAULT 0 COMMENT '总页数',
    current_page INT DEFAULT 0 COMMENT '当前阅读页数',
    status VARCHAR(20) DEFAULT 'READING' COMMENT '状态：NOT_STARTED, READING, FINISHED',
    isbn VARCHAR(20) DEFAULT NULL COMMENT 'ISBN号',
    description TEXT DEFAULT NULL COMMENT '书籍描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='书籍表';

CREATE TABLE notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT NOT NULL COMMENT '所属书籍ID',
    content TEXT NOT NULL COMMENT '笔记内容',
    chapter VARCHAR(100) DEFAULT NULL COMMENT '章节',
    page_number INT DEFAULT NULL COMMENT '页码',
    highlight_color VARCHAR(20) DEFAULT '#FFEB3B' COMMENT '高亮颜色：#FFEB3B黄色, #4CAF50绿色, #2196F3蓝色, #F44336红色, #9C27B0紫色',
    is_favorite TINYINT(1) DEFAULT 0 COMMENT '是否收藏',
    review_count INT DEFAULT 0 COMMENT '回顾次数',
    last_reviewed_at TIMESTAMP NULL DEFAULT NULL COMMENT '最后回顾时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_book_id (book_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_favorite (is_favorite)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='笔记表';

CREATE TABLE tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
    color VARCHAR(20) DEFAULT '#2196F3' COMMENT '标签颜色',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_tag_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

CREATE TABLE note_tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    note_id BIGINT NOT NULL COMMENT '笔记ID',
    tag_id BIGINT NOT NULL COMMENT '标签ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY uk_note_tag (note_id, tag_id),
    INDEX idx_note_id (note_id),
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='笔记标签关联表';

INSERT INTO books (title, author, cover_url, total_pages, current_page, status, description) VALUES
('人类简史', '尤瓦尔·赫拉利', 'https://img3.doubanio.com/view/subject/l/public/s29594411.jpg', 440, 100, 'READING', '从认知革命、农业革命到科学革命，讲述人类的历史发展');

INSERT INTO notes (book_id, content, chapter, page_number, highlight_color, is_favorite) VALUES
(1, '大约在距今70000年前，智人开始出现前所未有的思考方式，用全新的语言沟通交流。', '认知革命', 45, '#FFEB3B', 1),
(1, '农业革命是历史上最大的骗局，小麦驯化了人类，而非人类驯化了小麦。', '农业革命', 120, '#4CAF50', 0),
(1, '金钱是有史以来最普遍也最有效的互信系统。', '人类的融合统一', 220, '#2196F3', 1);

INSERT INTO tags (name, color) VALUES
('历史', '#F44336'),
('哲学', '#9C27B0'),
('心理学', '#4CAF50'),
('经济学', '#FF9800'),
('科技', '#2196F3');

INSERT INTO note_tags (note_id, tag_id) VALUES
(1, 1),
(1, 2),
(2, 1),
(3, 4);
