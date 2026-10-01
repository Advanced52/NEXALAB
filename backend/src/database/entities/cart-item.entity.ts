import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItemType } from '../enums';
import { BusinessDivision } from './business-division.entity';
import { Cart } from './cart.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { ServiceEntity } from './service.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cart_id' })
  cartId: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ name: 'division_id', nullable: true })
  divisionId: string | null;

  @ManyToOne(() => BusinessDivision, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'division_id' })
  division: BusinessDivision | null;

  @Column({
    name: 'item_type',
    type: 'enum',
    enum: CartItemType,
  })
  itemType: CartItemType;

  @Column({ name: 'product_id', nullable: true })
  productId: string | null;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product | null;

  @Column({ name: 'variant_id', nullable: true })
  variantId: string | null;

  @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant | null;

  @Column({ name: 'service_id', nullable: true })
  serviceId: string | null;

  @ManyToOne(() => ServiceEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: ServiceEntity | null;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
