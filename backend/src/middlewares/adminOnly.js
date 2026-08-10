import { ApiError } from '../utils/ApiError.js'

export const adminOnly = (req, _res, next) => {
  if (!req.admin) {
    throw ApiError.forbidden('Faqat adminlar uchun')
  }
  next()
}
