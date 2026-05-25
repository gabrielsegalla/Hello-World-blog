const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "coverImage" TEXT'
    )
    console.log('✅ Coluna coverImage garantida no banco')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(err => {
  console.error('❌ ensure-schema:', err)
  process.exit(1)
})
