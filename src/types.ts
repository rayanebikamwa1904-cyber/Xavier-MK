export enum AppView {
  LANDING = 'LANDING',
  WIZARD = 'WIZARD',
  REGISTER = 'REGISTER',
  LOGIN = 'LOGIN',
  ADMIN = 'ADMIN',
  TERMS = 'TERMS',
  ARENA = 'ARENA',
}

export interface Location {
  commune: string;
  address: string;
}

export interface Theme {
  primaryColor: string;
  style: string;
}

export interface SectionContent {
  title?: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  buttonText?: string;
  image?: string;
  name?: string;
  stats?: {
    years: number;
    projects: number;
  };
  items?: {
    name: string;
    description: string;
    price: string;
  }[];
  images?: string[];
  address?: string;
  actionValue?: string;
  phone?: string;
  email?: string;
  userAvatar?: string;
  posts?: any[];
}

export interface Section {
  type: 'hero' | 'bio' | 'services' | 'gallery' | 'contact' | 'social';
  content: SectionContent;
}

export interface Portfolio {
  theme: Theme;
  sections: Section[];
  layoutType: string;
}

export interface CreatorProfile {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  joinedAt: string;
  location: Location;
  phone: string;
  tags: string[];
  expiryDate?: any;
  portfolioTitle?: string;
  labels?: string[];
  templateId?: string;
  googleFormUrl?: string;
  portfolio: Portfolio;
  portfolioSlug?: string;
}

export interface Template {
    id: string;
    name: string;
    description: string;
    previewImage: string;
    tags: string[];
    theme: {
        style: string;
    };
    layoutType: 'GALLERY' | 'FEED' | 'MINIMAL';
}
export interface TemplateConfig {
    templates: Template[];
}
