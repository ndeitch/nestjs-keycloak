import { Module } from '@nestjs/common'
import { KeycloakGuard } from './guard'
import { KeycloakService } from './service'
import { KeycloakStrategy } from './strategy'

@Module({ providers: [KeycloakService, KeycloakStrategy, KeycloakGuard] })
export class DecoratorModule {}
