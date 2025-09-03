# Mercado Libre Inspired Backend API  
**Technical Documentation**

---

## 📌 Project Overview  
A NestJS backend API for **item detail pages inspired by Mercado Libre**, featuring:  
- Complete **CRUD operations**  
- **Reviews management**  
- **Questions & Answers handling**  
- **Inventory tracking**  

The API simulates a real-world e-commerce system, focusing on scalability, maintainability, and modular design.

---

## 🏗 Architecture Design  

### System Architecture  
```

Client → API Gateway → Products Module → Data Service → JSON Files

```

### Layers  
- **Controller Layer**: Handles HTTP requests/responses  
- **Service Layer**: Business logic implementation  
- **Data Layer**: Manages JSON-based storage and caching  

---

## 🛠 Technology Stack  

| Component      | Technology                            |
|---------------|--------------------------------------|
| Framework     | NestJS 9.x                          |
| Language      | TypeScript 4.7+                     |
| Runtime       | Node.js 20+                         |
| Testing       | Jest + Supertest                    |
| Documentation | Swagger / OpenAPI                   |
| Validation    | class-validator + class-transformer |
| Data Storage  | JSON files with in-memory caching   |

---

## ✅ Features  

- **Product Details**: CRUD for product listings  
- **Reviews**: Add, fetch, and manage reviews per product  
- **Questions & Answers**: Submit and respond to customer inquiries  
- **Inventory Tracking**: Stock management per product  
- **Search & Filtering**: Query products by category, price, or keyword  
- **Swagger Integration**: Auto-generated API docs  

---

## 🔗 API Endpoints  

### **Products**  
| Method | Endpoint        | Description       |
|--------|-----------------|-------------------|
| GET    | `/products`     | List all products |
| GET    | `/products/:id` | Get product by ID |
| POST   | `/products`     | Create new product |
| PUT    | `/products/:id` | Update product    |
| DELETE | `/products/:id` | Delete product    |

---

### **Reviews**  
| Method | Endpoint                          | Description           |
|--------|-----------------------------------|-----------------------|
| GET    | `/products/:id/reviews`          | Get reviews for product |
| POST   | `/products/:id/reviews`          | Add review to product |
| DELETE | `/products/:id/reviews/:reviewId`| Delete review         |

---

### **Questions & Answers**  
| Method | Endpoint                          | Description           |
|--------|-----------------------------------|-----------------------|
| GET    | `/products/:id/questions`        | Get Q&A for product  |
| POST   | `/products/:id/questions`        | Ask a question       |
| PATCH  | `/products/:id/questions/:qid`   | Answer a question    |

---

## 📂 Data Models  

### **Product**  
```typescript
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: string;
  reviews: Review[];
  questions: Question[];
}
```

### **Review**

```typescript
interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
```

### **Question**

```typescript
interface Question {
  id: string;
  user: string;
  question: string;
  answer?: string;
  createdAt: Date;
}
```

---

## ⚙ Installation & Setup

```bash
cd mercado-libre-api

# Install dependencies
npm install

# Start development server
npm run start:dev
```

---

## ✅ Testing

```bash
# Run all tests
npm run test
```

---

## 📄 API Documentation

Swagger UI available at:

```
http://localhost:3000/api/v1/app/docs
```

---

## 🏆 Author

**Pablo Anello**
Backend Developer 
---