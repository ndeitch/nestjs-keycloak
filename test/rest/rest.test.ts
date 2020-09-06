import { Test } from '@nestjs/testing'
import { params, suite, test } from '@testdeck/jest'
import { KeycloakService } from 'src/service'
import { BaseTest } from 'test/base-test'
import { OneControllerModule } from './modules'

@suite('REST')
export class RestTest extends BaseTest {
  @test
  async 'Given public route then return text'() {
    const httpServer = await super.httpServerForModule(
      Test.createTestingModule({ imports: [OneControllerModule] }),
    )

    const response = await httpServer.get('/public')

    expect(response.status).toBe(200)
    expect(response.text).toBe('Public')
  }

  @test
  async 'Given misused lib should deny request'() {
    const httpServer = await super.httpServerForModule(
      Test.createTestingModule({ imports: [OneControllerModule] }),
    )

    const response = await httpServer.get('/misused').auth(RestTest.token(), { type: 'bearer' })

    expect(response.status).toBe(401)
  }

  @params({ path: '/protected', token: '123123', status: 401 }, 'malformed token then return 401')
  @params({ path: '/protected' }, '[@Protected()] valid access token return protected resource')
  @params({ path: '/has-scope' }, '[@HasScope()] valid access token return scoped resource')
  @params({ path: '/has-role' }, '[@HasRole()] valid token return protected by role resource')
  @params({ path: '/has-roles' }, '[@HasRole()] valid token return protected roles array')
  async 'Granted access '({ path, token = RestTest.token(), status = 200 }) {
    const httpServer = await super.httpServerForModule(
      Test.createTestingModule({ imports: [OneControllerModule] })
        .overrideProvider(KeycloakService)
        .useValue({ validateAccessToken: () => true, checkScope: () => true, hasRole: () => true }),
    )

    const response = await httpServer.get(path).auth(token, { type: 'bearer' })

    expect(response.status).toBe(status)
  }

  @params({ path: '/protected' }, '[@Protected()] invalid token for protected return 401')
  @params({ path: '/has-scope' }, '[@HasScope()] invalid token for scoped resource return 401')
  @params({ path: '/has-role' }, '[@HasRole()] invalid token for role resource return 401')
  @params({ path: '/has-roles' }, '[@HasRole()] invalid token for roles array resource return 401')
  async 'Deny access '({ path, token = RestTest.token(), status = 401 }) {
    const httpServer = await super.httpServerForModule(
      Test.createTestingModule({ imports: [OneControllerModule] })
        .overrideProvider(KeycloakService)
        .useValue({
          validateAccessToken: () => {
            throw new Error('Invalid access token')
          },
          checkScope: () => {
            throw new Error('Missing required permission')
          },
          hasRole: () => {
            throw new Error('Missing required role')
          },
        }),
    )

    const response = await httpServer.get(path).auth(token, { type: 'bearer' })

    expect(response.status).toBe(status)
  }

  private static token(): string {
    return `123123.${Buffer.from('{"iss":"https://identity.skore.dev/auth/realms/skore"}').toString(
      'base64',
    )}`
  }
}
