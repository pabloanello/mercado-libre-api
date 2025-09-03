import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  IsUrl,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ProductSpecification } from "../interfaces/product.interface";

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  originalPrice?: number;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty({ enum: ["new", "used", "refurbished"] })
  @IsIn(["new", "used", "refurbished"])
  condition: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsUrl()
  thumbnail: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUrl({}, { each: true })
  images: string[];

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  stock: number;

  @ApiProperty({ type: [ProductSpecification], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecification)
  specifications?: ProductSpecification[];
}
