import {
  Body,
  Controller,
  Post,
  Sse,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { type Observable, interval, map } from 'rxjs'

import { ApiResult } from '~/common/decorators/api-result.decorator'

import { definePermission } from '~/modules/auth/decorators/permission.decorator'

import { Public } from '../auth/decorators/public.decorator'

import { AiGcEntity } from './aigc.entity'
import { AiGcService } from './aigc.service'

export const permissions = definePermission('aigc', {
  LIST: 'list',
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
} as const)

@ApiTags('Business - AiGc模块')
@Public()
@Controller('aigc')
export class AigcController {
  constructor(private readonly aigcService: AiGcService) { }

  @Post()
  @Sse('/completions')
  @ApiOperation({ summary: 'Try completions' })
  @ApiResult({ type: [AiGcEntity] })
  list(@Body() body: any): Observable<any> {
    return this.aigcService.complete(body)
  }

  @Post('/executor')
  @Sse('/executor')
  @ApiOperation({ summary: 'Try executors' })
  @ApiResult({ type: [AiGcEntity] })
  executor(@Body() body: any): Observable<any> {
    return this.aigcService.execute(body)
  }

  @Sse('/sse')
  sse(): Observable<any> {
    return interval(1000).pipe(map(_ => ({ data: 'hello world' })))
  }
}
