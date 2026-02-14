const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const bcrypt = require('bcryptjs')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function createTestFleets() {
  console.log('開始建立測試車隊...')

  // 建立測試車隊
  const testFleets = [
    {
      fleetName: '大安車隊',
      managerName: '王小明',
      phone: '0912345678',
      email: 'daan@test.com',
      password: 'test123'
    },
    {
      fleetName: '松山車隊',
      managerName: '陳小華',
      phone: '0923456789',
      email: 'songshan@test.com',
      password: 'test123'
    },
    {
      fleetName: '信義車隊',
      managerName: '李小龍',
      phone: '0934567890',
      email: 'xinyi@test.com',
      password: 'test123'
    }
  ]

  for (const testFleet of testFleets) {
    // 先建立車隊
    const fleet = await prisma.fleet.create({
      data: {
        fleetCode: `F${Math.floor(Math.random() * 1000)}`,
        fleetName: testFleet.fleetName,
        status: 'pending'
      }
    })

    // 建立車隊管理員
    const hashedPassword = await bcrypt.hash(testFleet.password, 10)
    await prisma.fleetManager.create({
      data: {
        fleetId: fleet.id,
        name: testFleet.managerName,
        phone: testFleet.phone,
        email: testFleet.email,
        password: hashedPassword,
        status: 'pending'
      }
    })

    console.log(`✅ 建立車隊：${testFleet.fleetName}`)
  }

  console.log('🎉 測試車隊建立完成！')
}

createTestFleets()
  .catch(console.error)
  .finally(() => prisma.$disconnect())