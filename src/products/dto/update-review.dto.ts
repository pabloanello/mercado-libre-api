import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNumber, Min, Max, IsString } from "class-validator";

export class UpdateReviewDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
