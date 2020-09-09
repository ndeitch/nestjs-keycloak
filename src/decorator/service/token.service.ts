import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { decode as jwtDecode, verify as jwtVerify } from 'jsonwebtoken'
import JwksClient, { JwksClient as JwkClient } from 'jwks-rsa'
import { promisify } from 'util'

@Injectable()
export class TokenService {
  private readonly jwkClient: JwkClient

  constructor(configService: ConfigService) {
    this.jwkClient = JwksClient({
      jwksUri: `${configService.get(
        'AUTHORIZATION_SERVER_URL',
      )}/realms/skore/protocol/openid-connect/certs`,
    })
  }

  async verifyToken(token: string): Promise<unknown> {
    const {
      header: { kid },
    } = jwtDecode(token, { complete: true }) as any

    const publicKey = await this.getKey(kid)

    const decodedToken = jwtVerify(token, publicKey)

    if (!decodedToken) throw new Error('Invalid access token')

    return decodedToken
  }

  private async getKey(kid: string): Promise<string> {
    const getPubKey = promisify(this.jwkClient.getSigningKey)
    const key = await getPubKey(kid)
    return key.getPublicKey()
  }
}
