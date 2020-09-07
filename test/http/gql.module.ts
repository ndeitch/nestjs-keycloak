import { Module, UseGuards } from '@nestjs/common'
import { GraphQLModule, Query, Resolver } from '@nestjs/graphql'
import { HasRole, HasScope, KeycloakModule, Protected } from '../../src'
import { KeycloakGuard } from '../../src/guard'

@Resolver(() => String)
class ResolverOne {
  @Query(() => String)
  public(): string {
    return 'Public'
  }
  @Query(() => String)
  @Protected()
  protected(): string {
    return 'protected'
  }
  @Query(() => String)
  @HasScope()
  hasScope(): string {
    return 'hasScope'
  }
  @Query(() => String)
  @HasRole('admin')
  hasRole(): string {
    return 'hasRole'
  }
  @Query(() => String)
  @HasRole(['admin', 'super-admin'])
  hasRoles(): string {
    return 'hasRoles'
  }
  @Query(() => String)
  @UseGuards(KeycloakGuard)
  misused(): string {
    return 'Misused'
  }
}

@Module({
  imports: [
    KeycloakModule,
    GraphQLModule.forRoot({ autoSchemaFile: true, context: ({ req }) => req }),
  ],
  providers: [ResolverOne],
})
export class GqlModule {}
