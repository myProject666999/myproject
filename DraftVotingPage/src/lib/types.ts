export interface Contestant {
  id: number;
  name: string;
  avatar: string;
  description?: string;
  color: string;
  total_votes: number;
}

export interface User {
  id: number;
  phone: string;
  nickname: string;
  avatar?: string;
}

export interface VoteRecord {
  id: number;
  count: number;
  created_at: string;
  contestant_id: number;
  contestant_name: string;
  contestant_color: string;
}
