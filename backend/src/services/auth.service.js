import prisma from '../config/prisma.js'
import config from '../config/AppConfig.js'
import PasswordService from './password.service.js'
import TokenService from './token.service.js'
import { ApiError } from '../utils/ApiError.js'

class AuthService {
  async register({ fullName, phone, email, password }, req) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    })

    if (existing) {
      throw ApiError.conflict('Email yoki telefon allaqachon band')
    }

    const passwordHash = await PasswordService.hash(password)

    const user = await prisma.user.create({
      data: { fullName, phone, email, passwordHash },
    })

    const refreshToken = await this.createSession({ userId: user.id }, req)

    return { data: this.buildUserResponse(user), refreshToken }
  }

  async login({ email, password }, req) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !(await PasswordService.compare(password, user.passwordHash))) {
      throw ApiError.unauthorized('Email yoki parol noto\'g\'ri')
    }

    const refreshToken = await this.createSession({ userId: user.id }, req)

    return { data: this.buildUserResponse(user), refreshToken }
  }

  async adminLogin({ email, password }, req) {
    const admin = await prisma.admin.findUnique({ where: { email } })

    if (!admin || !(await PasswordService.compare(password, admin.passwordHash))) {
      throw ApiError.unauthorized('Email yoki parol noto\'g\'ri')
    }

    const refreshToken = await this.createSession({ adminId: admin.id }, req)

    return { data: this.buildAdminResponse(admin), refreshToken }
  }

  async refresh(refreshToken, req) {
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token topilmadi')
    }

    const session = await prisma.session.findUnique({
      where: { refreshToken },
    })

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw ApiError.unauthorized('Sessiya yaroqsiz yoki muddati tugagan')
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    })

    const newRefreshToken = await this.createSession(
      { userId: session.userId, adminId: session.adminId },
      req,
    )

    const accessToken = this.signAccessForSession(session)

    return { accessToken, refreshToken: newRefreshToken }
  }

  async logout(refreshToken) {
    if (refreshToken) {
      await prisma.session.updateMany({
        where: { refreshToken },
        data: { revokedAt: new Date() },
      })
    }
  }

  async getMe(req) {
    if (req.user) {
      return { type: 'user', data: this.buildUserResponse(req.user) }
    }
    if (req.admin) {
      return { type: 'admin', data: this.buildAdminResponse(req.admin) }
    }
    throw ApiError.unauthorized()
  }

  async createSession({ userId = null, adminId = null }, req) {
    const refreshToken = TokenService.generateRefreshToken()
    const now = Date.now()
    const expiresMs =
      (parseInt(config.jwtRefreshExpires, 10) || 7) * 24 * 60 * 60 * 1000

    await prisma.session.create({
      data: {
        userId,
        adminId,
        refreshToken,
        userAgent: req.headers['user-agent'] || null,
        ip: req.ip || null,
        expiresAt: new Date(now + expiresMs),
      },
    })

    return refreshToken
  }

  signAccessForSession(session) {
    if (session.adminId) {
      return TokenService.signAccessToken({
        id: session.adminId,
        type: 'admin',
      })
    }
    return TokenService.signAccessToken({
      id: session.userId,
      type: 'user',
    })
  }

  buildUserResponse(user) {
    const { passwordHash, ...rest } = user
    return rest
  }

  buildAdminResponse(admin) {
    const { passwordHash, ...rest } = admin
    return rest
  }
}

export default new AuthService()
