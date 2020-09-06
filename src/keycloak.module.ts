import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { KeycloakGuard } from './guard'
import { KeycloakService } from './service'
import { KeycloakStrategy } from './strategy'

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [KeycloakGuard, KeycloakStrategy, KeycloakService],
})
export class KeycloakModule {}
