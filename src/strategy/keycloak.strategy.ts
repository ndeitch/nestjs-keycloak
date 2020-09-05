/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ForbiddenError } from 'apollo-server-express'
import * as Keycloak from 'keycloak-connect'
import { Strategy } from 'passport-http-bearer'
import { HAS_ROLE, HAS_SCOPE, PROTECTED } from '../constants'

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak') {
  private readonly clientsCache = new Map<string, Keycloak.Keycloak>()
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly authorizationServerUrl: string

  constructor(configService: ConfigService) {
    super({ passReqToCallback: true })
    this.clientId = configService.get('CLIENT_ID')
    this.clientSecret = configService.get('CLIENT_SECRET')
    this.authorizationServerUrl = configService.get('AUTHORIZATION_SERVER_URL')
  }

  async validate(req: any, token: string): Promise<boolean> {
    try {
      const type = req.protectionType as string
      const resource = req.resource as string
      const keycloak = this.clientForRealm(this.realmFromToken(token))

      if (type === PROTECTED) {
        const tokenResult = await keycloak.grantManager.validateAccessToken(token)

        if (typeof tokenResult === 'string') return true

        throw new Error('Invalid access token')
      } else if (type === HAS_SCOPE) {
        const permission = `${resource ? resource : this.clientId}:${req.scope}`
        const enforcerFn = keycloak.enforcer(permission, {
          response_mode: 'token',
        })

        await new Promise((resolve, reject) => {
          keycloak.accessDenied = () =>
            reject(new Error(`Missing required '${permission}' permission`))
          enforcerFn(req, null, resolve)
        })

        return true
      } else if (type === HAS_ROLE) {
        const grant = await keycloak.grantManager.createGrant({
          access_token: (token as unknown) as Keycloak.Token,
        })

        const hasRole = req.roles.some((role: string) => grant.access_token.hasRole(role))

        if (hasRole) return true
        throw new Error('Missing required role')
      }

      Logger.warn('No protection type defined denying access', KeycloakStrategy.name)

      return false
    } catch (error) {
      Logger.debug(`Invalid token message=${error.message}`, KeycloakStrategy.name)

      if (req.isHttp) return false

      throw new ForbiddenError(error.message)
    }
  }

  private clientForRealm(realm: string): Keycloak.Keycloak {
    if (!this.clientsCache.has(realm)) {
      this.clientsCache.set(
        realm,
        new Keycloak.default({}, {
          resource: this.clientId,
          realm,
          authServerUrl: this.authorizationServerUrl,
          secret: this.clientSecret,
        } as any),
      )
    }

    return this.clientsCache.get(realm)
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
