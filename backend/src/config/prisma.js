import { PrismaClient } from '@prisma/client'

class PrismaManager {
  constructor() {
    this.client = new PrismaClient({
      log: [],
    })
  }
}

export default new PrismaManager().client
