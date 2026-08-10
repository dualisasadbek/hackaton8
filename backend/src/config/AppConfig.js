import dotenv from 'dotenv'

dotenv.config()

class AppConfig {
  constructor() {
    this.port = parseInt(process.env.PORT || '5000', 10)
    this.nodeEnv = process.env.NODE_ENV || 'development'
    this.isProduction = this.nodeEnv === 'production'
    this.databaseUrl = process.env.DATABASE_URL
    this.jwtAccessSecret = process.env.JWT_ACCESS_SECRET || 'access_secret'
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret'
    this.jwtAccessExpires = process.env.JWT_ACCESS_EXPIRES || '15m'
    this.jwtRefreshExpires = process.env.JWT_REFRESH_EXPIRES || '7d'
    this.clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    this.cookieSecure = process.env.COOKIE_SECURE === 'true'
    this.groqApiKey = process.env.GROQ_API_KEY || ''
    this.groqBaseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1'
    this.groqTextModel = process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile'
    this.groqVisionModel = process.env.GROQ_VISION_MODEL || 'llama-3.2-11b-vision-preview'
    this.autoDispatchMs = parseInt(process.env.AUTO_DISPATCH_MS || '120000', 10)
  }
}

export default new AppConfig()
