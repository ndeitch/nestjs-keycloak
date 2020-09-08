## NestJS Keycloak

`nestjs-keycloak` is a nestjs guard implementation which supports **Rest endpoints** and **GraphQL resolvers** authentication/authorization against a keycloak server.

### Getting started

Install nestjs-keycloak

```sh
  npm install @ndeitch/nestjs-keycloak
```

Import `nestjs-keycloak` module to your app

```ts
@Module({ imports: [KeycloakModule] })
export class AppModule {}
```

Add **required** environment variables:

.env

```sh
CLIENT_ID="some-id"
CLIENT_SECRET="some-secret"
AUTHORIZATION_SERVER_URL="https://your-keycloak-instance/auth"
```

### Available decorators

#### Resource protection

**Usage**:

```ts
@Get()
@Protected()
protected(): string {
  return 'Your token is valid'
}
```

**Behavior**

Performs a live validation on KC server

**Example**

Controller expecting jwt token valid:

```ts
@Controller('users')
export class UserController {
  @Get(':userId')
  @Protected()
  getUser(): string {
    return 'Your token is valid'
  }
}
```

Requesting user `1`

```curl
  curl GET 'http://localhost:3000/users/1' --header 'Authorization: Bearer ey...'
```

If it's ok, user is returned, otherwise a 401 is returned.

#### Scope validation

**Usage**

```ts
@Get(':id')
@HasScope()
scoped(): string {
  return "You've id:scoped scope"
}
```

**Behavior**

Performs a UMA request to KC server. Extracts resource id parameter from request params, if there is no id in request, then it sends `CLIENT_ID` as resource to perform validation.

As default `@HasScope` looks for `id` param in request, if you want to supply a different one, then pass as param like: `@HasScope({ resourceId: 'request-id' })`

**Example**

Controller expecting `id:getUser` permission on KC:

```ts
@Controller('users')
export class UserController {
  @Get(':userId')
  @HasScope({ resourceId: 'userId' })
  getUser(): string {
    return "You've id:scoped scope"
  }
}
```

Requesting user `1` so the token must have `1:getUser` permission

```curl
  curl GET 'http://localhost:3000/users/1' --header 'Authorization: Bearer ey...'
```

If it's ok, user is returned, otherwise a 401 is returned.

Note: as resource id on `@Get(':userId')` is not `id` you must have to update on `@HasScope` with `{ resourceId: 'userId' }`

#### Role validation

**Usage**

```ts
@Get(':id')
@HasRole('admin')
adminOnly(): string {
  return "You're admin"
}
```

**Behavior**

Validate token against KC server and checks if it has required role for `CLIENT_ID`

**Example**

Controller expecting `admin` role for resource `content` which is the `CLIENT_ID` on `.env`:

```ts
@Controller('users')
export class UserController {
  @Get(':id')
  @HasRole('admin')
  adminOnly(): string {
    return "You're admin"
  }
}
```

Requesting user `1`:

```curl
  curl GET 'http://localhost:3000/users/1' --header 'Authorization: Bearer ey...'
```

Jwt token must have:

```json
{
  "resource_access": {
    "content": {
      "roles": ["admin"]
    }
  }
}
```

If it's ok, user is returned, otherwise a 401 is returned.

Note: you can pass a list of roles `@HasScope(['admin', 'super-admin'])` if token has some role request is granted

### GraphQL

The `context` in gql module configuration is required

```ts
@Module({
  imports: [
    KeycloakModule,
    GraphQLModule.forRoot({
      context: ({ req }) => req, // THIS LINE IS REQUIRED
    }),
  ],
  providers: [ResolverOne],
})
export class GqlModule {}
```

With this config, everything should work as expected

### Multi tenancy

This lib get `realm` from jwt token `iss` property you can check [here](https://github.com/ndeitch/nestjs-keycloak/blob/master/src/decorator/strategy/keycloak.strategy.ts#L46) how it's done. If realm not found the request is denied

### Additional info

- JWT token must be sent as http header in format: `Bearer YOUR_JWT_TOKEN` for both `Rest` and `GraphQL`
