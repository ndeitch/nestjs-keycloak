import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { HAS_ROLE } from 'src/constants'
import { KeycloakGuard } from 'src/guard/keycloak.guard'

export const HasRole = (roles: string | string[]): any =>
  applyDecorators(SetMetadata(HAS_ROLE, roles), UseGuards(KeycloakGuard))
