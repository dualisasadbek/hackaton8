import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import swaggerUi from 'swagger-ui-express'
import config from './config/AppConfig.js'
import routes from './routes/index.js'
import swaggerSpec from './docs/swagger.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class App {
  constructor() {
    this.express = express()
    this.setupMiddlewares()
    this.setupRoutes()
    this.setupErrorHandlers()
  }

  setupMiddlewares() {
    this.express.use(
      cors({
        origin: config.clientUrl,
        credentials: true,
      }),
    )
    this.express.use(express.json({ limit: '2mb' }))
    this.express.use(express.urlencoded({ extended: true }))
    this.express.use(cookieParser())

    const uploadsPath = path.resolve(__dirname, '../uploads')
    this.express.use('/uploads', express.static(uploadsPath))
  }

  setupRoutes() {
    this.express.get('/', (_req, res) => {
      res.json({
        name: 'SOS Map API',
        status: 'ishlamoqda',
        docs: '/api-docs',
      })
    })

    this.express.use(
      '/api-docs',
      swaggerUi.serveFiles(swaggerSpec, {
        customSiteTitle: 'SOS Map API',
        swaggerOptions: { persistAuthorization: true },
      }),
      swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'SOS Map API',
      }),
    )

    this.express.use('/api', routes)
  }

  setupErrorHandlers() {
    this.express.use(notFoundHandler)
    this.express.use(errorHandler)
  }
}

export default App
