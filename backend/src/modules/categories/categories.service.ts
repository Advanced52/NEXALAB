import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../../common/utils/slugify';
import { Category } from '../../database/entities/category.entity';
import { DivisionsService } from '../divisions/divisions.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly divisionsService: DivisionsService,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    await this.divisionsService.findById(dto.divisionId);
    const slug = dto.slug?.trim() || slugify(dto.name);
    await this.ensureUniqueSlug(dto.divisionId, slug);

    const category = this.categoriesRepository.create({
      divisionId: dto.divisionId,
      name: dto.name.trim(),
      slug,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl ?? null,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });

    return this.categoriesRepository.save(category);
  }

  findAll(divisionId?: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: divisionId ? { divisionId } : {},
      relations: { division: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findByDivisionSlug(divisionSlug: string): Promise<Category[]> {
    const division = await this.divisionsService.findBySlug(divisionSlug);
    return this.categoriesRepository.find({
      where: { divisionId: division.id, isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: { division: true },
    });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  async findBySlugs(
    divisionSlug: string,
    categorySlug: string,
  ): Promise<Category> {
    const division = await this.divisionsService.findBySlug(divisionSlug);
    const category = await this.categoriesRepository.findOne({
      where: {
        divisionId: division.id,
        slug: categorySlug,
        isActive: true,
      },
      relations: { division: true },
    });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);

    if (dto.divisionId && dto.divisionId !== category.divisionId) {
      await this.divisionsService.findById(dto.divisionId);
      category.divisionId = dto.divisionId;
    }

    const nextSlug = dto.slug?.trim() || (dto.name ? slugify(dto.name) : undefined);
    if (nextSlug && nextSlug !== category.slug) {
      await this.ensureUniqueSlug(category.divisionId, nextSlug, id);
      category.slug = nextSlug;
    }

    if (dto.name !== undefined) category.name = dto.name.trim();
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.imageUrl !== undefined) category.imageUrl = dto.imageUrl;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;

    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findById(id);
    await this.categoriesRepository.remove(category);
  }

  private async ensureUniqueSlug(
    divisionId: string,
    slug: string,
    excludeId?: string,
  ) {
    const existing = await this.categoriesRepository.findOne({
      where: { divisionId, slug },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        `El slug "${slug}" ya existe en esta división`,
      );
    }
  }
}
