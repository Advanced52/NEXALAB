export interface Role {
  id: string;
  name: string;
  description?: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  status: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: AuthUser;
}

export interface Division {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  primaryColor?: string | null;
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  categories?: Category[];
  products?: Product[];
  services?: ServiceItem[];
}

export interface Category {
  id: string;
  divisionId: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  division?: Division;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  stock: number;
  price?: string | number | null;
  sizeId?: string | null;
  colorId?: string | null;
  attributes?: Record<string, string> | null;
  imageUrl?: string | null;
  isActive: boolean;
  size?: { id: string; name: string; code?: string | null } | null;
  color?: { id: string; name: string; hexCode?: string | null } | null;
}

export interface Product {
  id: string;
  divisionId: string;
  categoryId?: string | null;
  type: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  price: string | number;
  compareAtPrice?: string | number | null;
  sku?: string | null;
  stock: number;
  weight?: string | number | null;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  division?: Division;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface ServiceItem {
  id: string;
  divisionId: string;
  categoryId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  priceType: string;
  price?: string | number | null;
  durationApprox?: string | null;
  features?: string[] | null;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  division?: Division;
  category?: Category;
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  description?: string | null;
  isPublic: boolean;
}

export interface ProductFilters {
  divisionId?: string;
  divisionSlug?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  type?: string;
  featured?: boolean;
  search?: string;
}
