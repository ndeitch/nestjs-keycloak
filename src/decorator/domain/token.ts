export class Token {
  readonly accessToken: string
  readonly realm: string
  readonly organizationId: string

  constructor(accessToken: string) {
    const [, payload] = accessToken.split('.')

    const { iss, organization_id } = JSON.parse(Buffer.from(payload, 'base64').toString())

    this.accessToken = accessToken
    this.realm = iss
      .split('/')
      .slice(-1)
      .pop()
    this.organizationId = organization_id
  }
}
