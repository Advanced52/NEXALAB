import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../../common/utils/slugify';
import { BusinessDivision } from '../../database/entities/business-division.entity';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';

@Injectable()
export class DivisionsService {
  constructor(
    @InjectRepository(BusinessDivision)
    private readonly divisionsRepository: Repository<BusinessDivision>,
  ) {}

  async create(dto: CreateDivisionDto): Promise<BusinessDivision> {
    const slug = dto.slug?.trim() || slugify(dto.name);
    await this.ensureUniqueSlug(slug);

    const division = this.divisionsRepository.create({
      name: dto.name.trim(),
      slug,
      description: dto.description ?? null,
      shortDescription: dto.shortDescription ?? null,
      logoUrl: dto.logoUrl ?? null,
      bannerUrl: dto.bannerUrl ?? null,
      primaryColor: dto.primaryColor ?? null,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
      seoTitle: dto.seoTitle ?? null,
      seoDescription: dto.seoDescription ?? null,
      ogImage: dto.ogImage ?? null,
    });

    return this.divisionsRepository.save(division);
  }

  findAllActive(): Promise<BusinessDivision[]> {
    return this.divisionsRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  findAll(): Promise<BusinessDivision[]> {
    return this.divisionsRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findById(id: string): Promise<BusinessDivision> {
    const division = await this.divisionsRepository.findOne({ where: { id } });
    if (!division) {
      throw new NotFoundException('División no encontrada');
    }
    return division;
  }

  async findBySlug(slug: string, onlyActive = true): Promise<BusinessDivision> {
    const division = await this.divisionsRepository.findOne({
      where: onlyActive ? { slug, isActive: true } : { slug },
    });
    if (!division) {
      throw new NotFoundException('División no encontrada');
    }
    return division;
  }

  async findBySlugWithCatalog(slug: string): Promise<BusinessDivision> {
    const division = await this.divisionsRepository.findOne({
      where: { slug, isActive: true },
      relations: {
        categories: true,
        products: { images: true },
        services: true,
      },
      order: {
        categories: { sortOrder: 'ASC' },
        products: { name: 'ASC' },
        services: { name: 'ASC' },
      },
    });

    if (!division) {
      throw new NotFoundException('División no encontrada');
    }

    division.categories = (division.categories ?? []).filter((c) => c.isActive);
    division.products = (division.products ?? []).filter((p) => p.isActive);
    division.services = (division.services ?? []).filter((s) => s.isActive);

    return division;
  }

  async update(id: string, dto: UpdateDivisionDto): Promise<BusinessDivision> {
    const division = await this.findById(id);

    if (dto.slug && dto.slug !== division.slug) {
      await this.ensureUniqueSlug(dto.slug, id);
      division.slug = dto.slug;
    } else if (dto.name && !dto.slug) {
      // keep existing slug unless explicitly changed
    }

    if (dto.name !== undefined) division.name = dto.name.trim();
    if (dto.description !== undefined) division.description = dto.description;
    if (dto.shortDescription !== undefined) {
      division.shortDescription = dto.shortDescription;
    }
    if (dto.logoUrl !== undefined) division.logoUrl = dto.logoUrl;
    if (dto.bannerUrl !== undefined) division.bannerUrl = dto.bannerUrl;
    if (dto.primaryColor !== undefined) division.primaryColor = dto.primaryColor;
    if (dto.isActive !== undefined) division.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) division.sortOrder = dto.sortOrder;
    if (dto.seoTitle !== undefined) division.seoTitle = dto.seoTitle;
    if (dto.seoDescription !== undefined) {
      division.seoDescription = dto.seoDescription;
    }
    if (dto.ogImage !== undefined) division.ogImage = dto.ogImage;

    return this.divisionsRepository.save(division);
  }

  async remove(id: string): Promise<void> {
    const division = await this.findById(id);
    await this.divisionsRepository.remove(division);
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string) {
    const existing = await this.divisionsRepository.findOne({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`El slug "${slug}" ya está en uso`);
    }
  }
}
