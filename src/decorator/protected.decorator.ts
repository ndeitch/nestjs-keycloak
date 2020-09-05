import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { PROTECTED } from 'src/constants'
import { KeycloakGuard } from 'src/guard/keycloak.guard'

export const Protected = (): any =>
  applyDecorators(SetMetadata(PROTECTED, true), UseGuards(KeycloakGuard))
