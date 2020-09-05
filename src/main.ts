import { NestFactory } from '@nestjs/core'
import { KeycloakModule } from './keycloak.module'

async function bootstrap() {
  const app = await NestFactory.create(KeycloakModule)

  await app.listen(process.env.PORT || 8080)
}

bootstrap()
