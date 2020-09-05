import { Controller, Get } from '@nestjs/common'
import { HasRole, HasScope, Protected } from 'src/decorator'

@Controller('users')
export class UserController {
  @Protected()
  @Get('/protected/:id')
  hello(): string {
    return "You're authenticated"
  }

  @HasScope()
  @Get('/scoped/:id')
  getContent(): string {
    return "You've required scope"
  }

  @HasRole('admin')
  @Get('/role')
  scanContent(): string[] {
    return ['1', '2']
  }
}
