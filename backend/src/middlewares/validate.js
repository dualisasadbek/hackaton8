import { ApiError } from '../utils/ApiError.js'

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const data = req[source]

  if (!data) {
    throw ApiError.badRequest('Ma\'lumot topilmadi')
  }

  const result = schema.safeParse(data)
  if (!result.success) {
    const details = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    throw ApiError.badRequest('Validatsiya xatosi', details)
  }

  if (source === 'body') req.body = result.data
  else if (source === 'params') req.params = result.data
  else if (source === 'query') req.query = result.data

  next()
}
