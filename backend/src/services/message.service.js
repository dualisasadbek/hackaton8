import prisma from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'

class MessageService {
  async create(data) {
    return prisma.message.create({ data })
  }

  async list({ isRead, page, limit }) {
    const where = {}
    if (isRead === 'true') where.isRead = true
    if (isRead === 'false') where.isRead = false

    const [items, total] = await prisma.$transaction([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.message.count({ where }),
    ])

    return { items, total, page, limit }
  }

  async markRead(id, isRead) {
    const message = await prisma.message.findUnique({ where: { id } })
    if (!message) throw ApiError.notFound('Xabar topilmadi')

    return prisma.message.update({ where: { id }, data: { isRead } })
  }
}

export default new MessageService()
