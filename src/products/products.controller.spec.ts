import { Test, TestingModule } from "@nestjs/testing";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { Product } from "./interfaces/product.interface";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { AnswerQuestionDto } from "./dto/answer-question.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import {
  NotFoundException,
  HttpException,
  BadRequestException,
} from "@nestjs/common";

const mockProduct: Product = {
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
};

describe("ProductsController", () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockProduct]),
            findOne: jest.fn().mockResolvedValue(mockProduct),
            create: jest.fn().mockResolvedValue(mockProduct),
            update: jest.fn().mockResolvedValue(mockProduct),
            remove: jest.fn().mockResolvedValue(undefined),
            getRelatedProducts: jest.fn().mockResolvedValue([mockProduct]),
            addReview: jest.fn().mockResolvedValue(mockProduct.reviews[0]),
            updateReview: jest.fn().mockResolvedValue(mockProduct.reviews[0]),
            removeReview: jest.fn().mockResolvedValue(undefined),
            addQuestion: jest.fn().mockResolvedValue(mockProduct.questions[0]),
            answerQuestion: jest
              .fn()
              .mockResolvedValue(mockProduct.questions[0]),
            removeQuestion: jest.fn().mockResolvedValue(mockProduct),
            incrementSoldQuantity: jest.fn().mockResolvedValue(mockProduct),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all products", async () => {
      expect(await controller.findAll()).toEqual([mockProduct]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it("should throw InternalServerErrorException for other errors", async () => {
      (service.findAll as jest.Mock).mockRejectedValueOnce(
        new Error("test error"),
      );
      await expect(controller.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe("findOne", () => {
    it("should return a product by ID", async () => {
      const getProductDto = { id: "MLA123456789" };
      expect(await controller.findOne(getProductDto)).toEqual(mockProduct);
      expect(service.findOne).toHaveBeenCalledWith(getProductDto.id);
    });

    it("should throw NotFoundException if product not found", async () => {
      (service.findOne as jest.Mock).mockRejectedValueOnce(
        new NotFoundException(),
      );
      const getProductDto = { id: "nonexistent" };
      await expect(controller.findOne(getProductDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw InternalServerErrorException for other errors", async () => {
      (service.findOne as jest.Mock).mockRejectedValueOnce(
        new Error("test error"),
      );
      const getProductDto = { id: "MLA123456789" };
      await expect(controller.findOne(getProductDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("getRelatedProducts", () => {
    it("should return related products", async () => {
      const id = "MLA123456789";
      const relatedProducts = [mockProduct];
      (service.findOne as jest.Mock).mockResolvedValueOnce(mockProduct);
      (service.getRelatedProducts as jest.Mock).mockResolvedValueOnce(
        relatedProducts,
      );

      expect(await controller.getRelatedProducts(id)).toEqual(relatedProducts);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.getRelatedProducts).toHaveBeenCalledWith(
        mockProduct.category,
        id,
      );
    });

    it("should throw NotFoundException if product not found", async () => {
      const id = "nonexistent";
      (service.findOne as jest.Mock).mockRejectedValueOnce(
        new NotFoundException(),
      );

      await expect(controller.getRelatedProducts(id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw InternalServerErrorException for other errors", async () => {
      const id = "MLA123456789";
      (service.findOne as jest.Mock).mockRejectedValueOnce(
        new Error("test error"),
      );

      await expect(controller.getRelatedProducts(id)).rejects.toThrow(
        HttpException,
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

    it("should create a product", async () => {
      expect(await controller.create(createProductDto)).toEqual(mockProduct);
      expect(service.create).toHaveBeenCalledWith(createProductDto);
    });

    it("should throw BadRequestException for invalid input", async () => {
      (service.create as jest.Mock).mockRejectedValueOnce(
        new BadRequestException(),
      );
      await expect(controller.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw InternalServerErrorException for other errors", async () => {
      (service.create as jest.Mock).mockRejectedValueOnce(
        new Error("test error"),
      );
      await expect(controller.create(createProductDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("update", () => {
    const getProductDto = { id: "MLA123456789" };
    const updateProductDto: UpdateProductDto = { price: 150 };

    it("should update a product", async () => {
      expect(await controller.update(getProductDto, updateProductDto)).toEqual(
        mockProduct,
      );
      expect(service.update).toHaveBeenCalledWith(
        getProductDto.id,
        updateProductDto,
      );
    });

    it("should throw NotFoundException if product not found", async () => {
      (service.update as jest.Mock).mockRejectedValueOnce(
        new NotFoundException(),
      );
      await expect(
        controller.update(getProductDto, updateProductDto),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw InternalServerErrorException for other errors", async () => {
      (service.update as jest.Mock).mockRejectedValueOnce(
        new Error("test error"),
      );
      await expect(
        controller.update(getProductDto, updateProductDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe("remove", () => {
    const getProductDto = { id: "MLA123456789" };

    it("should remove a product", async () => {
      await controller.remove(getProductDto);
      expect(service.remove).toHaveBeenCalledWith(getProductDto.id);
    });

    it("should throw NotFoundException if product not found", async () => {
      (service.remove as jest.Mock).mockRejectedValueOnce(
        new NotFoundException(),
      );
      await expect(controller.remove(getProductDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw InternalServerErrorException for other errors", async () => {
      (service.remove as jest.Mock).mockRejectedValueOnce(
        new Error("test error"),
      );
      await expect(controller.remove(getProductDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("addReview", () => {
    const id = "MLA123456789";
    const reviewData = {
      userId: "user1",
      userName: "User1",
      rating: 5,
      comment: "Great product",
      verifiedPurchase: true,
    };

    it("should add a review to a product", async () => {
      expect(await controller.addReview(id, reviewData)).toEqual(
        mockProduct.reviews[0],
      );
      expect(service.addReview).toHaveBeenCalledWith(id, reviewData);
    });

    it("should throw NotFoundException if product not found", async () => {
      (service.addReview as jest.Mock).mockRejectedValueOnce(
        new NotFoundException(),
      );
      await expect(controller.addReview(id, reviewData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw InternalServerErrorException for other errors", async () => {
      (service.addReview as jest.Mock).mockRejectedValueOnce(
        new Error("test error"),
      );
      await expect(controller.addReview(id, reviewData)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("updateReview", () => {
    const id = "MLA123456789";
    const reviewId = "rev1";
    const updateReviewDto: UpdateReviewDto = { rating: 4 };

    it("should update a review", async () => {
      expect(
        await controller.updateReview(id, reviewId, updateReviewDto),
      ).toEqual(mockProduct.reviews[0]);
      expect(service.updateReview).toHaveBeenCalledWith(
        id,
        reviewId,
        updateReviewDto,
      );
    });

    it("should throw NotFoundException if product or review not found", async () => {
      (service.updateReview as jest.Mock).mockRejectedValueOnce(
        new NotFoundException(),
      );
      await expect(
        controller.updateReview(id, reviewId, updateReviewDto),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw InternalServerErrorException for other errors", async () => {
      (service.updateReview as jest.Mock).mockRejectedValueOnce(
        new Error("test error"),
      );
      await expect(
        controller.updateReview(id, reviewId, updateReviewDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe("removeReview", () => {
    const id = "MLA123456789";
    const reviewId = "rev1";

    it("should remove a review", async () => {
      await controller.removeReview(id, reviewId);
      expect(service.removeReview).toHaveBeenCalledWith(id, reviewId);
    });

    it("should throw NotFoundException if product or review not found", async () => {
      (service.removeReview as jest.Mock).mockRejectedValueOnce(
        new NotFoundException(),
      );
      await expect(controller.removeReview(id, reviewId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw InternalServerErrorException for other errors", async () => {
      (service.removeReview as jest.Mock).mockRejectedValueOnce(
        new Error("test error"),
      );
      await expect(controller.removeReview(id, reviewId)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("addQuestion", () => {
    const id = "MLA123456789";
    const questionData: CreateQuestionDto = {
      userId: "user1",
      userName: "User1",
      question: "How much?",
    };

    it("should add a question to a product", async () => {
      expect(await controller.addQuestion(id, questionData)).toEqual(
        mockProduct.questions[0],
      );
      expect(service.addQuestion).toHaveBeenCalledWith(id, questionData);
    });

    it("should throw NotFoundException if product not found", async () => {
      (service.addQuestion as jest.Mock).mockRejectedValueOnce(
        new NotFoundException(),
      );
      await expect(controller.addQuestion(id, questionData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw InternalServerErrorException for other errors", async () => {
      (service.addQuestion as jest.Mock).mockRejectedValueOnce(
        new Error("test error"),
      );
      await expect(controller.addQuestion(id, questionData)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("answerQuestion", () => {
    const id = "MLA123456789";
    const questionId = "q1";
    const answerQuestionDto: AnswerQuestionDto = { answer: "A lot" };

    it("should answer a question", async () => {
      expect(
        await controller.answerQuestion(id, questionId, answerQuestionDto),
      ).toEqual(mockProduct.questions[0]);
      expect(service.answerQuestion).toHaveBeenCalledWith(
        id,
        questionId,
        answerQuestionDto.answer,
      );
    });

    it("should throw NotFoundException if product or question not found", async () => {
      (service.answerQuestion as jest.Mock).mockRejectedValueOnce(
        new NotFoundException(),
      );
      await expect(
        controller.answerQuestion(id, questionId, answerQuestionDto),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw InternalServerErrorException for other errors", async () => {
      (service.answerQuestion as jest.Mock).mockRejectedValueOnce(
        new Error("test error"),
      );
      await expect(
        controller.answerQuestion(id, questionId, answerQuestionDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe("removeQuestion", () => {
    const id = "MLA123456789";
    const questionId = "q1";

    it("should remove a question", async () => {
      expect(await controller.removeQuestion(id, questionId)).toEqual(
        mockProduct,
      );
      expect(service.removeQuestion).toHaveBeenCalledWith(id, questionId);
    });

    it("should throw NotFoundException if product or question not found", async () => {
      (service.removeQuestion as jest.Mock).mockRejectedValueOnce(
        new NotFoundException(),
      );
      await expect(controller.removeQuestion(id, questionId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw InternalServerErrorException for other errors", async () => {
      (service.removeQuestion as jest.Mock).mockRejectedValueOnce(
        new Error("test error"),
      );
      await expect(controller.removeQuestion(id, questionId)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe("incrementSoldQuantity", () => {
    const id = "MLA123456789";
    const quantity = 5;

    it("should increment sold quantity", async () => {
      expect(await controller.incrementSoldQuantity(id, { quantity })).toEqual(
        mockProduct,
      );
      expect(service.incrementSoldQuantity).toHaveBeenCalledWith(id, quantity);
    });

    it("should increment sold quantity by 1 if quantity is not provided", async () => {
      expect(await controller.incrementSoldQuantity(id, {})).toEqual(
        mockProduct,
      );
      expect(service.incrementSoldQuantity).toHaveBeenCalledWith(id, 1);
    });

    it("should throw BadRequestException if insufficient stock", async () => {
      (service.incrementSoldQuantity as jest.Mock).mockRejectedValueOnce(
        new BadRequestException(),
      );
      await expect(
        controller.incrementSoldQuantity(id, { quantity }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException if product not found", async () => {
      (service.incrementSoldQuantity as jest.Mock).mockRejectedValueOnce(
        new NotFoundException(),
      );
      await expect(
        controller.incrementSoldQuantity(id, { quantity }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw InternalServerErrorException for other errors", async () => {
      (service.incrementSoldQuantity as jest.Mock).mockRejectedValueOnce(
        new Error("test error"),
      );
      await expect(
        controller.incrementSoldQuantity(id, { quantity }),
      ).rejects.toThrow(HttpException);
    });
  });
});
