export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';
export const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as '7d' | '1d' | '30d' | number;
