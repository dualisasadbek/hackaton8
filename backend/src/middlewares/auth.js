import TokenService from '../services/token.service.js'
import prisma from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { catchAsync } from '../utils/catchAsync.js'

export const authenticate = catchAsync(async (req, _res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    throw ApiError.unauthorized('Access token talab qilinadi')
  }

  let payload
  try {
    payload = TokenService.verifyAccessToken(token)
  } catch {
    throw ApiError.unauthorized('Access token yaroqsiz yoki muddati tugagan')
  }

  if (payload.type === 'admin') {
    const admin = await prisma.admin.findUnique({ where: { id: payload.id } })
    if (!admin) throw ApiError.unauthorized()
    req.admin = admin
  } else {
    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    if (!user) throw ApiError.unauthorized()
    req.user = user
  }

  next()
})
