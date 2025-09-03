# How to Run the Project

## Prerequisites
- Node.js (v20 or higher)
- npm

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode
   ```bash
   npm run start:dev
   ```

The application will start on http://localhost:3000

## Build to Production Environment
   ```bash
   npm run build
   ```

## Testing

### Run all tests
   ```bash
   npm test
   ```

### Run tests with coverage
   ```bash
   npm run test:cov
   ```

### Run tests in watch mode
   ```bash
   npm run test:watch
   ```

## API Documentation

Once the application is running, access the Swagger documentation at:
http://localhost:3000/api/v1/app/docs

## Sample Requests

### Get all products
   ```bash
   curl http://localhost:3000/api/v1/products
   ```

### Get specific product
   ```bash
   curl http://localhost:3000/api/v1/products/MLA123456789
   ```

### Get related products
   ```bash
   curl http://localhost:3000/api/v1/products/MLA123456789/related
   ```

### Create new product
   ```bash
   curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Product",
    "price": 9999,
    "currency": "ARS",
    "condition": "new",
    "category": "Electronics",
    "thumbnail": "https://example.com/image.jpg",
    "images": ["https://example.com/image1.jpg"],
    "description": "Product description"
  }'
  ```

### Update a product
```bash
curl -X PUT http://localhost:3000/api/v1/products/MLA123456789 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Product Name",
    "price": 8999,
    "stock": 15
  }'
  ```

### Delete a product
```bash
curl -X DELETE http://localhost:3000/api/v1/products/MLA123456789
```

### Add a review
```bash
curl -X POST http://localhost:3000/api/v1/products/MLA123456789/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "userName": "John Doe",
    "rating": 5,
    "comment": "Excellent product!",
    "verifiedPurchase": true
  }'
```

### Answer a question
```bash
curl -X POST http://localhost:3000/api/v1/products/MLA123456789/questions/q1/answer \
  -H "Content-Type: application/json" \
  -d '{
    "answer": "Yes, it includes a 12-month warranty"
  }'
```

### Update sold quantity
```bash
curl -X PATCH http://localhost:3000/api/v1/products/MLA123456789/sold \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 2
  }'
```

## Data Persistence

The application uses JSON files stored in the data/ directory. The initial data will be automatically created when the application starts for the first time.
