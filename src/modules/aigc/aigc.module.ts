import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AigcController } from './aigc.controller'
import { AiGcEntity } from './aigc.entity'
import { AiGcService } from './aigc.service'

const services = [AiGcService]

@Module({
  imports: [TypeOrmModule.forFeature([AiGcEntity])],
  controllers: [AigcController],
  providers: [...services],
  exports: [TypeOrmModule, ...services],
})
export class AiGcModule {}
