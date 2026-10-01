export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
}

export enum ServicePriceType {
  FIXED = 'fixed',
  FROM = 'from',
  QUOTE = 'quote',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  PENDING = 'pending',
  PAYPHONE = 'payphone',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  TRANSFER = 'transfer',
}

export enum InventoryMovementType {
  IN = 'in',
  OUT = 'out',
  ADJUSTMENT = 'adjustment',
}

export enum CartItemType {
  PRODUCT = 'product',
  VARIANT = 'variant',
  SERVICE = 'service',
}
