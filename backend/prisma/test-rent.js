const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function createTestRentPayments() {
  console.log('開始建立測試租金繳費記錄...')

  // 取得所有車隊
  const fleets = await prisma.fleet.findMany()

  if (fleets.length === 0) {
    console.log('沒有車隊資料，請先執行 prisma/test-data.js')
    return
  }

  // 為每個車隊建立幾個月的繳費記錄
  const months = ['2026-01', '2026-02']
  
  for (const fleet of fleets) {
    for (const month of months) {
      // 隨機決定狀態
      const status = Math.random() > 0.5 ? 'pending' : 'confirmed'
      
      await prisma.rentPayment.upsert({
        where: {
          fleetId_month: {
            fleetId: fleet.id,
            month
          }
        },
        update: {},
        create: {
          fleetId: fleet.id,
          month,
          amount: 5000,
          proofUrl: 'https://example.com/proof.jpg',
          status,
          ...(status === 'confirmed' && {
            confirmedBy: 'cm7j5k...', // 需要替換成真實的超級管理員ID
            confirmedAt: new Date()
          })
        }
      })
      
      console.log(`✅ 建立 ${fleet.fleetName} ${month} 繳費記錄 (${status})`)
    }
  }

  console.log('🎉 測試租金繳費記錄建立完成！')
}

createTestRentPayments()
  .catch(console.error)
  .finally(() => prisma.$disconnect())