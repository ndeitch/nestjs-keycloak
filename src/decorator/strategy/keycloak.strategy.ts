import { Injectable, Logger } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ForbiddenError } from 'apollo-server-express'
import { Strategy } from 'passport-http-bearer'
import { HAS_ROLE, HAS_SCOPE, PROTECTED } from '../constants'
import { Token } from '../domain'
import { KeycloakService } from '../service'
import { TokenService } from '../service/token.service'

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak') {
  constructor(
    private readonly keycloakService: KeycloakService,
    private readonly tokenService: TokenService,
  ) {
    super({ passReqToCallback: true })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async validate(req: any, accessToken: string): Promise<boolean> {
    try {
      const type = req.protectionType as string

      switch (type) {
        case PROTECTED:
          await this.tokenService.verifyToken(accessToken)
          break
        case HAS_SCOPE:
          await this.keycloakService.checkScope(
            new Token(accessToken),
            req,
            req.scope,
            req.resource,
          )
          break
        case HAS_ROLE:
          await this.keycloakService.hasRole(new Token(accessToken), req.roles)
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
}
