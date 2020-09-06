import { Controller, Get, Module, Post, Put } from '@nestjs/common'
import { HasRole, HasScope, KeycloakModule, Protected } from 'src'

@Controller()
class ControllerOne {
  @Get('public')
  public(): unknown {
    return 'Public'
  }
  @Get()
  @Protected()
  protected(): string {
    return 'Protected'
  }
  @Post()
  @HasScope()
  hasScope(): string {
    return 'HasScope'
  }
  @Put()
  @HasRole('admin')
  hasRole(): string {
    return 'hasRole'
  }
}

@Module({ controllers: [ControllerOne], imports: [KeycloakModule] })
export class OneControllerModule {}
