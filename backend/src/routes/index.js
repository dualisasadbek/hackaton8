import { Router } from 'express'
import authRoutes from './auth.routes.js'
import sosRoutes from './sos.routes.js'
import miscRoutes from './misc.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/sos', sosRoutes)
router.use('/', miscRoutes)

export default router
