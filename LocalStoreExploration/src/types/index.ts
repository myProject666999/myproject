export interface User {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  bio: string;
  followersCount: number;
  notesCount: number;
  isVerified: number;
  createdAt: string;
}

export interface Shop {
  id: number;
  name: string;
  address: string;
  phone: string;
  category: string;
  coverImage: string;
  images: string[];
  rating: number;
  lat: number;
  lng: number;
  businessHours: string;
  notesCount: number;
  averageCost: number;
}

export interface Note {
  id: number;
  userId: number;
  shopId: number;
  title: string;
  content: string;
  images: string[];
  ratingOverall: number;
  ratingTaste: number;
  ratingEnv: number;
  ratingService: number;
  ratingCost: number;
  lat: number;
  lng: number;
  address: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  user: User;
  shop: Shop;
  distance?: number;
}

export interface Comment {
  id: number;
  userId: number;
  noteId: number;
  content: string;
  likesCount: number;
  createdAt: string;
  user: User;
}

export interface Favorite {
  id: number;
  userId: number;
  targetId: number;
  targetType: 'note' | 'shop';
  listType: 'want' | 'visited';
  createdAt: string;
}

export interface DarenRanking {
  rank: number;
  userId: number;
  hotScore: number;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 'all', name: '全部', icon: '🍽️' },
  { id: '火锅', name: '火锅', icon: '🍲' },
  { id: '日料', name: '日料', icon: '🍣' },
  { id: '咖啡', name: '咖啡', icon: '☕' },
  { id: '川菜', name: '川菜', icon: '🌶️' },
  { id: '甜品', name: '甜品', icon: '🍰' },
  { id: '烧烤', name: '烧烤', icon: '🍖' },
  { id: '西餐', name: '西餐', icon: '🥩' },
];
