import { TestingModuleBuilder } from '@nestjs/testing'
import axios from 'axios'
import { stringify } from 'qs'
import 'reflect-metadata'
import request, { SuperTest } from 'supertest'

export abstract class BaseTest {
  static token: string
  static noAccessToken: string

  static async before() {
    const response = await axios.post(
      'http://localhost:8080/auth/realms/skore/protocol/openid-connect/token',
      stringify({
        client_id: 'player',
        client_secret: '436db9f9-d49b-4c83-9480-8e38d21570c6',
        grant_type: 'client_credentials',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )

    BaseTest.token = response.data.access_token

    const noAccessClient = await axios.post(
      'http://localhost:8080/auth/realms/skore/protocol/openid-connect/token',
      stringify({
        client_id: 'no-access-client',
        client_secret: '0f9d7137-0f35-4cdf-8c33-1b331ca349c1',
        grant_type: 'client_credentials',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )

    BaseTest.noAccessToken = noAccessClient.data.access_token
  }

  before() {
    expect.hasAssertions()
  }

  async httpServerForModule(moduleBuilder: TestingModuleBuilder): Promise<SuperTest<request.Test>> {
    const moduleRef = await moduleBuilder.compile()
    const app = await moduleRef.createNestApplication().init()
    return request(app.getHttpServer())
  }

  token(): string {
    return BaseTest.token
  }

  noAccessToken(): string {
    return BaseTest.noAccessToken
  }

  fakeToken(): string {
    return `123123.${Buffer.from('{"iss":"http://localhost:8080/auth/realms/skore"}').toString(
      'base64',
    )}`
  }
}
