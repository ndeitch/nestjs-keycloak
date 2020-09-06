import { Test } from '@nestjs/testing'
import 'reflect-metadata'
import request, { SuperTest } from 'supertest'

export abstract class BaseTest {
  before() {
    expect.hasAssertions()
  }

  async httpServerForModule(module: any): Promise<SuperTest<request.Test>> {
    const moduleRef = await Test.createTestingModule({ imports: [module] }).compile()
    const app = await moduleRef.createNestApplication().init()
    return request(app.getHttpServer())
  }
}
