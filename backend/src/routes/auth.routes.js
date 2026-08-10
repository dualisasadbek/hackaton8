import { Router } from 'express'
import AuthController from '../controllers/auth.controller.js'
import { validate } from '../middlewares/validate.js'
import { loginSchema, registerSchema } from '../validations/schemas.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Ro'yxatdan o'tish (access+refresh cookie)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, phone, email, password]
 *             properties:
 *               fullName: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Foydalanuvchi yaratildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/User' }
 *                 accessToken: { type: string }
 *       409:
 *         description: Email yoki telefon band
 */
router.post('/register', validate(registerSchema), AuthController.register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Foydalanuvchi kirishi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Muvaffaqiyatli kirish
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/User' }
 *                 accessToken: { type: string }
 *       401:
 *         description: Noto'g'ri email yoki parol
 */
router.post('/login', validate(loginSchema), AuthController.login)

/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     tags: [Auth]
 *     summary: Admin kirishi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Admin kirdi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Admin' }
 *                 accessToken: { type: string }
 *       401:
 *         description: Noto'g'ri ma'lumot
 */
router.post('/admin/login', validate(loginSchema), AuthController.adminLogin)

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh token rotatsiyasi (cookie orqali)
 *     responses:
 *       200:
 *         description: Yangi tokenlar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 accessToken: { type: string }
 *       401:
 *         description: Refresh token yaroqsiz
 */
router.post('/refresh', AuthController.refresh)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Chiqish (refresh tokenni revoke qiladi)
 *     responses:
 *       200:
 *         description: Chiqildi
 */
router.post('/logout', AuthController.logout)

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Joriy foydalanuvchi/admin ma'lumotlari
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Foydalanuvchi yoki admin
 *       401:
 *         description: Token yo'q yoki yaroqsiz
 */
router.get('/me', authenticate, AuthController.me)

export default router
