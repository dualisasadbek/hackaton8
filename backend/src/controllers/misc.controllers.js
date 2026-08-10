import { catchAsync } from '../utils/catchAsync.js'
import MessageService from '../services/message.service.js'
import AssignmentService from '../services/assignment.service.js'
import StatsService from '../services/stats.service.js'
import prisma from '../config/prisma.js'

class MessageControllerClass {
  create = catchAsync(async (req, res) => {
    const message = await MessageService.create(req.body)

    res.status(201).json({
      success: true,
      message: 'Xabar qabul qilindi',
      data: message,
    })
  })

  list = catchAsync(async (req, res) => {
    const result = await MessageService.list(req.query)

    res.status(200).json({ success: true, ...result })
  })

  markRead = catchAsync(async (req, res) => {
    const message = await MessageService.markRead(req.params.id, req.body.isRead)

    res.status(200).json({ success: true, data: message })
  })
}

class AssignmentControllerClass {
  list = catchAsync(async (req, res) => {
    const result = await AssignmentService.list(req.query)

    res.status(200).json({ success: true, ...result })
  })

  getById = catchAsync(async (req, res) => {
    const assignment = await AssignmentService.getById(req.params.id)

    res.status(200).json({ success: true, data: assignment })
  })
}

class StatsControllerClass {
  dashboard = catchAsync(async (_req, res) => {
    const data = await StatsService.getDashboard()

    res.status(200).json({ success: true, data })
  })
}

class AiLogControllerClass {
  list = catchAsync(async (req, res) => {
    const { page = 1, limit = 20, sosRequestId } = req.query
    const where = {}
    if (sosRequestId) where.sosRequestId = sosRequestId

    const [items, total] = await prisma.$transaction([
      prisma.aiLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        take: parseInt(limit, 10),
        include: {
          sosRequest: {
            select: { id: true, category: true, severity: true, description: true },
          },
        },
      }),
      prisma.aiLog.count({ where }),
    ])

    res.status(200).json({ success: true, items, total, page, limit })
  })
}

export const MessageController = new MessageControllerClass()
export const AssignmentController = new AssignmentControllerClass()
export const StatsController = new StatsControllerClass()
export const AiLogController = new AiLogControllerClass()
