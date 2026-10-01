import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../../common/utils/slugify';
import { ServiceEntity } from '../../database/entities/service.entity';
import { ServicePriceType } from '../../database/enums';
import { CategoriesService } from '../categories/categories.service';
import { DivisionsService } from '../divisions/divisions.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly servicesRepository: Repository<ServiceEntity>,
    private readonly divisionsService: DivisionsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(dto: CreateServiceDto): Promise<ServiceEntity> {
    await this.divisionsService.findById(dto.divisionId);
    if (dto.categoryId) {
      await this.categoriesService.findById(dto.categoryId);
    }

    const slug = dto.slug?.trim() || slugify(dto.name);
    await this.ensureUniqueSlug(dto.divisionId, slug);

    const service = this.servicesRepository.create({
      divisionId: dto.divisionId,
      categoryId: dto.categoryId ?? null,
      name: dto.name.trim(),
      slug,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl ?? null,
      priceType: dto.priceType ?? ServicePriceType.QUOTE,
      price: dto.price !== undefined ? dto.price.toFixed(2) : null,
      durationApprox: dto.durationApprox ?? null,
      features: dto.features ?? null,
      isActive: dto.isActive ?? true,
      isFeatured: dto.isFeatured ?? false,
      seoTitle: dto.seoTitle ?? null,
      seoDescription: dto.seoDescription ?? null,
    });

    return this.servicesRepository.save(service);
  }

  findAll(filters?: {
    divisionId?: string;
    divisionSlug?: string;
    onlyActive?: boolean;
  }): Promise<ServiceEntity[]> {
    const qb = this.servicesRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.division', 'division')
      .leftJoinAndSelect('service.category', 'category')
      .orderBy('service.name', 'ASC');

    if (filters?.onlyActive !== false) {
      qb.andWhere('service.is_active = true');
    }

    if (filters?.divisionId) {
      qb.andWhere('service.division_id = :divisionId', {
        divisionId: filters.divisionId,
      });
    }

    if (filters?.divisionSlug) {
      qb.andWhere('division.slug = :divisionSlug', {
        divisionSlug: filters.divisionSlug,
      });
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<ServiceEntity> {
    const service = await this.servicesRepository.findOne({
      where: { id },
      relations: { division: true, category: true },
    });
    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return service;
  }

  async findBySlug(slug: string, divisionSlug?: string): Promise<ServiceEntity> {
    const qb = this.servicesRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.division', 'division')
      .leftJoinAndSelect('service.category', 'category')
      .where('service.slug = :slug', { slug })
      .andWhere('service.is_active = true');

    if (divisionSlug) {
      qb.andWhere('division.slug = :divisionSlug', { divisionSlug });
    }

    const service = await qb.getOne();
    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return service;
  }

  async update(id: string, dto: UpdateServiceDto): Promise<ServiceEntity> {
    const service = await this.findById(id);

    if (dto.divisionId && dto.divisionId !== service.divisionId) {
      await this.divisionsService.findById(dto.divisionId);
      service.divisionId = dto.divisionId;
    }

    if (dto.categoryId !== undefined) {
      if (dto.categoryId) {
        await this.categoriesService.findById(dto.categoryId);
      }
      service.categoryId = dto.categoryId ?? null;
    }

    const nextSlug =
      dto.slug?.trim() || (dto.name ? slugify(dto.name) : undefined);
    if (nextSlug && nextSlug !== service.slug) {
      await this.ensureUniqueSlug(service.divisionId, nextSlug, id);
      service.slug = nextSlug;
    }

    if (dto.name !== undefined) service.name = dto.name.trim();
    if (dto.description !== undefined) service.description = dto.description;
    if (dto.imageUrl !== undefined) service.imageUrl = dto.imageUrl;
    if (dto.priceType !== undefined) service.priceType = dto.priceType;
    if (dto.price !== undefined) service.price = dto.price.toFixed(2);
    if (dto.durationApprox !== undefined) {
      service.durationApprox = dto.durationApprox;
    }
    if (dto.features !== undefined) service.features = dto.features;
    if (dto.isActive !== undefined) service.isActive = dto.isActive;
    if (dto.isFeatured !== undefined) service.isFeatured = dto.isFeatured;
    if (dto.seoTitle !== undefined) service.seoTitle = dto.seoTitle;
    if (dto.seoDescription !== undefined) {
      service.seoDescription = dto.seoDescription;
    }

    return this.servicesRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const service = await this.findById(id);
    await this.servicesRepository.remove(service);
  }

  private async ensureUniqueSlug(
    divisionId: string,
    slug: string,
    excludeId?: string,
  ) {
    const existing = await this.servicesRepository.findOne({
      where: { divisionId, slug },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        `El slug "${slug}" ya existe en esta división`,
      );
    }
  }
}
