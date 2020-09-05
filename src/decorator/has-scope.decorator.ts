import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { HAS_SCOPE } from 'src/constants'
import { KeycloakGuard } from 'src/guard/keycloak.guard'

export function HasScope(resourceInfo: { resourceId: string } = { resourceId: 'id' }): any {
  return applyDecorators(SetMetadata(HAS_SCOPE, resourceInfo.resourceId), UseGuards(KeycloakGuard))
}
