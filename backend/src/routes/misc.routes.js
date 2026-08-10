import { Router } from 'express'
import {
  MessageController,
  AssignmentController,
  StatsController,
  AiLogController,
} from '../controllers/misc.controllers.js'
import { authenticate } from '../middlewares/auth.js'
import { adminOnly } from '../middlewares/adminOnly.js'
import { validate } from '../middlewares/validate.js'
import {
  createMessageSchema,
  idParamSchema,
  paginationQuery,
  updateMessageSchema,
} from '../validations/schemas.js'

const router = Router()

/**
 * @swagger
 * /api/messages:
 *   post:
 *     tags: [Messages]
 *     summary: Contact sahifasidan xabar (ochiq)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, subject, text]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               subject: { type: string }
 *               text: { type: string }
 *     responses:
 *       201:
 *         description: Xabar qabul qilindi
 */
router.post('/messages', validate(createMessageSchema), MessageController.create)

/**
 * @swagger
 * /api/messages:
 *   get:
 *     tags: [Messages]
 *     summary: Xabarlar ro'yxati (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: isRead
 *         in: query
 *         schema: { type: string, enum: [true, false] }
 *       - name: page
 *         in: query
 *         schema: { type: integer }
 *       - name: limit
 *         in: query
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ro'yxat
 */
router.get(
  '/messages',
  authenticate,
  adminOnly,
  validate(paginationQuery, 'query'),
  MessageController.list,
)

/**
 * @swagger
 * /api/messages/{id}:
 *   patch:
 *     tags: [Messages]
 *     summary: O'qilgan deb belgilash (admin)
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
 *               isRead: { type: boolean }
 *     responses:
 *       200:
 *         description: Yangilandi
 */
router.patch(
  '/messages/:id',
  authenticate,
  adminOnly,
  validate(idParamSchema, 'params'),
  validate(updateMessageSchema),
  MessageController.markRead,
)

/**
 * @swagger
 * /api/assignments:
 *   get:
 *     tags: [Assignments]
 *     summary: Barcha yordam yuborishlar (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer }
 *       - name: limit
 *         in: query
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ro'yxat
 */
router.get(
  '/assignments',
  authenticate,
  adminOnly,
  validate(paginationQuery, 'query'),
  AssignmentController.list,
)

/**
 * @swagger
 * /api/assignments/{id}:
 *   get:
 *     tags: [Assignments]
 *     summary: Bitta assignment (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Assignment
 */
router.get(
  '/assignments/:id',
  authenticate,
  adminOnly,
  validate(idParamSchema, 'params'),
  AssignmentController.getById,
)

/**
 * @swagger
 * /api/stats:
 *   get:
 *     tags: [Stats]
 *     summary: Admin dashboard statistikasi
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistika
 */
router.get('/stats', authenticate, adminOnly, StatsController.dashboard)

/**
 * @swagger
 * /api/ai-logs:
 *   get:
 *     tags: [AI Logs]
 *     summary: AI kundaliklari (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sosRequestId
 *         in: query
 *         schema: { type: string, format: uuid }
 *       - name: page
 *         in: query
 *         schema: { type: integer }
 *       - name: limit
 *         in: query
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ro'yxat
 */
router.get(
  '/ai-logs',
  authenticate,
  adminOnly,
  validate(paginationQuery, 'query'),
  AiLogController.list,
)

export default router
