import prisma from '../config/prisma.js'
import config from '../config/AppConfig.js'
import AiService from './ai.service.js'

class AutoDispatchService {
  constructor() {
    this.timer = null
    this.intervalMs = 30000
  }

  start() {
    this.stop()
    this.timer = setInterval(() => {
      this.check().catch((err) => {
        console.error('AutoDispatch xatosi:', err.message)
      })
    }, this.intervalMs)
    console.log(`[AutoDispatch] Ishga tushdi (har ${this.intervalMs / 1000}s)`)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  async check() {
    const setting = await prisma.setting.findUnique({
      where: { key: 'autoDispatchMs' },
    })

    const autoDispatchMs = setting ? parseInt(setting.value, 10) : config.autoDispatchMs
    const threshold = new Date(Date.now() - autoDispatchMs)

    const staleSos = await prisma.sosRequest.findMany({
      where: {
        status: 'NEW',
        createdAt: { lte: threshold },
      },
      take: 20,
    })

    for (const sos of staleSos) {
      await this.dispatch(sos)
    }
  }

  async dispatch(sos) {
    const action = await AiService.autoDispatchText(sos)

    await prisma.$transaction(async (tx) => {
      await tx.sosRequest.update({
        where: { id: sos.id },
        data: { status: 'AUTO_DISPATCHED' },
      })

      await tx.aiLog.create({
        data: {
          sosRequestId: sos.id,
          action: 'AUTO_DISPATCH',
          severityScore: sos.aiScore,
          details: { dispatchedAt: new Date().toISOString(), action },
        },
      })
    })

    console.log(`[AutoDispatch] SOS ${sos.id} uchun yordam yuborildi: ${action}`)
  }
}

export default new AutoDispatchService()
