import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class AigcDto {
  @ApiProperty({ description: '名称' })
  @IsString()
  value: string
}
