import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Color } from './color.entity';
import { Product } from './product.entity';
import { Size } from './size.entity';

@Entity('product_variants')
@Index(['productId', 'sku'], { unique: true })
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ length: 80 })
  sku: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price: string | null;

  @Column({ name: 'size_id', nullable: true })
  sizeId: string | null;

  @ManyToOne(() => Size, (size) => size.variants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'size_id' })
  size: Size | null;

  @Column({ name: 'color_id', nullable: true })
  colorId: string | null;

  @ManyToOne(() => Color, (color) => color.variants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'color_id' })
  color: Color | null;

  /** Atributos flexibles (material, acabado, etc.) */
  @Column({ type: 'jsonb', nullable: true })
  attributes: Record<string, string> | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
