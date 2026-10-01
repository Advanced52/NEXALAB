import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../../common/utils/slugify';
import { ProductImage } from '../../database/entities/product-image.entity';
import { Product } from '../../database/entities/product.entity';
import { ProductType } from '../../database/enums';
import { CategoriesService } from '../categories/categories.service';
import { DivisionsService } from '../divisions/divisions.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imagesRepository: Repository<ProductImage>,
    private readonly divisionsService: DivisionsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    await this.divisionsService.findById(dto.divisionId);
    if (dto.categoryId) {
      await this.categoriesService.findById(dto.categoryId);
    }

    const slug = dto.slug?.trim() || slugify(dto.name);
    await this.ensureUniqueSlug(dto.divisionId, slug);

    const product = this.productsRepository.create({
      divisionId: dto.divisionId,
      categoryId: dto.categoryId ?? null,
      type: dto.type ?? ProductType.PHYSICAL,
      name: dto.name.trim(),
      slug,
      shortDescription: dto.shortDescription ?? null,
      description: dto.description ?? null,
      price: dto.price.toFixed(2),
      compareAtPrice:
        dto.compareAtPrice !== undefined
          ? dto.compareAtPrice.toFixed(2)
          : null,
      sku: dto.sku ?? null,
      stock: dto.stock ?? 0,
      weight: dto.weight !== undefined ? dto.weight.toFixed(3) : null,
      dimensions: dto.dimensions ?? null,
      isActive: dto.isActive ?? true,
      isFeatured: dto.isFeatured ?? false,
      seoTitle: dto.seoTitle ?? null,
      seoDescription: dto.seoDescription ?? null,
    });

    const saved = await this.productsRepository.save(product);

    if (dto.images?.length) {
      await this.replaceImages(saved.id, dto.images);
    }

    return this.findById(saved.id);
  }

  async findAll(query: ProductQueryDto, onlyActive = true): Promise<Product[]> {
    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.division', 'division')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants')
      .orderBy('product.createdAt', 'DESC')
      .addOrderBy('images.sortOrder', 'ASC');

    if (onlyActive) {
      qb.andWhere('product.is_active = :active', { active: true });
    }

    if (query.divisionId) {
      qb.andWhere('product.division_id = :divisionId', {
        divisionId: query.divisionId,
      });
    }

    if (query.divisionSlug) {
      qb.andWhere('division.slug = :divisionSlug', {
        divisionSlug: query.divisionSlug,
      });
    }

    if (query.categoryId) {
      qb.andWhere('product.category_id = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.categorySlug) {
      qb.andWhere('category.slug = :categorySlug', {
        categorySlug: query.categorySlug,
      });
    }

    if (query.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.inStock === true) {
      qb.andWhere('product.stock > 0');
    }

    if (query.type) {
      qb.andWhere('product.type = :type', { type: query.type });
    }

    if (query.featured === true) {
      qb.andWhere('product.is_featured = true');
    }

    if (query.search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.short_description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: {
        division: true,
        category: true,
        images: true,
        variants: { size: true, color: true },
      },
      order: {
        images: { sortOrder: 'ASC' },
      },
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async findBySlug(slug: string, divisionSlug?: string): Promise<Product> {
    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.division', 'division')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.size', 'size')
      .leftJoinAndSelect('variants.color', 'color')
      .where('product.slug = :slug', { slug })
      .andWhere('product.is_active = true')
      .orderBy('images.sortOrder', 'ASC');

    if (divisionSlug) {
      qb.andWhere('division.slug = :divisionSlug', { divisionSlug });
    }

    const product = await qb.getOne();
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);

    if (dto.divisionId && dto.divisionId !== product.divisionId) {
      await this.divisionsService.findById(dto.divisionId);
      product.divisionId = dto.divisionId;
    }

    if (dto.categoryId !== undefined) {
      if (dto.categoryId) {
        await this.categoriesService.findById(dto.categoryId);
      }
      product.categoryId = dto.categoryId ?? null;
    }

    const nextSlug =
      dto.slug?.trim() || (dto.name ? slugify(dto.name) : undefined);
    if (nextSlug && nextSlug !== product.slug) {
      await this.ensureUniqueSlug(product.divisionId, nextSlug, id);
      product.slug = nextSlug;
    }

    if (dto.type !== undefined) product.type = dto.type;
    if (dto.name !== undefined) product.name = dto.name.trim();
    if (dto.shortDescription !== undefined) {
      product.shortDescription = dto.shortDescription;
    }
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.price !== undefined) product.price = dto.price.toFixed(2);
    if (dto.compareAtPrice !== undefined) {
      product.compareAtPrice = dto.compareAtPrice.toFixed(2);
    }
    if (dto.sku !== undefined) product.sku = dto.sku;
    if (dto.stock !== undefined) product.stock = dto.stock;
    if (dto.weight !== undefined) product.weight = dto.weight.toFixed(3);
    if (dto.dimensions !== undefined) product.dimensions = dto.dimensions;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;
    if (dto.isFeatured !== undefined) product.isFeatured = dto.isFeatured;
    if (dto.seoTitle !== undefined) product.seoTitle = dto.seoTitle;
    if (dto.seoDescription !== undefined) {
      product.seoDescription = dto.seoDescription;
    }

    await this.productsRepository.save(product);

    if (dto.images) {
      await this.replaceImages(id, dto.images);
    }

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findById(id);
    await this.productsRepository.remove(product);
  }

  private async replaceImages(
    productId: string,
    images: NonNullable<CreateProductDto['images']>,
  ) {
    await this.imagesRepository.delete({ productId });
    const rows = images.map((image, index) =>
      this.imagesRepository.create({
        productId,
        url: image.url,
        alt: image.alt ?? null,
        isPrimary: image.isPrimary ?? index === 0,
        sortOrder: image.sortOrder ?? index,
      }),
    );
    await this.imagesRepository.save(rows);
  }

  private async ensureUniqueSlug(
    divisionId: string,
    slug: string,
    excludeId?: string,
  ) {
    const existing = await this.productsRepository.findOne({
      where: { divisionId, slug },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        `El slug "${slug}" ya existe en esta división`,
      );
    }
  }
}
