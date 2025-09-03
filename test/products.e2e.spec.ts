import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("ProductsController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Tests will go here

  it("/products (POST)", () => {
    const createProductDto = {
      name: "Test Product",
      description: "This is a test product",
      price: 100,
      stock: 10,
      category: "Electronics",
      images: ["http://example.com/image1.jpg"],
      specifications: [{ key: "Weight", value: "1kg" }],
    };

    return request(app.getHttpServer())
      .post("/products")
      .send(createProductDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty("id");
        expect(res.body.name).toEqual(createProductDto.name);
        expect(res.body.description).toEqual(createProductDto.description);
        expect(res.body.price).toEqual(createProductDto.price);
        expect(res.body.stock).toEqual(createProductDto.stock);
        expect(res.body.category).toEqual(createProductDto.category);
        expect(res.body.images).toEqual(createProductDto.images);
        expect(res.body.specifications).toEqual(
          createProductDto.specifications,
        );
      });
  });

  it("/products (GET)", () => {
    return request(app.getHttpServer())
      .get("/products")
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it("/products/:id (GET)", async () => {
    const createProductDto = {
      name: "Single Product",
      description: "This is a single test product",
      price: 200,
      stock: 5,
      category: "Books",
      images: ["http://example.com/book1.jpg"],
      specifications: [{ key: "Pages", value: "300" }],
    };

    const postResponse = await request(app.getHttpServer())
      .post("/products")
      .send(createProductDto)
      .expect(201);

    const productId = postResponse.body.id;

    return request(app.getHttpServer())
      .get(`/products/${productId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("id", productId);
        expect(res.body.name).toEqual(createProductDto.name);
      });
  });

  it("/products/:id (PUT)", async () => {
    const createProductDto = {
      name: "Product to Update",
      description: "Original description",
      price: 50,
      stock: 5,
      category: "Tools",
      images: ["http://example.com/tool.jpg"],
      specifications: [{ key: "Material", value: "Steel" }],
    };

    const postResponse = await request(app.getHttpServer())
      .post("/products")
      .send(createProductDto)
      .expect(201);

    const productId = postResponse.body.id;
    const updateProductDto = {
      name: "Updated Product Name",
      price: 75,
    };

    return request(app.getHttpServer())
      .put(`/products/${productId}`)
      .send(updateProductDto)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("id", productId);
        expect(res.body.name).toEqual(updateProductDto.name);
        expect(res.body.price).toEqual(updateProductDto.price);
        expect(res.body.description).toEqual(createProductDto.description); // Unchanged
      });
  });

  it("/products/:id (DELETE)", async () => {
    const createProductDto = {
      name: "Product to Delete",
      description: "This product will be deleted",
      price: 10,
      stock: 1,
      category: "Disposable",
      images: ["http://example.com/delete.jpg"],
      specifications: [{ key: "Lifespan", value: "Short" }],
    };

    const postResponse = await request(app.getHttpServer())
      .post("/products")
      .send(createProductDto)
      .expect(201);

    const productId = postResponse.body.id;

    await request(app.getHttpServer())
      .delete(`/products/${productId}`)
      .expect(200);

    return request(app.getHttpServer())
      .get(`/products/${productId}`)
      .expect(404); // Expect 404 after deletion
  });

  it("/products/:id/questions (POST)", async () => {
    const createProductDto = {
      name: "Product with Questions",
      description: "This product will receive questions",
      price: 300,
      stock: 3,
      category: "Toys",
      images: ["http://example.com/toy.jpg"],
      specifications: [{ key: "Age", value: "3+" }],
    };

    const postResponse = await request(app.getHttpServer())
      .post("/products")
      .send(createProductDto)
      .expect(201);

    const productId = postResponse.body.id;
    const questionDto = {
      question: "What materials is this made of?",
      userId: "testUser1",
      userName: "Test User",
    };

    return request(app.getHttpServer())
      .post(`/products/${productId}/questions`)
      .send(questionDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty("id");
        expect(res.body.question).toEqual(questionDto.question);
        expect(res.body).toHaveProperty("date");
        expect(res.body).not.toHaveProperty("answers");
      });
  });

  it("/products/:id/questions/:questionId/answers (POST)", async () => {
    const createProductDto = {
      name: "Product to Answer",
      description: "This product will have its question answered",
      price: 400,
      stock: 2,
      category: "Electronics",
      images: ["http://example.com/electronics.jpg"],
      specifications: [{ key: "Power", value: "100W" }],
    };

    const postProductResponse = await request(app.getHttpServer())
      .post("/products")
      .send(createProductDto)
      .expect(201);

    const productId = postProductResponse.body.id;
    const questionDto = {
      question: "How long is the warranty?",
      userId: "testUser2",
      userName: "Test User 2",
    };

    const postQuestionResponse = await request(app.getHttpServer())
      .post(`/products/${productId}/questions`)
      .send(questionDto)
      .expect(201);

    const questionId = postQuestionResponse.body.id;
    const answerDto = { answer: "1 year warranty." };

    return request(app.getHttpServer())
      .post(`/products/${productId}/questions/${questionId}/answer`)
      .send(answerDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty("id");
        expect(res.body.question).toEqual(questionDto.question);
        expect(res.body).toHaveProperty("answer", answerDto.answer);
        expect(res.body).toHaveProperty("date");
      });
  });

  it("/products/:id/reviews (POST)", async () => {
    const createProductDto = {
      name: "Product for Review",
      description: "This product will be reviewed",
      price: 500,
      stock: 1,
      category: "Books",
      images: ["http://example.com/book_review.jpg"],
      specifications: [{ key: "Author", value: "Jane Doe" }],
    };

    const postProductResponse = await request(app.getHttpServer())
      .post("/products")
      .send(createProductDto)
      .expect(201);

    const productId = postProductResponse.body.id;
    const createReviewDto = {
      rating: 5,
      comment: "Excellent product!",
      userName: "Reviewer1",
    };

    return request(app.getHttpServer())
      .post(`/products/${productId}/reviews`)
      .send(createReviewDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty("id");
        expect(res.body.rating).toEqual(createReviewDto.rating);
        expect(res.body.comment).toEqual(createReviewDto.comment);
        expect(res.body.userName).toEqual(createReviewDto.userName);
        expect(res.body).toHaveProperty("date");
      });
  });

  it("/products/:id/reviews/:reviewId (PUT)", async () => {
    const createProductDto = {
      name: "Product to Update Review",
      description: "This product will have its review updated",
      price: 600,
      stock: 4,
      category: "Movies",
      images: ["http://example.com/movie_review.jpg"],
      specifications: [{ key: "Director", value: "John Doe" }],
    };

    const postProductResponse = await request(app.getHttpServer())
      .post("/products")
      .send(createProductDto)
      .expect(201);

    const productId = postProductResponse.body.id;
    const createReviewDto = {
      rating: 4,
      comment: "Good movie.",
      userName: "MovieFan1",
    };

    const postReviewResponse = await request(app.getHttpServer())
      .post(`/products/${productId}/reviews`)
      .send(createReviewDto)
      .expect(201);

    const reviewId = postReviewResponse.body.id;
    const updateReviewDto = {
      rating: 5,
      comment: "Excellent movie!",
    };

    return request(app.getHttpServer())
      .put(`/products/${productId}/reviews/${reviewId}`)
      .send(updateReviewDto)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("id", reviewId);
        expect(res.body.rating).toEqual(updateReviewDto.rating);
        expect(res.body.comment).toEqual(updateReviewDto.comment);
        expect(res.body.userName).toEqual(createReviewDto.userName); // Unchanged
      });
  });

  it("/products/:id/reviews/:reviewId (DELETE)", async () => {
    const createProductDto = {
      name: "Product to Delete Review",
      description: "This product will have its review deleted",
      price: 700,
      stock: 1,
      category: "Games",
      images: ["http://example.com/game.jpg"],
      specifications: [{ key: "Platform", value: "PC" }],
    };

    const postProductResponse = await request(app.getHttpServer())
      .post("/products")
      .send(createProductDto)
      .expect(201);

    const productId = postProductResponse.body.id;
    const createReviewDto = {
      rating: 3,
      comment: "Okay game.",
      userName: "Gamer1",
    };

    const postReviewResponse = await request(app.getHttpServer())
      .post(`/products/${productId}/reviews`)
      .send(createReviewDto)
      .expect(201);

    const reviewId = postReviewResponse.body.id;

    await request(app.getHttpServer())
      .delete(`/products/${productId}/reviews/${reviewId}`)
      .expect(200);

    // Verify review is deleted (e.g., by fetching the product and checking reviews array)
    return request(app.getHttpServer())
      .get(`/products/${productId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.reviews).toHaveLength(0);
      });
  });
});
