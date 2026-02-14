const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function createTestPassengers() {
  console.log('開始建立測試乘客資料...')

  const testPassengers = [
    { phone: '0912345678' },
    { phone: '0923456789' },
    { phone: '0934567890' },
    { phone: '0945678901' },
    { phone: '0956789012' }
  ]

  for (const passenger of testPassengers) {
    await prisma.passenger.upsert({
      where: { phone: passenger.phone },
      update: {},
      create: passenger
    })
    console.log(`✅ 建立乘客：${passenger.phone}`)
  }

  console.log('🎉 測試乘客資料建立完成！')
}

createTestPassengers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())