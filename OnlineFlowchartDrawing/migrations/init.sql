-- Online Flowchart Drawing Database Script
-- MySQL 8.x
CREATE DATABASE IF NOT EXISTS flowdb DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE flowdb;

DROP TABLE IF EXISTS edge;
DROP TABLE IF EXISTS shape;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS template;

CREATE TABLE project (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE shape (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  kind VARCHAR(32) NOT NULL,
  x DOUBLE NOT NULL,
  y DOUBLE NOT NULL,
  width DOUBLE NOT NULL,
  height DOUBLE NOT NULL,
  text TEXT,
  fill VARCHAR(32) DEFAULT '#FFFFFF',
  stroke VARCHAR(32) DEFAULT '#000000',
  stroke_width DOUBLE DEFAULT 1.5,
  font_size DOUBLE DEFAULT 14,
  color VARCHAR(32) DEFAULT '#111111',
  z_index INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_shape_project (project_id),
  CONSTRAINT fk_shape_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);

CREATE TABLE edge (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  source_id VARCHAR(36) NOT NULL,
  target_id VARCHAR(36) NOT NULL,
  label VARCHAR(120),
  style VARCHAR(16) DEFAULT 'solid',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_edge_project (project_id),
  CONSTRAINT fk_edge_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);

CREATE TABLE template (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(32) NOT NULL,
  thumbnail LONGTEXT NULL,
  nodes_json JSON NOT NULL,
  edges_json JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO template (id, name, category, nodes_json, edges_json) VALUES
('t-flow-basic', '基础流程图', 'flowchart',
 '[{"id":"n1","type":"rect","x":80,"y":60,"width":140,"height":60,"text":"开始","fill":"#EEF2FF","stroke":"#4F46E5","strokeWidth":2,"fontSize":14,"color":"#1E1B4B"},{"id":"n2","type":"diamond","x":80,"y":180,"width":140,"height":80,"text":"条件判断","fill":"#FEF3C7","stroke":"#F59E0B","strokeWidth":2,"fontSize":14,"color":"#78350F"},{"id":"n3","type":"rect","x":80,"y":320,"width":140,"height":60,"text":"结束","fill":"#DCFCE7","stroke":"#16A34A","strokeWidth":2,"fontSize":14,"color":"#14532D"}]',
 '[{"id":"e1","source":"n1","target":"n2","label":""},{"id":"e2","source":"n2","target":"n3","label":"是"}]'),
('t-uml-class', 'UML 类图', 'uml',
 '[{"id":"n1","type":"rect","x":60,"y":60,"width":180,"height":120,"text":"User\\n- id: int\\n- name: string","fill":"#E0F2FE","stroke":"#0284C7","strokeWidth":2,"fontSize":13,"color":"#0C4A6E"},{"id":"n2","type":"rect","x":320,"y":60,"width":180,"height":120,"text":"Order\\n- id: int\\n- total: number","fill":"#E0F2FE","stroke":"#0284C7","strokeWidth":2,"fontSize":13,"color":"#0C4A6E"}]',
 '[{"id":"e1","source":"n1","target":"n2","label":"1..*"}]'),
('t-er-basic', 'ER 图基础', 'er',
 '[{"id":"n1","type":"entity","x":60,"y":80,"width":160,"height":70,"text":"用户","fill":"#FCE7F3","stroke":"#DB2777","strokeWidth":2,"fontSize":14,"color":"#831843"},{"id":"n2","type":"entity","x":300,"y":80,"width":160,"height":70,"text":"订单","fill":"#FCE7F3","stroke":"#DB2777","strokeWidth":2,"fontSize":14,"color":"#831843"}]',
 '[{"id":"e1","source":"n1","target":"n2","label":"下单"}]');
