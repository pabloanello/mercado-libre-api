import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  currency: string;
  condition: "new" | "used" | "refurbished";
  category: string;
  thumbnail: string;
  images: string[];
  description: string;
  specifications: ProductSpecification[];
  seller: Seller;
  stock: number;
  soldQuantity: number;
  reviews: Review[];
  questions: Question[];
  shipping: ShippingInfo;
  warranty?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductSpecification {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;
}

export interface Seller {
  id: string;
  name: string;
  reputation: number;
  totalSales: number;
  positiveReviews: number;
  responseRate: number;
  responseTime: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  verifiedPurchase: boolean;
}

export interface Question {
  id: string;
  userId: string;
  userName: string;
  question: string;
  answer?: string;
  date: Date;
}

export interface ShippingInfo {
  freeShipping: boolean;
  shippingCost?: number;
  estimatedDelivery: string;
  returns: boolean;
}
