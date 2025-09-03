import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { Product, Review, Question } from "./interfaces/product.interface";
import { GetProductDto } from "./dto/get-product.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { AnswerQuestionDto } from "./dto/answer-question.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { CreateQuestionDto } from "./dto/create-question.dto";

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: "Get all products" })
  @ApiResponse({ status: HttpStatus.OK, description: "Returns all products" })
  async findAll(): Promise<Product[]> {
    try {
      return await this.productsService.findAll();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to fetch products",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get product by ID" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "Returns the product" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Product not found",
  })
  async findOne(@Param() getProductDto: GetProductDto): Promise<Product> {
    try {
      return await this.productsService.findOne(getProductDto.id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to fetch product",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":id/related")
  @ApiOperation({ summary: "Get related products" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns related products",
  })
  async getRelatedProducts(@Param("id") id: string): Promise<Product[]> {
    try {
      const product = await this.productsService.findOne(id);
      return await this.productsService.getRelatedProducts(
        product.category,
        id,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to fetch related products",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: "Create a new product" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Product created successfully",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data",
  })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    try {
      return await this.productsService.create(createProductDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to create product",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a product" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async update(
    @Param() getProductDto: GetProductDto,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      return await this.productsService.update(
        getProductDto.id,
        updateProductDto,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to update product",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a product" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({ status: 200, description: "Product deleted successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async remove(@Param() getProductDto: GetProductDto): Promise<void> {
    try {
      await this.productsService.remove(getProductDto.id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to delete product",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(":id/reviews")
  @ApiOperation({ summary: "Add a review to a product" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        userName: { type: "string" },
        rating: { type: "number", minimum: 1, maximum: 5 },
        comment: { type: "string" },
        verifiedPurchase: { type: "boolean", default: false },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Review added successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async addReview(
    @Param("id") id: string,
    @Body() reviewData: any,
  ): Promise<Review> {
    try {
      return await this.productsService.addReview(id, reviewData);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to add review",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(":id/reviews/:reviewId")
  @ApiOperation({ summary: "Update a review" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiParam({ name: "reviewId", description: "Review ID" })
  @ApiBody({ type: UpdateReviewDto })
  @ApiResponse({ status: 200, description: "Review updated successfully" })
  @ApiResponse({ status: 404, description: "Product or review not found" })
  async updateReview(
    @Param("id") id: string,
    @Param("reviewId") reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    try {
      return await this.productsService.updateReview(
        id,
        reviewId,
        updateReviewDto,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to update review",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(":id/reviews/:reviewId")
  @ApiOperation({ summary: "Delete a review" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiParam({ name: "reviewId", description: "Review ID" })
  @ApiResponse({ status: 200, description: "Review deleted successfully" })
  @ApiResponse({ status: 404, description: "Product or review not found" })
  async removeReview(
    @Param("id") id: string,
    @Param("reviewId") reviewId: string,
  ): Promise<void> {
    try {
      await this.productsService.removeReview(id, reviewId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to delete review",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(":id/questions")
  @ApiOperation({ summary: "Add a question to a product" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponse({ status: 201, description: "Question added successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async addQuestion(
    @Param("id") id: string,
    @Body() questionData: CreateQuestionDto,
  ): Promise<Question> {
    try {
      return await this.productsService.addQuestion(id, questionData);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to add question",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(":id/questions/:questionId/answer")
  @ApiOperation({ summary: "Answer a question" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiParam({ name: "questionId", description: "Question ID" })
  @ApiBody({ type: AnswerQuestionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Question answered successfully",
  })
  @ApiResponse({ status: 404, description: "Product or question not found" })
  async answerQuestion(
    @Param("id") id: string,
    @Param("questionId") questionId: string,
    @Body() answerQuestionDto: AnswerQuestionDto,
  ): Promise<Question> {
    try {
      return await this.productsService.answerQuestion(
        id,
        questionId,
        answerQuestionDto.answer,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to answer question",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(":id/questions/:questionId")
  @ApiOperation({ summary: "Delete a question" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiParam({ name: "questionId", description: "Question ID" })
  @ApiResponse({ status: 200, description: "Question deleted successfully" })
  @ApiResponse({ status: 404, description: "Product or question not found" })
  async removeQuestion(
    @Param("id") id: string,
    @Param("questionId") questionId: string,
  ): Promise<Product> {
    try {
      return await this.productsService.removeQuestion(id, questionId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to delete question",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(":id/sold")
  @ApiOperation({ summary: "Increment sold quantity" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        quantity: { type: "number", default: 1 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Sold quantity updated successfully",
  })
  @ApiResponse({ status: 404, description: "Product not found" })
  @ApiResponse({ status: 400, description: "Insufficient stock" })
  async incrementSoldQuantity(
    @Param("id") id: string,
    @Body() body: { quantity?: number },
  ): Promise<Product> {
    try {
      return await this.productsService.incrementSoldQuantity(
        id,
        body.quantity || 1,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to update sold quantity",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
