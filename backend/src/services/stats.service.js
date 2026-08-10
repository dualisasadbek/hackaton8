import prisma from '../config/prisma.js'

class StatsService {
  async getDashboard() {
    const [totalSos, byStatus, byCategory, bySeverity, totalMessages, recentSos] =
      await prisma.$transaction([
        prisma.sosRequest.count(),
        prisma.sosRequest.groupBy({ by: ['status'], _count: { _all: true } }),
        prisma.sosRequest.groupBy({ by: ['category'], _count: { _all: true } }),
        prisma.sosRequest.groupBy({ by: ['severity'], _count: { _all: true } }),
        prisma.message.count(),
        prisma.sosRequest.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            category: true,
            severity: true,
            status: true,
            address: true,
            createdAt: true,
          },
        }),
      ])

    const resolved = await prisma.sosRequest.findMany({
      where: { status: 'RESOLVED' },
      select: { createdAt: true, updatedAt: true },
    })

    let avgResponseMinutes = 0
    if (resolved.length > 0) {
      const totalMinutes = resolved.reduce((sum, r) => {
        const diff = new Date(r.updatedAt) - new Date(r.createdAt)
        return sum + (diff > 0 ? diff / 60000 : 0)
      }, 0)
      avgResponseMinutes = Number((totalMinutes / resolved.length).toFixed(1))
    }

    const toObject = (arr, key) => {
      const obj = {}
      arr.forEach((item) => {
        obj[item[key]] = item._count._all
      })
      return obj
    }

    return {
      totalSos,
      byStatus: toObject(byStatus, 'status'),
      byCategory: toObject(byCategory, 'category'),
      bySeverity: toObject(bySeverity, 'severity'),
      totalMessages,
      recentSos,
      avgResponseMinutes,
    }
  }
}

export default new StatsService()
