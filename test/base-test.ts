import { TestingModuleBuilder } from '@nestjs/testing'
import 'reflect-metadata'
import request, { SuperTest } from 'supertest'

export abstract class BaseTest {
  before() {
    expect.hasAssertions()
  }

  async httpServerForModule(moduleBuilder: TestingModuleBuilder): Promise<SuperTest<request.Test>> {
    const moduleRef = await moduleBuilder.compile()
    const app = await moduleRef.createNestApplication().init()
    return request(app.getHttpServer())
  }
}
