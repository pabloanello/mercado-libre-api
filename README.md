# Mercado Libre Inspired API

A NestJS backend API for item detail pages inspired by Mercado Libre.

## API Design

### Architecture
- **Framework**: NestJS with TypeScript
- **Data Storage**: JSON files with in-memory caching
- **Validation**: Class-validator with DTOs
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with Supertest for E2E tests

### Main Endpoints

#### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product by ID
- `GET /api/v1/products/:id/related` - Get related products
- `POST /api/v1/products` - Create new product
- `PUT /api/v1/products/:id` - Update a product
- `DELETE /api/v1/products/:id` - Delete a product
- `POST /api/v1/products/:id/reviews` - Add a review
- `PUT /api/v1/products/:id/reviews/:reviewId` - Update a review
- `DELETE /api/v1/products/:id/reviews/:reviewId` - Delete a review
- `POST /api/v1/products/:id/questions` - Add a question
- `POST /api/v1/products/:id/questions/:questionId/answer` - Answer a question
- `DELETE /api/v1/products/:id/questions/:questionId` - Delete a question
- `PATCH /api/v1/products/:id/sold` - Increment sold quantity

### Data Structure

Each product includes:
- Basic information (title, price, description)
- Images and specifications
- Seller information
- Reviews and questions
- Shipping details
- Stock and sales data

### Error Handling
- 404 for not found resources
- 400 for validation errors
- 500 for server errors with detailed logging
- Custom exception filters for consistent error responses

### Key Decisions
1. **JSON File Storage**: Chosen for simplicity and to avoid database setup
2. **In-Memory Caching**: Products are loaded into memory for faster access
3. **Validation Pipes**: Global validation with class-validator
4. **Swagger Documentation**: Auto-generated API documentation
5. **Comprehensive Error Handling**: Custom exception filters and HTTP exceptions

## Setup Instructions

1. Install dependencies: `npm install`
2. Start development server: `npm run start:dev`
3. Run tests: `npm test`
4. Access Swagger docs: `http://localhost:3000/api/v1/app/docs`

## Development

- Follow NestJS best practices
- Use DTOs for data validation
- Implement proper error handling
- Write comprehensive tests
- Maintain clean code structure