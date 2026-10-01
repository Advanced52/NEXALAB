import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessDivision } from './entities/business-division.entity';
import { Category } from './entities/category.entity';
import { Color } from './entities/color.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { ServiceEntity } from './entities/service.entity';
import { Setting } from './entities/setting.entity';
import { Size } from './entities/size.entity';
import { ProductType, ServicePriceType } from './enums';

const PLACEHOLDER =
  'https://placehold.co/800x600/0f172a/94a3b8?text=NEXALAB';

@Injectable()
export class CatalogSeedService {
  private readonly logger = new Logger(CatalogSeedService.name);

  constructor(
    @InjectRepository(BusinessDivision)
    private readonly divisionsRepository: Repository<BusinessDivision>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imagesRepository: Repository<ProductImage>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepository: Repository<ProductVariant>,
    @InjectRepository(ServiceEntity)
    private readonly servicesRepository: Repository<ServiceEntity>,
    @InjectRepository(Size)
    private readonly sizesRepository: Repository<Size>,
    @InjectRepository(Color)
    private readonly colorsRepository: Repository<Color>,
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
  ) {}

  async seed() {
    await this.seedSettings();
    await this.seedSizesAndColors();
    await this.seedCatalog();
  }

  private async seedSettings() {
    const existing = await this.settingsRepository.findOne({
      where: { key: 'home.hero' },
    });
    if (existing) return;

    await this.settingsRepository.save(
      this.settingsRepository.create({
        key: 'home.hero',
        isPublic: true,
        description: 'Contenido del hero de la página principal',
        value: {
          brand: 'NEXALAB',
          headline: 'Creatividad, tecnología y fabricación.',
          subheadline:
            'Moda, impresión 3D, tecnología y robótica bajo una misma marca.',
          ctaLabel: 'Explora NEXALAB',
          ctaHref: '#divisiones',
        },
      }),
    );
    this.logger.log('Setting home.hero creado');
  }

  private async seedSizesAndColors() {
    const sizes = [
      { name: 'S', code: 'S', sortOrder: 1 },
      { name: 'M', code: 'M', sortOrder: 2 },
      { name: 'L', code: 'L', sortOrder: 3 },
      { name: 'XL', code: 'XL', sortOrder: 4 },
      { name: 'XXL', code: 'XXL', sortOrder: 5 },
    ];

    for (const size of sizes) {
      const exists = await this.sizesRepository.findOne({
        where: { name: size.name },
      });
      if (!exists) {
        await this.sizesRepository.save(this.sizesRepository.create(size));
      }
    }

    const colors = [
      { name: 'Negro', hexCode: '#111111' },
      { name: 'Blanco', hexCode: '#F5F5F5' },
      { name: 'Gris', hexCode: '#6B7280' },
    ];

    for (const color of colors) {
      const exists = await this.colorsRepository.findOne({
        where: { name: color.name },
      });
      if (!exists) {
        await this.colorsRepository.save(this.colorsRepository.create(color));
      }
    }
  }

  private async seedCatalog() {
    const existingCount = await this.divisionsRepository.count();
    if (existingCount > 0) {
      this.logger.log('Catálogo ya existe, seed omitido');
      return;
    }

    const street = await this.createDivision({
      name: 'NEXA Street',
      slug: 'nexa-street',
      shortDescription: 'Ropa y productos personalizados',
      description:
        'Línea de ropa y productos personalizados de NEXALAB. Diseño urbano con identidad propia.',
      primaryColor: '#E11D48',
      sortOrder: 1,
      seoTitle: 'NEXALAB | NEXA Street',
      seoDescription: 'Ropa y productos personalizados de NEXALAB.',
      bannerUrl: `${PLACEHOLDER}+Street`,
      logoUrl: PLACEHOLDER,
    });

    const threeD = await this.createDivision({
      name: 'NEXA 3D',
      slug: 'nexa-3d',
      shortDescription: 'Fabricación y prototipado',
      description:
        'Impresión 3D, piezas, prototipos y fabricación a medida.',
      primaryColor: '#0EA5E9',
      sortOrder: 2,
      seoTitle: 'NEXALAB | NEXA 3D',
      seoDescription: 'Impresión 3D y prototipado NEXALAB.',
      bannerUrl: `${PLACEHOLDER}+3D`,
      logoUrl: PLACEHOLDER,
    });

    const tech = await this.createDivision({
      name: 'NEXA Tech',
      slug: 'nexa-tech',
      shortDescription: 'Soluciones y servicios tecnológicos',
      description:
        'Reparación, mantenimiento, soporte técnico y servicios informáticos.',
      primaryColor: '#22C55E',
      sortOrder: 3,
      seoTitle: 'NEXALAB | NEXA Tech',
      seoDescription: 'Servicios tecnológicos NEXALAB.',
      bannerUrl: `${PLACEHOLDER}+Tech`,
      logoUrl: PLACEHOLDER,
    });

    const robotics = await this.createDivision({
      name: 'NEXA Robotics',
      slug: 'nexa-robotics',
      shortDescription: 'Electrónica, automatización y robótica',
      description:
        'Proyectos de robótica, electrónica y automatización.',
      primaryColor: '#F59E0B',
      sortOrder: 4,
      seoTitle: 'NEXALAB | NEXA Robotics',
      seoDescription: 'Robótica y automatización NEXALAB.',
      bannerUrl: `${PLACEHOLDER}+Robotics`,
      logoUrl: PLACEHOLDER,
    });

    const catCamisetas = await this.createCategory(
      street.id,
      'Camisetas',
      'camisetas',
      'Camisetas y prendas personalizadas',
    );
    const catPiezas = await this.createCategory(
      threeD.id,
      'Piezas',
      'piezas',
      'Piezas y componentes impresos en 3D',
    );
    const catServiciosTech = await this.createCategory(
      tech.id,
      'Servicios tecnológicos',
      'servicios-tecnologicos',
      'Servicios de soporte y reparación',
    );
    const catProyectos = await this.createCategory(
      robotics.id,
      'Proyectos',
      'proyectos',
      'Proyectos electrónicos y de automatización',
    );

    const tee1 = await this.createProduct({
      divisionId: street.id,
      categoryId: catCamisetas.id,
      name: 'YA QUE CHUCHA...',
      slug: 'camiseta-ya-que-chucha',
      shortDescription: 'Camiseta urbana con frase icónica NEXA Street.',
      description: 'Camiseta de algodón con estampado frontal. Parte de la colección NEXA Street.',
      price: '24.99',
      compareAtPrice: '29.99',
      sku: 'NS-YQC-001',
      stock: 50,
      featured: true,
    });

    await this.createProduct({
      divisionId: street.id,
      categoryId: catCamisetas.id,
      name: 'DEJATE DE WEBADAS',
      slug: 'camiseta-dejate-de-webadas',
      shortDescription: 'Camiseta con actitud NEXA Street.',
      description: 'Diseño directo, cómoda y lista para el día a día.',
      price: '24.99',
      sku: 'NS-DDW-001',
      stock: 40,
    });

    await this.createProduct({
      divisionId: street.id,
      categoryId: catCamisetas.id,
      name: 'Camiseta NEXALAB',
      slug: 'camiseta-nexalab',
      shortDescription: 'Camiseta oficial con branding NEXALAB.',
      description: 'Prenda institucional con logo NEXALAB.',
      price: '22.99',
      sku: 'NS-NXL-001',
      stock: 60,
      featured: true,
    });

    await this.createProduct({
      divisionId: threeD.id,
      categoryId: catPiezas.id,
      name: 'Pieza personalizada 3D',
      slug: 'pieza-personalizada-3d',
      shortDescription: 'Pieza fabricada bajo pedido en impresión 3D.',
      description:
        'Prototipo o pieza funcional según especificaciones del cliente. Materiales disponibles: PLA y más.',
      price: '15.00',
      sku: 'N3D-PZ-001',
      stock: 25,
      featured: true,
    });

    await this.createService({
      divisionId: tech.id,
      categoryId: catServiciosTech.id,
      name: 'Diagnóstico y reparación de PC',
      slug: 'diagnostico-reparacion-pc',
      description:
        'Diagnóstico completo y reparación de computadoras de escritorio y laptops.',
      priceType: ServicePriceType.FROM,
      price: '25.00',
      durationApprox: '1-3 días',
      features: [
        'Diagnóstico inicial',
        'Presupuesto transparente',
        'Repuestos bajo cotización',
      ],
      featured: true,
    });

    await this.createService({
      divisionId: robotics.id,
      categoryId: catProyectos.id,
      name: 'Desarrollo de proyecto electrónico',
      slug: 'desarrollo-proyecto-electronico',
      description:
        'Diseño y desarrollo de proyectos electrónicos, automatización y prototipos robóticos.',
      priceType: ServicePriceType.QUOTE,
      durationApprox: 'Según alcance',
      features: [
        'Análisis de requerimientos',
        'Prototipado',
        'Documentación técnica',
      ],
      featured: true,
    });

    await this.seedTeeVariants(tee1.id);
    this.logger.log('Catálogo de prueba NEXALAB sembrado');
  }

  private async createDivision(
    data: Partial<BusinessDivision> & {
      name: string;
      slug: string;
    },
  ) {
    return this.divisionsRepository.save(
      this.divisionsRepository.create({
        ...data,
        isActive: true,
        description: data.description ?? null,
        shortDescription: data.shortDescription ?? null,
        logoUrl: data.logoUrl ?? PLACEHOLDER,
        bannerUrl: data.bannerUrl ?? PLACEHOLDER,
        primaryColor: data.primaryColor ?? null,
        sortOrder: data.sortOrder ?? 0,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        ogImage: data.ogImage ?? PLACEHOLDER,
      }),
    );
  }

  private async createCategory(
    divisionId: string,
    name: string,
    slug: string,
    description: string,
  ) {
    return this.categoriesRepository.save(
      this.categoriesRepository.create({
        divisionId,
        name,
        slug,
        description,
        imageUrl: PLACEHOLDER,
        isActive: true,
        sortOrder: 0,
      }),
    );
  }

  private async createProduct(data: {
    divisionId: string;
    categoryId: string;
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    price: string;
    compareAtPrice?: string;
    sku: string;
    stock: number;
    featured?: boolean;
  }) {
    const product = await this.productsRepository.save(
      this.productsRepository.create({
        divisionId: data.divisionId,
        categoryId: data.categoryId,
        type: ProductType.PHYSICAL,
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
        sku: data.sku,
        stock: data.stock,
        isActive: true,
        isFeatured: data.featured ?? false,
        seoTitle: `NEXALAB | ${data.name}`,
        seoDescription: data.shortDescription,
      }),
    );

    await this.imagesRepository.save(
      this.imagesRepository.create({
        productId: product.id,
        url: PLACEHOLDER,
        alt: data.name,
        isPrimary: true,
        sortOrder: 0,
      }),
    );

    return product;
  }

  private async createService(data: {
    divisionId: string;
    categoryId: string;
    name: string;
    slug: string;
    description: string;
    priceType: ServicePriceType;
    price?: string;
    durationApprox: string;
    features: string[];
    featured?: boolean;
  }) {
    return this.servicesRepository.save(
      this.servicesRepository.create({
        divisionId: data.divisionId,
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: PLACEHOLDER,
        priceType: data.priceType,
        price: data.price ?? null,
        durationApprox: data.durationApprox,
        features: data.features,
        isActive: true,
        isFeatured: data.featured ?? false,
        seoTitle: `NEXALAB | ${data.name}`,
        seoDescription: data.description.slice(0, 160),
      }),
    );
  }

  private async seedTeeVariants(productId: string) {
    const sizeM = await this.sizesRepository.findOne({ where: { name: 'M' } });
    const sizeL = await this.sizesRepository.findOne({ where: { name: 'L' } });
    const black = await this.colorsRepository.findOne({
      where: { name: 'Negro' },
    });
    const white = await this.colorsRepository.findOne({
      where: { name: 'Blanco' },
    });

    const combos = [
      { size: sizeM, color: black, sku: 'NS-YQC-M-BLK' },
      { size: sizeM, color: white, sku: 'NS-YQC-M-WHT' },
      { size: sizeL, color: black, sku: 'NS-YQC-L-BLK' },
      { size: sizeL, color: white, sku: 'NS-YQC-L-WHT' },
    ];

    for (const combo of combos) {
      if (!combo.size || !combo.color) continue;
      await this.variantsRepository.save(
        this.variantsRepository.create({
          productId,
          sku: combo.sku,
          stock: 10,
          sizeId: combo.size.id,
          colorId: combo.color.id,
          isActive: true,
        }),
      );
    }
  }
}
