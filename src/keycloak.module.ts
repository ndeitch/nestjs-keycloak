import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { KeycloakGuard } from './guard'
import { KeycloakStrategy } from './strategy'

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [KeycloakGuard, KeycloakStrategy],
})
export class KeycloakModule {}
