export interface Service {
  name: string;
  price: string;
  description?: string;
  images?: string[];
}

export interface PortfolioTheme {
  primaryColor: string;
  style: 'elegant' | 'modern' | 'tech';
  font?: string; 
  layout?: 'imperial' | 'split' | 'minimal';
  background?: string; // New global background property
}

export interface PortfolioSection {
  type: 'hero' | 'services' | 'contact' | 'gallery' | 'bio' | 'experience' | 'social';
  content: any;
}

export interface PortfolioConfig {
  theme: PortfolioTheme;
  sections: PortfolioSection[];
  layoutType?: 'GALLERY' | 'CATALOGUE' | 'SERVICES';
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CreatorProfile {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  portfolio: PortfolioConfig;
  joinedAt: string;
  location?: { commune: string; address: string };
  phone?: string;
  tags?: string[];
  expiryDate?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isConfigUpdate?: boolean;
}

export enum AppView {
  LANDING = 'LANDING',
  ARENA = 'ARENA',
  WIZARD = 'WIZARD',
  REGISTER = 'REGISTER',
  LOGIN = 'LOGIN',
  ADMIN = 'ADMIN',
  TERMS = 'TERMS',
}

export interface Testimonial {
  name: string;
  review: string;
  rating: number;
}