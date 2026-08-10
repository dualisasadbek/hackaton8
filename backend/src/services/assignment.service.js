import prisma from '../config/prisma.js'
import { ApiError } from '../utils/ApiError.js'

class AssignmentService {
  async list({ page, limit }) {
    const [items, total] = await prisma.$transaction([
      prisma.assignment.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          sosRequest: {
            select: { id: true, category: true, severity: true, address: true },
          },
          admin: { select: { id: true, fullName: true } },
        },
      }),
      prisma.assignment.count(),
    ])

    return { items, total, page, limit }
  }

  async getById(id) {
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        sosRequest: true,
        admin: { select: { id: true, fullName: true, email: true } },
      },
    })

    if (!assignment) throw ApiError.notFound('Assignment topilmadi')

    return assignment
  }
}

export default new AssignmentService()
