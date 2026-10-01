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
import { Order } from './order.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { ServiceEntity } from './service.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'division_id', nullable: true })
  divisionId: string | null;

  @ManyToOne(() => BusinessDivision, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'division_id' })
  division: BusinessDivision | null;

  /** Snapshot para historial aunque cambie el nombre de la división */
  @Column({ name: 'division_name', type: 'varchar', length: 120, nullable: true })
  divisionName: string | null;

  @Column({
    name: 'item_type',
    type: 'enum',
    enum: CartItemType,
  })
  itemType: CartItemType;

  @Column({ name: 'product_id', nullable: true })
  productId: string | null;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product | null;

  @Column({ name: 'variant_id', nullable: true })
  variantId: string | null;

  @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant | null;

  @Column({ name: 'service_id', nullable: true })
  serviceId: string | null;

  @ManyToOne(() => ServiceEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'service_id' })
  service: ServiceEntity | null;

  @Column({ name: 'product_name', length: 200 })
  productName: string;

  @Column({ name: 'variant_label', type: 'varchar', length: 200, nullable: true })
  variantLabel: string | null;

  @Column({ name: 'sku', type: 'varchar', length: 80, nullable: true })
  sku: string | null;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice: string;

  @Column({ name: 'line_total', type: 'decimal', precision: 12, scale: 2 })
  lineTotal: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
