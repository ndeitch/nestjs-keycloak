import { Module } from '@nestjs/common'
import { KeycloakGuard } from './guard'
import { KeycloakService, TokenService } from './service'
import { KeycloakStrategy } from './strategy'

@Module({ providers: [KeycloakService, KeycloakStrategy, KeycloakGuard, TokenService] })
export class DecoratorModule {}
