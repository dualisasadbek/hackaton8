import { Prisma } from '@prisma/client'
import { ApiError } from '../utils/ApiError.js'

export const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route topilmadi: ${req.method} ${req.originalUrl}`))
}

export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Takrorlangan ma\'lumot: bu qiymat allaqachon band',
      })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Topilmadi' })
    }
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    })
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `Rasm yuklash xatosi: ${err.message}`,
    })
  }

  console.error('[Error]', err)

  return res.status(500).json({
    success: false,
    message: 'Server xatosi yuz berdi',
  })
}
