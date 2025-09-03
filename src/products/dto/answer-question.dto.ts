import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class AnswerQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  answer: string;
}
