import { Injectable, Logger } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ForbiddenError } from 'apollo-server-express'
import { Strategy } from 'passport-http-bearer'
import { KeycloakService } from 'src/service'
import { HAS_ROLE, HAS_SCOPE, PROTECTED } from '../constants'

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak') {
  constructor(private readonly keycloakService: KeycloakService) {
    super({ passReqToCallback: true })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async validate(req: any, token: string): Promise<boolean> {
    try {
      const type = req.protectionType as string
      const realm = this.realmFromToken(token)

      if (type === PROTECTED) {
        return this.keycloakService.validateAccessToken(realm, token)
      } else if (type === HAS_SCOPE) {
        return this.keycloakService.checkScope(realm, req, req.scope, req.resource)
      } else if (type === HAS_ROLE) {
        return this.keycloakService.hasRole(realm, token, req.roles)
      }

      Logger.warn('No protection type defined denying access', KeycloakStrategy.name)

      return false
    } catch (error) {
      Logger.debug(`Invalid token message=${error.message}`, KeycloakStrategy.name)

      if (req.isRest) return false

      throw new ForbiddenError(error.message)
    }
  }

  private realmFromToken(token: string): string {
    try {
      const [, payload] = token.split('.')

      const data = JSON.parse(Buffer.from(payload, 'base64').toString())

      return data.iss.substring(data.iss.lastIndexOf('/') + 1)
    } catch (error) {
      throw new Error('Invalid token')
    }
  }
}
