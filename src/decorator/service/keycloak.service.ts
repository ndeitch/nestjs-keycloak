import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import * as Keycloak from 'keycloak-connect'
import { Token } from '../domain'

@Injectable()
export class KeycloakService {
  private readonly clientsCache = new Map<string, Keycloak.Keycloak>()
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly authorizationServerUrl: string

  constructor(configService: ConfigService) {
    this.clientId = configService.get('CLIENT_ID')
    this.clientSecret = configService.get('CLIENT_SECRET')
    this.authorizationServerUrl = configService.get('AUTHORIZATION_SERVER_URL')
  }

  async checkScope(
    token: Token,
    request: Request,
    scope: string,
    resource?: string,
  ): Promise<boolean> {
    const keycloak = this.clientForRealm(token.realm)
    const permission = `${resource ? resource : this.clientId}:${scope}`

    const enforcerFn = this.clientForRealm(token.realm).enforcer(permission, {
      response_mode: 'token',
    })

    await new Promise((resolve, reject) => {
      keycloak.accessDenied = () => reject(new Error(`Missing required '${permission}' permission`))
      enforcerFn(request, null, resolve)
    })

    return true
  }

  async hasRole(token: Token, roles: string[]): Promise<boolean> {
    const grant = await this.clientForRealm(token.realm).grantManager.createGrant({
      access_token: (token.accessToken as unknown) as Keycloak.Token,
    })

    const hasRole = roles.some((role: string) => grant.access_token.hasRole(role))

    if (hasRole) return true

    throw new Error('Missing required role')
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
}
