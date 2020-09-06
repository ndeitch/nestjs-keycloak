import { Controller, Get, Module, UseGuards } from '@nestjs/common'
import { HasRole, HasScope, KeycloakModule, Protected } from 'src'
import { KeycloakGuard } from 'src/guard'

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
  @Get('has-scope')
  @HasScope()
  hasScope(): string {
    return 'HasScope'
  }
  @Get('has-role')
  @HasRole('admin')
  hasRole(): string {
    return 'hasRole'
  }
  @Get('has-roles')
  @HasRole(['admin', 'super-admin'])
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
export class OneControllerModule {}
