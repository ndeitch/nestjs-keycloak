import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { UserController } from './controller'
import { KeycloakGuard } from './guard'
import { UserResolver } from './resolver'
import { KeycloakStrategy } from './strategy'

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({ autoSchemaFile: true, context: ({ req }) => req }),
  ],
  controllers: [UserController],
  providers: [KeycloakGuard, KeycloakStrategy, UserResolver],
})
export class KeycloakModule {}
