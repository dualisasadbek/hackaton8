import config from './config/AppConfig.js'
import prisma from './config/prisma.js'
import App from './app.js'
import AutoDispatchService from './services/autoDispatch.service.js'

class Server {
  constructor() {
    this.app = new App().express
  }

  async start() {
    await prisma.$connect()
    console.log('✅ PostgreSQL ulandi')

    AutoDispatchService.start()

    this.app.listen(config.port, () => {
      console.log(`🚀 SOS Map API http://localhost:${config.port} da ishlamoqda`)
      console.log(`📚 Swagger: http://localhost:${config.port}/api-docs`)
    })
  }
}

async function bootstrap() {
  const server = new Server()
  await server.start()

  const shutdown = async () => {
    console.log('\n⏹ Server yopilyapti...')
    AutoDispatchService.stop()
    await prisma.$disconnect()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

bootstrap().catch((err) => {
  console.error('Server ishga tushmadi:', err)
  process.exit(1)
})
