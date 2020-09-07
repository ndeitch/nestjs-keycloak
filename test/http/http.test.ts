import { Test } from '@nestjs/testing'
import { params, suite, test } from '@testdeck/jest'
import { KeycloakService } from '../../src/service'
import { BaseTest } from '../base-test'
import { GqlModule } from './gql.module'
import { RestModule } from './rest.module'

@suite('HTTP')
export class HttpTest extends BaseTest {
  @test
  async 'Given public route then return text'() {
    const httpServer = await super.httpServerForModule(
      Test.createTestingModule({ imports: [RestModule, GqlModule] }),
    )

    const restResponse = await httpServer.get('/public')
    expect(restResponse.status).toBe(200)
    expect(restResponse.text).toBe('Public')

    const gqlResponse = await httpServer.post('/graphql').send({ query: 'query { public }' })
    expect(gqlResponse.body.data.public).toBe('Public')
  }

  @test
  async 'Given malformed token then return forbidden'() {
    const httpServer = await super.httpServerForModule(
      Test.createTestingModule({ imports: [RestModule, GqlModule] }),
    )

    const restResponse = await httpServer.get('/protected').auth('13123123', { type: 'bearer' })
    expect(restResponse.status).toBe(401)

    const gqlResponse = await httpServer
      .post('/graphql')
      .send({ query: 'query { protected }' })
      .auth('13123123', { type: 'bearer' })

    expect(gqlResponse.body.errors[0].extensions.code).toBe('FORBIDDEN')
  }

  @test
  async 'Given misused lib should deny request'() {
    const httpServer = await super.httpServerForModule(
      Test.createTestingModule({ imports: [RestModule, GqlModule] }),
    )

    const restResponse = await httpServer.get('/misused').auth(super.token(), { type: 'bearer' })
    expect(restResponse.status).toBe(401)

    const gqlResponse = await httpServer
      .post('/graphql')
      .auth(super.token(), { type: 'bearer' })
      .send({ query: 'query { misused }' })

    expect(gqlResponse.body.errors[0].extensions.code).toBe('FORBIDDEN')
  }

  @params({ path: 'protected' }, '[@Protected()] valid access token return protected resource')
  @params({ path: 'hasScope' }, '[@HasScope()] valid access token return scoped resource')
  @params({ path: 'hasRole' }, '[@HasRole()] valid token return protected by role resource')
  @params({ path: 'hasRoles' }, '[@HasRole()] valid token return protected roles array')
  async 'Granted access '({ path }) {
    const httpServer = await super.httpServerForModule(
      Test.createTestingModule({ imports: [RestModule, GqlModule] })
        .overrideProvider(KeycloakService)
        .useValue({ validateAccessToken: () => true, checkScope: () => true, hasRole: () => true }),
    )

    const restResponse = await httpServer.get(`/${path}`).auth(super.token(), { type: 'bearer' })
    expect(restResponse.status).toBe(200)

    const gqlResponse = await httpServer
      .post('/graphql')
      .auth(super.token(), { type: 'bearer' })
      .send({ query: `query { ${path} }` })

    expect(gqlResponse.body.data[path]).toBe(path)
  }

  @params({ path: 'protected' }, '[@Protected()] invalid token for protected return 401')
  @params({ path: 'hasScope' }, '[@HasScope()] invalid token for scoped resource return 401')
  @params({ path: 'hasRole' }, '[@HasRole()] invalid token for role resource return 401')
  @params({ path: 'hasRoles' }, '[@HasRole()] invalid token for roles array resource return 401')
  async 'Deny access '({ path }) {
    const httpServer = await super.httpServerForModule(
      Test.createTestingModule({ imports: [RestModule, GqlModule] })
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

    const restResponse = await httpServer.get(`/${path}`).auth(super.token(), { type: 'bearer' })
    expect(restResponse.status).toBe(401)

    const gqlResponse = await httpServer
      .post('/graphql')
      .auth(super.token(), { type: 'bearer' })
      .send({ query: `query { ${path} }` })

    expect(gqlResponse.body.errors[0].extensions.code).toBe('FORBIDDEN')
  }
}
