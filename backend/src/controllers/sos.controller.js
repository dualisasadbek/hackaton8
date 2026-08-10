import SosService from '../services/sos.service.js'
import { catchAsync } from '../utils/catchAsync.js'

class SosController {
  create = catchAsync(async (req, res) => {
    const sos = await SosService.create({
      userId: req.user.id,
      data: req.body,
      photos: req.files || [],
    })

    res.status(201).json({
      success: true,
      message: 'SOS qabul qilindi, AI vaziyatni baholamoqda',
      data: sos,
    })
  })

  list = catchAsync(async (req, res) => {
    const result = await SosService.list(req.query)

    res.status(200).json({ success: true, ...result })
  })

  getById = catchAsync(async (req, res) => {
    const sos = await SosService.getById(req.params.id)

    res.status(200).json({ success: true, data: sos })
  })

  updateStatus = catchAsync(async (req, res) => {
    const sos = await SosService.updateStatus(req.params.id, req.body.status)

    res.status(200).json({ success: true, message: 'Status yangilandi', data: sos })
  })

  assign = catchAsync(async (req, res) => {
    const assignment = await SosService.assign(req.params.id, req.admin.id, req.body)

    res.status(201).json({
      success: true,
      message: 'Yordam yuborildi',
      data: assignment,
    })
  })

  analyze = catchAsync(async (req, res) => {
    const sos = await SosService.analyze(req.params.id)

    res.status(200).json({
      success: true,
      message: 'AI analiz yakunlandi',
      data: {
        severity: sos.severity,
        aiScore: sos.aiScore,
        aiSummary: sos.aiSummary,
      },
    })
  })

  remove = catchAsync(async (req, res) => {
    await SosService.remove(req.params.id)

    res.status(200).json({ success: true, message: 'SOS o\'chirildi' })
  })
}

export default new SosController()
