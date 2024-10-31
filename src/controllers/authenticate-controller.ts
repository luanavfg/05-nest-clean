import {
  ConflictException,
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { compare, hash } from 'bcryptjs'
import { z } from 'zod'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { JwtService } from '@nestjs/jwt'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/sessions')
export class AuthenticateController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body

    const user = await this.prisma.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      throw new UnauthorizedException('User credentials do not match.')
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('User credentials do not match.')
    }

    const accessToken = this.jwt.sign({
      sub: user.id,
    })

    return { access_token: accessToken }
  }
}
