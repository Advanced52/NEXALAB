import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Product } from './product.entity';
import { ServiceEntity } from './service.entity';

@Entity('business_divisions')
export class BusinessDivision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 140 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'short_description', type: 'varchar', length: 255, nullable: true })
  shortDescription: string | null;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({ name: 'banner_url', type: 'varchar', length: 500, nullable: true })
  bannerUrl: string | null;

  /** Imagen completa (sin recorte) para el carrusel del inicio */
  @Column({ name: 'hero_image_url', type: 'varchar', length: 500, nullable: true })
  heroImageUrl: string | null;

  @Column({ name: 'primary_color', type: 'varchar', length: 20, nullable: true })
  primaryColor: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'seo_title', type: 'varchar', length: 180, nullable: true })
  seoTitle: string | null;

  @Column({ name: 'seo_description', type: 'varchar', length: 320, nullable: true })
  seoDescription: string | null;

  @Column({ name: 'og_image', type: 'varchar', length: 500, nullable: true })
  ogImage: string | null;

  @OneToMany(() => Category, (category) => category.division)
  categories: Category[];

  @OneToMany(() => Product, (product) => product.division)
  products: Product[];

  @OneToMany(() => ServiceEntity, (service) => service.division)
  services: ServiceEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
