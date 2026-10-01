import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BusinessDivision } from './business-division.entity';
import { Product } from './product.entity';
import { ServiceEntity } from './service.entity';

@Entity('categories')
@Index(['divisionId', 'slug'], { unique: true })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'division_id' })
  divisionId: string;

  @ManyToOne(() => BusinessDivision, (division) => division.categories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'division_id' })
  division: BusinessDivision;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 140 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @OneToMany(() => ServiceEntity, (service) => service.category)
  services: ServiceEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
