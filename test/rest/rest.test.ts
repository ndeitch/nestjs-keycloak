import { suite, test } from '@testdeck/jest'
import { BaseTest } from 'test/base-test'
import { OneControllerModule } from './modules'

@suite('REST')
export class RestTest extends BaseTest {
  @test
  async 'Given public route then return text'() {
    const httpServer = await super.httpServerForModule(OneControllerModule)

    const response = await httpServer.get('/public')

    expect(response.status).toBe(200)
    expect(response.text).toBe('Public')
  }
}
