import { Resolver, Query, Args } from '@nestjs/graphql'
import { Protected, HasScope, HasRole } from 'src/decorator'

@Resolver(() => String)
export class UserResolver {
  @Protected()
  @Query(() => String)
  protected(): string {
    return "You're authenticated"
  }

  @HasScope()
  @Query(() => String)
  getContent(@Args('id') id: string): string {
    console.log(id)

    return "You've required scope"
  }

  @HasRole('admin')
  @Query(() => [String])
  readContent(): string[] {
    return ['1', '2']
  }
}
