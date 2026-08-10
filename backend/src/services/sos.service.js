import prisma from '../config/prisma.js'
import AiService from '../services/ai.service.js'
import { ApiError } from '../utils/ApiError.js'

class SosService {
  async create({ userId, data, photos }) {
    const sos = await prisma.sosRequest.create({
      data: {
        userId,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address || null,
        description: data.description,
        category: data.category,
        photos: photos.map((f) => `/uploads/${f.filename}`),
        status: 'ANALYZING',
      },
    })

    await this.analyzeAndUpdate(sos.id)

    return prisma.sosRequest.findUnique({
      where: { id: sos.id },
      include: {
        assignments: true,
        aiLogs: { orderBy: { createdAt: 'desc' } },
      },
    })
  }

  async list({ status, category, severity, search, page, limit }) {
    const where = {}

    if (status) where.status = status
    if (category) where.category = category
    if (severity) where.severity = severity
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await prisma.$transaction([
      prisma.sosRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, fullName: true, phone: true } },
          assignments: true,
          _count: { select: { aiLogs: true } },
        },
      }),
      prisma.sosRequest.count({ where }),
    ])

    return { items, total, page, limit }
  }

  async getById(id) {
    const sos = await prisma.sosRequest.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, phone: true, email: true } },
        assignments: { include: { admin: { select: { id: true, fullName: true, email: true } } } },
        aiLogs: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!sos) throw ApiError.notFound('SOS topilmadi')

    return sos
  }

  async updateStatus(id, status) {
    const sos = await prisma.sosRequest.findUnique({ where: { id } })
    if (!sos) throw ApiError.notFound('SOS topilmadi')

    return prisma.sosRequest.update({
      where: { id },
      data: { status },
    })
  }

  async assign(id, adminId, { action, note }) {
    const sos = await prisma.sosRequest.findUnique({ where: { id } })
    if (!sos) throw ApiError.notFound('SOS topilmadi')
    if (sos.status === 'RESOLVED' || sos.status === 'CANCELLED') {
      throw ApiError.badRequest('Hal bo\'lgan SOS ga yordam yuborib bo\'lmaydi')
    }

    return prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.create({
        data: {
          sosRequestId: id,
          adminId,
          action,
          note: note || null,
        },
      })

      await tx.sosRequest.update({
        where: { id },
        data: { status: 'PROCESSING' },
      })

      return assignment
    })
  }

  async analyze(id) {
    return this.analyzeAndUpdate(id)
  }

  async remove(id) {
    const sos = await prisma.sosRequest.findUnique({ where: { id } })
    if (!sos) throw ApiError.notFound('SOS topilmadi')

    await prisma.sosRequest.delete({ where: { id } })
  }

  async analyzeAndUpdate(id) {
    const sos = await prisma.sosRequest.findUnique({ where: { id } })
    if (!sos) return null

    let analysis
    if (sos.photos.length > 0) {
      analysis = await AiService.analyzeImage(sos.photos[0], sos.description)
    } else {
      analysis = await AiService.analyzeSos(sos)
    }

    const updated = await prisma.sosRequest.update({
      where: { id },
      data: {
        severity: analysis.severity,
        aiScore: analysis.score,
        aiSummary: analysis.summary,
        status: 'NEW',
      },
    })

    await prisma.aiLog.create({
      data: {
        sosRequestId: id,
        action: 'SEVERITY_CHECK',
        severityScore: analysis.score,
        details: {
          summary: analysis.summary,
          recommendedAction: analysis.recommendedAction,
          analyzedAt: new Date().toISOString(),
        },
      },
    })

    return updated
  }
}

export default new SosService()
