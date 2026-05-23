import pool from './db';

export interface Blessing {
  id: number;
  name: string;
  message: string;
  avatar_color: string;
  created_at: string;
}

export interface Photo {
  id: number;
  file_name: string;
  file_path: string;
  caption: string | null;
  uploaded_by: string | null;
  sort_order: number;
  created_at: string;
}

export interface Music {
  id: number;
  file_name: string;
  file_path: string;
  music_name: string;
  artist: string | null;
  is_active: boolean;
}

export interface Setting {
  id: number;
  setting_key: string;
  setting_value: string | null;
}

export async function getBlessings(): Promise<Blessing[]> {
  const [rows] = await pool.query(
    'SELECT * FROM blessings ORDER BY created_at DESC'
  );
  return rows as Blessing[];
}

export async function addBlessing(name: string, message: string, avatarColor: string): Promise<Blessing> {
  const [result] = await pool.query(
    'INSERT INTO blessings (name, message, avatar_color) VALUES (?, ?, ?)',
    [name, message, avatarColor]
  );
  const insertId = (result as any).insertId;
  const [rows] = await pool.query('SELECT * FROM blessings WHERE id = ?', [insertId]);
  return (rows as Blessing[])[0];
}

export async function getPhotos(): Promise<Photo[]> {
  const [rows] = await pool.query(
    'SELECT * FROM photos ORDER BY sort_order ASC, created_at DESC'
  );
  return rows as Photo[];
}

export async function addPhoto(fileName: string, filePath: string, caption: string, uploadedBy: string): Promise<Photo> {
  const [result] = await pool.query(
    'INSERT INTO photos (file_name, file_path, caption, uploaded_by) VALUES (?, ?, ?, ?)',
    [fileName, filePath, caption, uploadedBy]
  );
  const insertId = (result as any).insertId;
  const [rows] = await pool.query('SELECT * FROM photos WHERE id = ?', [insertId]);
  return (rows as Photo[])[0];
}

export async function getActiveMusic(): Promise<Music | null> {
  const [rows] = await pool.query(
    'SELECT * FROM music WHERE is_active = TRUE LIMIT 1'
  );
  const musicList = rows as Music[];
  return musicList.length > 0 ? musicList[0] : null;
}

export async function getSetting(key: string): Promise<string | null> {
  const [rows] = await pool.query(
    'SELECT setting_value FROM settings WHERE setting_key = ?',
    [key]
  );
  const settings = rows as Setting[];
  return settings.length > 0 ? settings[0].setting_value : null;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await pool.query(
    'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
    [key, value, value]
  );
}
