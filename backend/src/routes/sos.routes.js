import { Router } from 'express'
import SosController from '../controllers/sos.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { adminOnly } from '../middlewares/adminOnly.js'
import { validate } from '../middlewares/validate.js'
import {
  assignSchema,
  createSosSchema,
  idParamSchema,
  paginationQuery,
  updateSosStatusSchema,
} from '../validations/schemas.js'
import uploadPhotos from '../services/upload.service.js'

const router = Router()

/**
 * @swagger
 * /api/sos:
 *   post:
 *     tags: [SOS]
 *     summary: Yangi SOS chaqiruv (AI avtomatik baholaydi)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [latitude, longitude, description]
 *             properties:
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               address: { type: string }
 *               description: { type: string }
 *               category:
 *                 type: string
 *                 enum: [MEDICAL, FIRE, ACCIDENT, CRIME, OTHER]
 *               photos:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: SOS yaratildi va AI analiz qildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/SosRequest' }
 */
router.post(
  '/',
  authenticate,
  (req, res, next) => {
    uploadPhotos(req, res, (err) => {
      if (err) return next(err)
      next()
    })
  },
  validate(createSosSchema),
  SosController.create,
)

/**
 * @swagger
 * /api/sos:
 *   get:
 *     tags: [SOS]
 *     summary: Barcha SOS (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema: { type: string, enum: [NEW, ANALYZING, PROCESSING, RESOLVED, AUTO_DISPATCHED, CANCELLED] }
 *       - name: category
 *         in: query
 *         schema: { type: string, enum: [MEDICAL, FIRE, ACCIDENT, CRIME, OTHER] }
 *       - name: severity
 *         in: query
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *       - name: search
 *         in: query
 *         schema: { type: string }
 *       - name: page
 *         in: query
 *         schema: { type: integer, default: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Ro'yxat
 */
router.get('/', authenticate, adminOnly, validate(paginationQuery, 'query'), SosController.list)

/**
 * @swagger
 * /api/sos/{id}:
 *   get:
 *     tags: [SOS]
 *     summary: Bitta SOS tafsiloti
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: SOS + assignments + aiLogs
 *       404:
 *         description: Topilmadi
 */
router.get('/:id', authenticate, validate(idParamSchema, 'params'), SosController.getById)

/**
 * @swagger
 * /api/sos/{id}:
 *   patch:
 *     tags: [SOS]
 *     summary: Statusni o'zgartirish (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [NEW, PROCESSING, RESOLVED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status yangilandi
 */
router.patch(
  '/:id',
  authenticate,
  adminOnly,
  validate(idParamSchema, 'params'),
  validate(updateSosStatusSchema),
  SosController.updateStatus,
)

/**
 * @swagger
 * /api/sos/{id}/assign:
 *   post:
 *     tags: [SOS]
 *     summary: Yordam yuborish (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action: { type: string }
 *               note: { type: string }
 *     responses:
 *       201:
 *         description: Assignment yaratildi
 */
router.post(
  '/:id/assign',
  authenticate,
  adminOnly,
  validate(idParamSchema, 'params'),
  validate(assignSchema),
  SosController.assign,
)

/**
 * @swagger
 * /api/sos/{id}/analyze:
 *   post:
 *     tags: [SOS]
 *     summary: AI bilan qayta analiz (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Analiz natijasi
 */
router.post(
  '/:id/analyze',
  authenticate,
  adminOnly,
  validate(idParamSchema, 'params'),
  SosController.analyze,
)

/**
 * @swagger
 * /api/sos/{id}:
 *   delete:
 *     tags: [SOS]
 *     summary: SOS o'chirish (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: O'chirildi
 */
router.delete(
  '/:id',
  authenticate,
  adminOnly,
  validate(idParamSchema, 'params'),
  SosController.remove,
)

export default router
