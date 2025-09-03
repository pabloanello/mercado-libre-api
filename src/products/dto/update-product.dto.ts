import { PartialType } from "@nestjs/mapped-types";
import { CreateProductDto } from "./create-product.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  specifications?: Array<{ name: string; value: string }>;

  @ApiProperty({ required: false })
  @IsOptional()
  stock?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  soldQuantity?: number;
}
