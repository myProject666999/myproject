USE online_training_attendance;

ALTER TABLE training MODIFY COLUMN qr_code TEXT;
ALTER TABLE checkin_session MODIFY COLUMN qr_code_content TEXT;
