import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { PROTECTED } from '../constants'
import { KeycloakGuard } from '../guard/keycloak.guard'

export const Protected = (): any =>
  applyDecorators(SetMetadata(PROTECTED, true), UseGuards(KeycloakGuard))
