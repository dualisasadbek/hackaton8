import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('admin1234', 12)

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@sosmap.uz' },
    update: {},
    create: {
      fullName: 'Super Admin',
      email: 'admin@sosmap.uz',
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  })

  await prisma.setting.upsert({
    where: { key: 'autoDispatchMs' },
    update: { value: '120000' },
    create: { key: 'autoDispatchMs', value: '120000' },
  })

  console.log('Seed yakunlandi. Admin:', admin.email, '/ admin1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
