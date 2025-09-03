import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class GetProductDto {
  @ApiProperty({ description: "Product ID" })
  @IsString()
  @IsNotEmpty()
  id: string;
}
