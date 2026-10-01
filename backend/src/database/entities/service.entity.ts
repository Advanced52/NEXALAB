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
import { ServicePriceType } from '../enums';
import { BusinessDivision } from './business-division.entity';
import { Category } from './category.entity';

@Entity('services')
@Index(['divisionId', 'slug'], { unique: true })
export class ServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'division_id' })
  divisionId: string;

  @ManyToOne(() => BusinessDivision, (division) => division.services, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'division_id' })
  division: BusinessDivision;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, (category) => category.services, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column({ length: 180 })
  name: string;

  @Column({ length: 200 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({
    name: 'price_type',
    type: 'enum',
    enum: ServicePriceType,
    default: ServicePriceType.QUOTE,
  })
  priceType: ServicePriceType;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price: string | null;

  @Column({ name: 'duration_approx', type: 'varchar', length: 120, nullable: true })
  durationApprox: string | null;

  @Column({ type: 'jsonb', nullable: true })
  features: string[] | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'seo_title', type: 'varchar', length: 180, nullable: true })
  seoTitle: string | null;

  @Column({ name: 'seo_description', type: 'varchar', length: 320, nullable: true })
  seoDescription: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
