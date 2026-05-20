-- 创建数据库
CREATE DATABASE IF NOT EXISTS movie_viewing_record DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE movie_viewing_record;

-- 影视表
CREATE TABLE IF NOT EXISTS movie (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT '标题',
    original_title VARCHAR(255) COMMENT '原名',
    type VARCHAR(20) NOT NULL COMMENT '类型：movie-电影, tv-电视剧',
    year INT COMMENT '年份',
    poster VARCHAR(500) COMMENT '海报链接',
    description TEXT COMMENT '简介',
    director VARCHAR(255) COMMENT '导演',
    actors VARCHAR(500) COMMENT '主演',
    genre VARCHAR(255) COMMENT '类型',
    duration INT COMMENT '时长（分钟）',
    imdb_id VARCHAR(50) UNIQUE COMMENT 'IMDb ID',
    douban_id VARCHAR(50) UNIQUE COMMENT '豆瓣ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_title_year_type (title, year, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='影视表';

-- 用户表
CREATE TABLE IF NOT EXISTS user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 观影记录表
CREATE TABLE IF NOT EXISTS viewing_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL COMMENT '状态：want-想看, watching-在看, watched-看过',
    rating DECIMAL(3,1) COMMENT '评分：0-10',
    review TEXT COMMENT '短评',
    watch_date DATE COMMENT '观看日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_movie (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movie(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='观影记录表';

-- 年度Top10表
CREATE TABLE IF NOT EXISTS year_top (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    year INT NOT NULL,
    movie_id BIGINT NOT NULL,
    rank INT NOT NULL COMMENT '排名：1-10',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_year_rank (user_id, year, rank),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movie(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='年度Top10表';

-- 创建默认用户
INSERT INTO user (username, password, nickname) VALUES 
('admin', '123456', '管理员')
ON DUPLICATE KEY UPDATE username=username;
