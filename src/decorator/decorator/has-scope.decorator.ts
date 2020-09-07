import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { KeycloakGuard } from '../guard/keycloak.guard'
import { HAS_SCOPE } from '../constants'

export function HasScope(resourceInfo: { resourceId: string } = { resourceId: 'id' }): any {
  return applyDecorators(SetMetadata(HAS_SCOPE, resourceInfo.resourceId), UseGuards(KeycloakGuard))
}
