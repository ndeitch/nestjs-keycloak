import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'
import { HAS_ROLE, HAS_SCOPE, PROTECTED } from '../constants'

@Injectable()
export class KeycloakGuard extends AuthGuard('keycloak') {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  getRequest(context: ExecutionContext): unknown {
    const isRest = context.getType() === 'http'

    const request = isRest
      ? context.switchToHttp().getRequest()
      : GqlExecutionContext.create(context).getContext().req

    request.isRest = isRest
    const handler = context.getHandler()

    const hasProtectedDecorator = this.reflector.get<boolean>(PROTECTED, handler)

    if (hasProtectedDecorator) {
      request.protectionType = PROTECTED
      return request
    }

    const scopeDecorator = this.reflector.get<string>(HAS_SCOPE, handler)

    if (scopeDecorator) {
      request.protectionType = HAS_SCOPE

      request.resource = isRest
        ? request.params[scopeDecorator]
        : GqlExecutionContext.create(context).getArgs()[scopeDecorator]

      request.scope = context.getHandler().name
      return request
    }

    const roleDecorator = this.reflector.get<string | string[]>(HAS_ROLE, handler)

    if (roleDecorator) {
      request.protectionType = HAS_ROLE
      request.roles = Array.isArray(roleDecorator) ? roleDecorator : [roleDecorator]
      return request
    }

    return request
  }
}
