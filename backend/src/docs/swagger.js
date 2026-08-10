import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SOS Map API',
      version: '1.0.0',
      description:
        'Favqulodda yordam platformasi — SOS chaqiruvlar, AI analiz, admin panel API. ' +
        'Access token `Authorization: Bearer <token>` bilan, refresh token httpOnly cookie orqali.',
    },
    servers: [{ url: 'http://localhost:5000', description: 'Lokal server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fullName: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            avatarUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Admin: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['ADMIN', 'SUPER_ADMIN'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        SosRequest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            address: { type: 'string', nullable: true },
            description: { type: 'string' },
            category: { type: 'string', enum: ['MEDICAL', 'FIRE', 'ACCIDENT', 'CRIME', 'OTHER'] },
            severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
            status: {
              type: 'string',
              enum: ['NEW', 'ANALYZING', 'PROCESSING', 'RESOLVED', 'AUTO_DISPATCHED', 'CANCELLED'],
            },
            aiScore: { type: 'integer', nullable: true },
            aiSummary: { type: 'string', nullable: true },
            photos: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Assignment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            sosRequestId: { type: 'string', format: 'uuid' },
            adminId: { type: 'string', format: 'uuid' },
            action: { type: 'string' },
            note: { type: 'string', nullable: true },
            dispatchedAt: { type: 'string', format: 'date-time' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string', nullable: true },
            subject: { type: 'string' },
            text: { type: 'string' },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AiLog: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            sosRequestId: { type: 'string', format: 'uuid' },
            action: { type: 'string', enum: ['SEVERITY_CHECK', 'AUTO_DISPATCH', 'IMAGE_ANALYSIS', 'SUMMARY'] },
            severityScore: { type: 'integer', nullable: true },
            details: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Kirish va ro\'yxatdan o\'tish' },
      { name: 'SOS', description: 'SOS chaqiruvlar va AI analiz' },
      { name: 'Messages', description: 'Contact xabarlari' },
      { name: 'Assignments', description: 'Yordam yuborishlar' },
      { name: 'Stats', description: 'Admin dashboard statistikasi' },
      { name: 'AI Logs', description: 'AI harakatlari kundaligi' },
    ],
  },
  apis: ['src/routes/*.js', 'src/controllers/*.js'],
}

export default swaggerJsdoc(options)
