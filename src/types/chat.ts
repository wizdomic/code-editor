export interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: number;
  type?: 'user' | 'system';
}