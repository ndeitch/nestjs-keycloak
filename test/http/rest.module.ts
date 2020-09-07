import { Controller, Get, Module, UseGuards } from '@nestjs/common'
import { HasRole, HasScope, KeycloakModule, Protected } from '../../src'
import { KeycloakGuard } from '../../src/decorator/guard'

@Controller()
class ControllerOne {
  @Get('public')
  public(): string {
    return 'Public'
  }
  @Get('protected')
  @Protected()
  protected(): string {
    return 'Protected'
  }
  @Get('hasScope/:id')
  @HasScope()
  hasScope(): string {
    return 'HasScope'
  }
  @Get('resourceScope')
  @HasScope()
  resourceScope(): string {
    return 'resourceScope'
  }
  @Get('hasRole')
  @HasRole('admin')
  hasRole(): string {
    return 'hasRole'
  }
  @Get('hasRoles')
  @HasRole(['not-found', 'admin'])
  hasRoles(): string {
    return 'hasRoles'
  }
  @Get('misused')
  @UseGuards(KeycloakGuard)
  misused(): string {
    return 'Misused'
  }
}

@Module({ controllers: [ControllerOne], imports: [KeycloakModule] })
export class RestModule {}
