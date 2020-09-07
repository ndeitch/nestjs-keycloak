import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { HAS_ROLE } from '../constants'
import { KeycloakGuard } from '../guard/keycloak.guard'

export const HasRole = (roles: string | string[]): any =>
  applyDecorators(SetMetadata(HAS_ROLE, roles), UseGuards(KeycloakGuard))
