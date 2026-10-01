import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Color } from '../../database/entities/color.entity';
import { ProductVariant } from '../../database/entities/product-variant.entity';
import { Size } from '../../database/entities/size.entity';
import { ProductsService } from '../products/products.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantsRepository: Repository<ProductVariant>,
    @InjectRepository(Size)
    private readonly sizesRepository: Repository<Size>,
    @InjectRepository(Color)
    private readonly colorsRepository: Repository<Color>,
    private readonly productsService: ProductsService,
  ) {}

  async create(dto: CreateVariantDto): Promise<ProductVariant> {
    await this.productsService.findById(dto.productId);
    await this.ensureUniqueSku(dto.productId, dto.sku);

    if (dto.sizeId) {
      const size = await this.sizesRepository.findOne({
        where: { id: dto.sizeId },
      });
      if (!size) throw new NotFoundException('Talla no encontrada');
    }

    if (dto.colorId) {
      const color = await this.colorsRepository.findOne({
        where: { id: dto.colorId },
      });
      if (!color) throw new NotFoundException('Color no encontrado');
    }

    const variant = this.variantsRepository.create({
      productId: dto.productId,
      sku: dto.sku.trim(),
      stock: dto.stock ?? 0,
      price: dto.price !== undefined ? dto.price.toFixed(2) : null,
      sizeId: dto.sizeId ?? null,
      colorId: dto.colorId ?? null,
      attributes: dto.attributes ?? null,
      imageUrl: dto.imageUrl ?? null,
      isActive: dto.isActive ?? true,
    });

    return this.variantsRepository.save(variant);
  }

  findByProduct(productId: string): Promise<ProductVariant[]> {
    return this.variantsRepository.find({
      where: { productId },
      relations: { size: true, color: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<ProductVariant> {
    const variant = await this.variantsRepository.findOne({
      where: { id },
      relations: { size: true, color: true, product: true },
    });
    if (!variant) {
      throw new NotFoundException('Variante no encontrada');
    }
    return variant;
  }

  async update(id: string, dto: UpdateVariantDto): Promise<ProductVariant> {
    const variant = await this.findById(id);

    if (dto.sku && dto.sku !== variant.sku) {
      await this.ensureUniqueSku(variant.productId, dto.sku, id);
      variant.sku = dto.sku.trim();
    }

    if (dto.stock !== undefined) variant.stock = dto.stock;
    if (dto.price !== undefined) variant.price = dto.price.toFixed(2);
    if (dto.sizeId !== undefined) variant.sizeId = dto.sizeId;
    if (dto.colorId !== undefined) variant.colorId = dto.colorId;
    if (dto.attributes !== undefined) variant.attributes = dto.attributes;
    if (dto.imageUrl !== undefined) variant.imageUrl = dto.imageUrl;
    if (dto.isActive !== undefined) variant.isActive = dto.isActive;

    return this.variantsRepository.save(variant);
  }

  async remove(id: string): Promise<void> {
    const variant = await this.findById(id);
    await this.variantsRepository.remove(variant);
  }

  findSizes(): Promise<Size[]> {
    return this.sizesRepository.find({ order: { sortOrder: 'ASC' } });
  }

  findColors(): Promise<Color[]> {
    return this.colorsRepository.find({ order: { name: 'ASC' } });
  }

  async createSize(name: string, code?: string, sortOrder = 0): Promise<Size> {
    const existing = await this.sizesRepository.findOne({ where: { name } });
    if (existing) return existing;
    return this.sizesRepository.save(
      this.sizesRepository.create({ name, code: code ?? null, sortOrder }),
    );
  }

  async createColor(name: string, hexCode?: string): Promise<Color> {
    const existing = await this.colorsRepository.findOne({ where: { name } });
    if (existing) return existing;
    return this.colorsRepository.save(
      this.colorsRepository.create({ name, hexCode: hexCode ?? null }),
    );
  }

  private async ensureUniqueSku(
    productId: string,
    sku: string,
    excludeId?: string,
  ) {
    const existing = await this.variantsRepository.findOne({
      where: { productId, sku },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`El SKU "${sku}" ya existe en este producto`);
    }
  }
}
