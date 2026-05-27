export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  category: string;
  categoryId: number;
  brand: string;
  sales: number;
  rating: number;
  tags: string[];
}

export interface Sku {
  id: number;
  productId: number;
  color: string;
  colorCode: string;
  size: string;
  price: number;
  stock: number;
  image: string;
}

export interface CartItem {
  id: number;
  productId: number;
  skuId: number;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  selected: boolean;
}

export interface Order {
  id: string;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  items: CartItem[];
  totalAmount: number;
  createTime: string;
  payTime?: string;
  shipTime?: string;
  completeTime?: string;
  address: Address;
  trackingNumber?: string;
}

export interface Address {
  id: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

export interface User {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  phone: string;
  email: string;
  gender: 'male' | 'female' | 'unknown';
  birthday: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  children?: Category[];
}

export interface ProductFilter {
  categoryId?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  brands?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'sales_desc' | 'newest';
  page?: number;
  pageSize?: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
