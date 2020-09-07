import { Injectable, Logger } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ForbiddenError } from 'apollo-server-express'
import { Strategy } from 'passport-http-bearer'
import { HAS_ROLE, HAS_SCOPE, PROTECTED } from '../constants'
import { KeycloakService } from '../service'

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

      switch (type) {
        case PROTECTED:
          await this.keycloakService.validateAccessToken(realm, token)
          break
        case HAS_SCOPE:
          await this.keycloakService.checkScope(realm, req, req.scope, req.resource)
          break
        case HAS_ROLE:
          await this.keycloakService.hasRole(realm, token, req.roles)
          break
        default:
          Logger.warn('No protection type defined denying access', KeycloakStrategy.name)
          if (req.isRest) return false
          throw new ForbiddenError('Invalid server configuration')
      }

      return true
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
