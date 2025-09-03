import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
  BadRequestException,
} from "@nestjs/common";
import { Product, Review, Question } from "./interfaces/product.interface";
import * as path from "path";
import { promises as fs } from "fs";
import { CreateProductDto } from "./dto/create-product.dto";
import { CreateQuestionDto } from "./dto/create-question.dto";

@Injectable()
export class ProductsService implements OnModuleInit {
  private products: Map<string, Product> = new Map();
  private dataFilePath: string;

  constructor() {
    this.dataFilePath = path.join(process.cwd(), "data", "products.json");
  }

  async onModuleInit() {
    await this.loadProducts();
  }

  private reviveDates(key: any, value: any): any {
    if (typeof value === "string") {
      const dateMatch = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)$/.exec(
        value,
      );
      if (dateMatch) {
        return new Date(value);
      }
    }
    return value;
  }

  private async loadProducts(): Promise<void> {
    try {
      const data = await fs.readFile(this.dataFilePath, "utf-8");
      const products: Product[] = JSON.parse(data, this.reviveDates);
      products.forEach((product) => this.products.set(product.id, product));
    } catch (error) {
      if (error.code === "ENOENT") {
        await this.createDefaultData();
      } else {
        throw new InternalServerErrorException("Failed to load products data");
      }
    }
  }

  private async createDefaultData(): Promise<void> {
    const defaultProducts: Product[] = [
      {
        id: "MLA123456789",
        title: "iPhone 13 Pro Max 256GB Plata",
        price: 149999,
        originalPrice: 159999,
        currency: "ARS",
        condition: "new",
        category: "Celulares y Teléfonos",
        thumbnail:
          "https://http2.mlstatic.com/D_NQ_NP_123456-MLA123456789_123456-O.webp",
        images: [
          "https://http2.mlstatic.com/D_NQ_NP_123456-MLA123456789_123456-O.webp",
          "https://http2.mlstatic.com/D_NQ_NP_234567-MLA123456789_234567-O.webp",
        ],
        description:
          "iPhone 13 Pro Max. Pantalla Super Retina XDR de 6.7 pulgadas. Chip A15 Bionic. Sistema de cámaras Pro con nuevo sensor de 12 MP.",
        specifications: [
          { name: "Marca", value: "Apple" },
          { name: "Modelo", value: "iPhone 13 Pro Max" },
          { name: "Almacenamiento", value: "256GB" },
          { name: "Color", value: "Plata" },
        ],
        seller: {
          id: "seller123",
          name: "TecnoStore Oficial",
          reputation: 4.8,
          totalSales: 12500,
          positiveReviews: 98,
          responseRate: 95,
          responseTime: "menos de 2 horas",
        },
        stock: 25,
        soldQuantity: 342,
        reviews: [
          {
            id: "rev1",
            userId: "user456",
            userName: "María González",
            rating: 5,
            comment:
              "Excelente producto, llegó en perfecto estado y antes de lo esperado.",
            date: new Date("2024-01-15"),
            verifiedPurchase: true,
          },
        ],
        questions: [
          {
            id: "q1",
            userId: "user789",
            userName: "Carlos López",
            question: "¿Incluye cargador?",
            answer:
              "Hola! No incluye cargador, solo el cable USB-C a Lightning.",
            date: new Date("2024-01-10"),
          },
        ],
        shipping: {
          freeShipping: true,
          estimatedDelivery: "3-5 días hábiles",
          returns: true,
        },
        warranty: "12 meses",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-20"),
      },
    ];

    // Ensure data directory exists
    await fs.mkdir(path.dirname(this.dataFilePath), { recursive: true });
    await fs.writeFile(
      this.dataFilePath,
      JSON.stringify(defaultProducts, null, 2),
    );
    defaultProducts.forEach((product) =>
      this.products.set(product.id, product),
    );
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async findOne(id: string): Promise<Product> {
    const product = this.products.get(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const id = `MLA${Math.random().toString().substring(2, 11)}`;
    const newProduct: Product = {
      ...createProductDto,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      soldQuantity: 0,
      reviews: [],
      questions: [],
      specifications: createProductDto.specifications || [],
      seller: {
        id: "default-seller",
        name: "Default Seller",
        reputation: 0,
        totalSales: 0,
        positiveReviews: 0,
        responseRate: 0,
        responseTime: "N/A",
      },
      stock: createProductDto.stock,
      shipping: {
        freeShipping: false,
        estimatedDelivery: "N/A",
        returns: false,
      },
      condition: createProductDto.condition as "new" | "used" | "refurbished",
    };

    this.products.set(id, newProduct);
    await this.saveProducts();
    return newProduct;
  }

  private async saveProducts(): Promise<void> {
    try {
      const productsArray = Array.from(this.products.values());
      await fs.writeFile(
        this.dataFilePath,
        JSON.stringify(productsArray, null, 2),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        "Failed to save products data",
        error,
      );
    }
  }

  async getRelatedProducts(
    category: string,
    excludeId: string,
  ): Promise<Product[]> {
    const products = Array.from(this.products.values())
      .filter(
        (product) => product.category === category && product.id !== excludeId,
      )
      .slice(0, 4);
    return products;
  }

  async update(id: string, updateProductDto: any): Promise<Product> {
    const product = this.products.get(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updatedProduct: Product = {
      ...product,
      ...updateProductDto,
      updatedAt: new Date(),
    };

    this.products.set(id, updatedProduct);
    await this.saveProducts();
    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    if (!this.products.has(id)) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.products.delete(id);
    await this.saveProducts();
  }

  async addReview(
    productId: string,
    review: Omit<Review, "id">,
  ): Promise<Review> {
    const product = await this.findOne(productId);

    const newReview: Review = {
      ...review,
      id: `rev${Date.now()}`,
      date: new Date(),
    };

    const updatedProduct: Product = {
      ...product,
      reviews: [...product.reviews, newReview],
      updatedAt: new Date(),
    };

    this.products.set(productId, updatedProduct);
    await this.saveProducts();
    return newReview;
  }

  async updateReview(
    productId: string,
    reviewId: string,
    updateReviewDto: any,
  ): Promise<Review> {
    const product = await this.findOne(productId);

    const reviewIndex = product.reviews.findIndex((r) => r.id === reviewId);
    if (reviewIndex === -1) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    const updatedReviews = [...product.reviews];
    updatedReviews[reviewIndex] = {
      ...updatedReviews[reviewIndex],
      ...updateReviewDto,
    };

    const updatedProduct: Product = {
      ...product,
      reviews: updatedReviews,
      updatedAt: new Date(),
    };

    this.products.set(productId, updatedProduct);
    await this.saveProducts();
    return updatedReviews[reviewIndex];
  }

  async removeReview(productId: string, reviewId: string): Promise<void> {
    const product = await this.findOne(productId);

    const reviewIndex = product.reviews.findIndex((r) => r.id === reviewId);
    if (reviewIndex === -1) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    const updatedReviews = product.reviews.filter((r) => r.id !== reviewId);
    const updatedProduct: Product = {
      ...product,
      reviews: updatedReviews,
      updatedAt: new Date(),
    };

    this.products.set(productId, updatedProduct);
    await this.saveProducts();
  }

  async addQuestion(
    productId: string,
    question: CreateQuestionDto,
  ): Promise<Question> {
    const product = await this.findOne(productId);

    const newQuestion: Question = {
      ...question,
      id: `q${Date.now()}`,
      date: new Date(),
    };

    product.questions.push(newQuestion);
    this.products.set(productId, product);
    await this.saveProducts();
    return newQuestion;
  }

  async answerQuestion(
    productId: string,
    questionId: string,
    answer: string,
  ): Promise<Question> {
    const product = await this.findOne(productId);

    const questionIndex = product.questions.findIndex(
      (q) => q.id === questionId,
    );
    if (questionIndex === -1) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    const updatedQuestions = [...product.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      answer,
    };

    const updatedProduct: Product = {
      ...product,
      questions: updatedQuestions,
      updatedAt: new Date(),
    };

    this.products.set(productId, updatedProduct);
    await this.saveProducts();
    return updatedQuestions[questionIndex];
  }

  async removeQuestion(
    productId: string,
    questionId: string,
  ): Promise<Product> {
    const product = await this.findOne(productId);

    const questionIndex = product.questions.findIndex(
      (q) => q.id === questionId,
    );
    if (questionIndex === -1) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    const updatedQuestions = product.questions.filter(
      (q) => q.id !== questionId,
    );
    const updatedProduct: Product = {
      ...product,
      questions: updatedQuestions,
      updatedAt: new Date(),
    };

    this.products.set(productId, updatedProduct);
    await this.saveProducts();
    return updatedProduct;
  }

  async incrementSoldQuantity(
    productId: string,
    quantity: number = 1,
  ): Promise<Product> {
    const product = await this.findOne(productId);

    if (product.stock < quantity) {
      throw new BadRequestException("Insufficient stock");
    }

    const updatedProduct: Product = {
      ...product,
      stock: product.stock - quantity,
      soldQuantity: product.soldQuantity + quantity,
      updatedAt: new Date(),
    };

    this.products.set(productId, updatedProduct);
    await this.saveProducts();
    return updatedProduct;
  }
}
