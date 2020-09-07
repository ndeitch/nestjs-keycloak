import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { KeycloakGuard } from '../guard/keycloak.guard'
import { PROTECTED } from '../constants'

export const Protected = (): any =>
  applyDecorators(SetMetadata(PROTECTED, true), UseGuards(KeycloakGuard))
