import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import config from '../config/AppConfig.js'

class TokenService {
  constructor() {
    this.accessSecret = config.jwtAccessSecret
    this.refreshSecret = config.jwtRefreshSecret
    this.accessExpires = config.jwtAccessExpires
    this.refreshExpires = config.jwtRefreshExpires
  }

  signAccessToken(payload) {
    return jwt.sign(payload, this.accessSecret, { expiresIn: this.accessExpires })
  }

  verifyAccessToken(token) {
    return jwt.verify(token, this.accessSecret)
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, this.refreshSecret)
  }

  generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex')
  }

  cookieOptions() {
    return {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: 'lax',
      path: '/',
    }
  }

  setAuthCookies(res, accessToken, refreshToken) {
    const base = this.cookieOptions()

    res.cookie('accessToken', accessToken, {
      ...base,
      maxAge: 15 * 60 * 1000,
    })

    res.cookie('refreshToken', refreshToken, {
      ...base,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
  }

  clearAuthCookies(res) {
    res.clearCookie('accessToken', this.cookieOptions())
    res.clearCookie('refreshToken', this.cookieOptions())
  }
}

export default new TokenService()
