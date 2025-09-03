import { Test, TestingModule } from "@nestjs/testing";
import { ProductsService } from "./products.service";
import { promises as fs } from "fs";
import { Product } from "./interfaces/product.interface";
import {
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { CreateQuestionDto } from "./dto/create-question.dto";

const mockProducts: Product[] = [
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
        answer: "Hola! No incluye cargador, solo el cable USB-C a Lightning.",
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

const mockProductsWithIsoDates = mockProducts.map((product) => ({
  ...product,
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
  reviews: product.reviews.map((review) => ({
    ...review,
    date: review.date.toISOString(),
  })),
  questions: product.questions.map((question) => ({
    ...question,
    date: question.date.toISOString(),
  })),
}));

jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  },
}));

jest.mock("path", () => ({
  __esModule: true, // This is important for ESM modules
  join: jest.fn(() => "/test/data/products.json"), // Default mock implementation
  dirname: jest.fn((p) => p.split("/").slice(0, -1).join("/")), // Mock dirname to return the directory path
}));

describe("ProductsService", () => {
  let service: ProductsService;

  beforeEach(async () => {
    // Reset all mocks before each test
    (fs.readFile as jest.Mock).mockReset();
    (fs.writeFile as jest.Mock).mockReset();
    (fs.mkdir as jest.Mock).mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("onModuleInit", () => {
    it("should load products from file on module init", async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockProductsWithIsoDates),
      );
      await service.onModuleInit();
      expect(fs.readFile).toHaveBeenCalledWith(
        "/test/data/products.json",
        "utf-8",
      );
      expect(await service.findAll()).toEqual(mockProducts);
    });

    it("should create default data if file not found", async () => {
      (fs.readFile as jest.Mock).mockRejectedValueOnce({ code: "ENOENT" });
      await service.onModuleInit();
      expect(fs.mkdir).toHaveBeenCalledWith("/test/data", { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(
        "/test/data/products.json",
        JSON.stringify(mockProductsWithIsoDates, null, 2),
      );
      const products = await service.findAll();
      expect(products).toHaveLength(1); // Default product created
      expect(products[0]).toMatchObject({
        id: "MLA123456789",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        reviews: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(Date),
          }),
        ]),
        questions: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(Date),
          }),
        ]),
      });
    });

    it("should throw InternalServerErrorException if loading fails for other reasons", async () => {
      (fs.readFile as jest.Mock).mockRejectedValueOnce(
        new Error("Other error"),
      );
      await expect(service.onModuleInit()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("findAll", () => {
    it("should return all products", async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockProductsWithIsoDates),
      );
      await service.onModuleInit();
      const result = await service.findAll();
      expect(result).toEqual(mockProducts);
    });
  });

  describe("findOne", () => {
    beforeEach(async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockProductsWithIsoDates),
      );
      await service.onModuleInit();
    });

    it("should return a single product by ID", async () => {
      const result = await service.findOne("MLA123456789");
      expect(result).toEqual(mockProducts[0]);
    });

    it("should throw NotFoundException if product not found", async () => {
      await expect(service.findOne("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    const createProductDto: CreateProductDto = {
      title: "New Product",
      price: 100,
      currency: "USD",
      condition: "new",
      category: "Electronics",
      thumbnail: "thumb.jpg",
      images: ["img.jpg"],
      description: "Desc",
      stock: 10,
      specifications: [],
    };

    beforeEach(async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([]));
      await service.onModuleInit();
      (fs.writeFile as jest.Mock).mockClear(); // Clear mock after init
    });

    it("should create a new product", async () => {
      const result = await service.create(createProductDto);
      expect(result).toMatchObject({
        title: "New Product",
        price: 100,
        currency: "USD",
        stock: 10,
      });
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should save products after creation", async () => {
      await service.create(createProductDto);
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    const updateProductDto = { price: 150 };

    beforeEach(async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockProducts),
      );
      await service.onModuleInit();
      (fs.writeFile as jest.Mock).mockClear();
    });

    it("should update an existing product", async () => {
      const result = await service.update("MLA123456789", updateProductDto);
      expect(result.price).toBe(150);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should throw NotFoundException if product to update not found", async () => {
      await expect(
        service.update("nonexistent", updateProductDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    beforeEach(async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockProducts),
      );
      await service.onModuleInit();
      (fs.writeFile as jest.Mock).mockClear();
    });

    it("should remove a product by ID", async () => {
      await service.remove("MLA123456789");
      const products = await service.findAll();
      expect(products).toHaveLength(0);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should throw NotFoundException if product to remove not found", async () => {
      await expect(service.remove("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getRelatedProducts", () => {
    const additionalProduct: Product = {
      id: "MLA987654321",
      title: "Another iPhone",
      price: 1000,
      originalPrice: 1000,
      currency: "ARS",
      condition: "new",
      category: "Celulares y Teléfonos",
      thumbnail: "",
      images: [],
      description: "",
      specifications: [],
      seller: mockProducts[0].seller,
      stock: 10,
      soldQuantity: 0,
      reviews: [],
      questions: [],
      shipping: mockProducts[0].shipping,
      warranty: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const additionalProductWithIsoDates = {
      ...additionalProduct,
      createdAt: additionalProduct.createdAt.toISOString(),
      updatedAt: additionalProduct.updatedAt.toISOString(),
    };

    beforeEach(async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify([
          ...mockProductsWithIsoDates,
          additionalProductWithIsoDates,
        ]),
      );
      await service.onModuleInit();
    });

    it("should return related products based on category, excluding the current product", async () => {
      const result = await service.getRelatedProducts(
        "Celulares y Teléfonos",
        "MLA123456789",
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "MLA987654321",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("should return an empty array if no related products are found", async () => {
      const result = await service.getRelatedProducts(
        "Electronics",
        "MLA123456789",
      );
      expect(result).toHaveLength(0);
    });
  });

  describe("addReview", () => {
    const newReview = {
      userId: "user101",
      userName: "John Doe",
      rating: 4,
      comment: "Good product",
      verifiedPurchase: false,
      date: expect.any(Date),
    };

    beforeEach(async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockProductsWithIsoDates),
      );
      await service.onModuleInit();
      (fs.writeFile as jest.Mock).mockClear();
    });

    it("should add a review to a product", async () => {
      const result = await service.addReview("MLA123456789", newReview);
      expect(result).toMatchObject({
        ...newReview,
        id: expect.any(String),
        date: expect.any(Date),
      });
      const product = await service.findOne("MLA123456789");
      expect(product.reviews).toHaveLength(2);
      expect(product.reviews[1]).toMatchObject({
        ...newReview,
        id: expect.any(String),
        date: expect.any(Date),
      });
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should throw NotFoundException if product not found", async () => {
      await expect(service.addReview("nonexistent", newReview)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateReview", () => {
    const updateReviewDto = { rating: 5, comment: "Excellent product!" };

    beforeEach(async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockProductsWithIsoDates),
      );
      await service.onModuleInit();
      (fs.writeFile as jest.Mock).mockClear();
    });

    it("should update an existing review", async () => {
      const result = await service.updateReview(
        "MLA123456789",
        "rev1",
        updateReviewDto,
      );
      expect(result).toMatchObject({
        ...updateReviewDto,
        date: expect.any(Date),
      });
      const product = await service.findOne("MLA123456789");
      expect(product.reviews[0]).toMatchObject({
        ...updateReviewDto,
        date: expect.any(Date),
      });
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should throw NotFoundException if product not found", async () => {
      await expect(
        service.updateReview("nonexistent", "rev1", updateReviewDto),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if review not found", async () => {
      await expect(
        service.updateReview("MLA123456789", "nonexistent", updateReviewDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("removeReview", () => {
    beforeEach(async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockProductsWithIsoDates),
      );
      await service.onModuleInit();
      (fs.writeFile as jest.Mock).mockClear();
    });

    it("should remove a review from a product", async () => {
      await service.removeReview("MLA123456789", "rev1");
      const product = await service.findOne("MLA123456789");
      expect(product.reviews).toHaveLength(0);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should throw NotFoundException if product not found", async () => {
      await expect(service.removeReview("nonexistent", "rev1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw NotFoundException if review not found", async () => {
      await expect(
        service.removeReview("MLA123456789", "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("addQuestion", () => {
    const newQuestion: CreateQuestionDto = {
      userId: "user202",
      userName: "Jane Doe",
      question: "Is this available in black?",
    };

    beforeEach(async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockProductsWithIsoDates),
      );
      await service.onModuleInit();
      (fs.writeFile as jest.Mock).mockClear();
    });

    it("should add a question to a product", async () => {
      const result = await service.addQuestion("MLA123456789", newQuestion);
      expect(result).toMatchObject({
        ...newQuestion,
        id: expect.any(String),
        date: expect.any(Date),
      });
      const product = await service.findOne("MLA123456789");
      expect(product.questions).toHaveLength(2);
      expect(product.questions[1]).toMatchObject({
        ...newQuestion,
        id: expect.any(String),
        date: expect.any(Date),
      });
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should throw NotFoundException if product not found", async () => {
      await expect(
        service.addQuestion("nonexistent", newQuestion),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("answerQuestion", () => {
    const answer = "Yes, it is available in black.";

    beforeEach(async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockProductsWithIsoDates),
      );
      await service.onModuleInit();
      (fs.writeFile as jest.Mock).mockClear();
    });

    it("should answer an existing question", async () => {
      const result = await service.answerQuestion("MLA123456789", "q1", answer);
      expect(result).toMatchObject({
        answer,
        date: expect.any(Date),
      });
      const product = await service.findOne("MLA123456789");
      expect(product.questions[0]).toMatchObject({
        answer,
        date: expect.any(Date),
      });
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should throw NotFoundException if product not found", async () => {
      await expect(
        service.answerQuestion("nonexistent", "q1", answer),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if question not found", async () => {
      await expect(
        service.answerQuestion("MLA123456789", "nonexistent", answer),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("removeQuestion", () => {
    beforeEach(async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockProductsWithIsoDates),
      );
      await service.onModuleInit();
      (fs.writeFile as jest.Mock).mockClear();
    });

    it("should remove a question from a product", async () => {
      await service.removeQuestion("MLA123456789", "q1");
      const product = await service.findOne("MLA123456789");
      expect(product.questions).toHaveLength(0);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should throw NotFoundException if product not found", async () => {
      await expect(service.removeQuestion("nonexistent", "q1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw NotFoundException if question not found", async () => {
      await expect(
        service.removeQuestion("MLA123456789", "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("incrementSoldQuantity", () => {
    beforeEach(async () => {
      (fs.readFile as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockProductsWithIsoDates),
      );
      await service.onModuleInit();
      (fs.writeFile as jest.Mock).mockClear();
    });

    it("should increment sold quantity and decrease stock", async () => {
      const product = await service.incrementSoldQuantity("MLA123456789", 5);
      expect(product.soldQuantity).toBe(347);
      expect(product.stock).toBe(20);
      expect(product).toMatchObject({
        updatedAt: expect.any(Date),
      });
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should throw BadRequestException if insufficient stock", async () => {
      await expect(
        service.incrementSoldQuantity("MLA123456789", 30),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException if product not found", async () => {
      await expect(
        service.incrementSoldQuantity("nonexistent", 1),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
