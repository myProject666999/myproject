USE shuttle_booking;

INSERT INTO schedules (schedule_no, route_id, shuttle_id, departure_date, departure_time, capacity, booked_seats, status) VALUES
('SCH20240115001', 1, 1, '2024-01-15', '07:30:00', 45, 20, 1),
('SCH20240115002', 2, 2, '2024-01-15', '08:00:00', 45, 42, 2),
('SCH20240115003', 3, 1, '2024-01-15', '18:00:00', 45, 15, 1),
('SCH20240115004', 4, 2, '2024-01-15', '18:30:00', 45, 30, 1);

INSERT INTO optimization_suggestions (suggestion_type, title, content, analysis_data, confidence_score, status, created_at) VALUES
(1, '站点需求建议：市政府站需求旺盛', '根据最近7天数据分析，市政府站累计乘车150人次，建议考虑增加途经该站点的班次或调整线路。', '{"station_id": 1, "station_name": "市政府站", "total_count": 150, "period": "最近7天"}', 85.5, 0, NOW()),
(1, '满载率高建议：上班1号线需增加班次', '根据最近7天数据分析，上班1号线平均满载率达到88%，建议在高峰时段增加班次以缓解运力压力。', '{"route_id": 1, "route_name": "市区上班1号线", "avg_load_rate": 0.88, "period": "最近7天"}', 92.0, 0, NOW()),
(2, '满载率低建议：下班2号线运力过剩', '根据最近7天数据分析，下班2号线平均满载率仅为25%，建议考虑调整线路走向或减少班次以优化资源配置。', '{"route_id": 4, "route_name": "市区下班2号线", "avg_load_rate": 0.25, "period": "最近7天"}', 75.0, 0, NOW());

INSERT INTO optimization_suggestions (suggestion_type, title, content, analysis_data, confidence_score, status, created_at) SELECT 1, '站点需求建议：市政府站需求旺盛', '根据最近7天数据分析，市政府站累计乘车150人次，建议考虑增加途经该站点的班次或调整线路。', '{"station_id": 1, "station_name": "市政府站", "total_count": 150, "period": "最近7天"}', 85.5, 0, NOW() WHERE NOT EXISTS (SELECT 1 FROM optimization_suggestions WHERE id = 1);
INSERT INTO optimization_suggestions (suggestion_type, title, content, analysis_data, confidence_score, status, created_at) SELECT 1, '满载率高建议：上班1号线需增加班次', '根据最近7天数据分析，上班1号线平均满载率达到88%，建议在高峰时段增加班次以缓解运力压力。', '{"route_id": 1, "route_name": "市区上班1号线", "avg_load_rate": 0.88, "period": "最近7天"}', 92.0, 0, NOW() WHERE NOT EXISTS (SELECT 1 FROM optimization_suggestions WHERE id = 2);
INSERT INTO optimization_suggestions (suggestion_type, title, content, analysis_data, confidence_score, status, created_at) SELECT 2, '满载率低建议：下班2号线运力过剩', '根据最近7天数据分析，下班2号线平均满载率仅为25%，建议考虑调整线路走向或减少班次以优化资源配置。', '{"route_id": 4, "route_name": "市区下班2号线", "avg_load_rate": 0.25, "period": "最近7天"}', 75.0, 0, NOW() WHERE NOT EXISTS (SELECT 1 FROM optimization_suggestions WHERE id = 3);
