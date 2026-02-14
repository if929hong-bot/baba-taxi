const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const bcrypt = require('bcryptjs')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function createTestDrivers() {
  console.log('開始建立測試司機資料...')

  // 取得所有車隊
  const fleets = await prisma.fleet.findMany()

  if (fleets.length === 0) {
    console.log('沒有車隊資料，請先執行 prisma/test-data.js')
    return
  }

  const testDrivers = [
    {
      name: '張三',
      phone: '0911111111',
      licensePlate: 'ABC-1234',
      carBrand: 'Toyota',
      carModel: 'Altis',
      carYear: 2022,
      carColor: '白色'
    },
    {
      name: '李四',
      phone: '0922222222',
      licensePlate: 'DEF-5678',
      carBrand: 'Honda',
      carModel: 'CR-V',
      carYear: 2023,
      carColor: '黑色'
    },
    {
      name: '王五',
      phone: '0933333333',
      licensePlate: 'GHI-9012',
      carBrand: 'Nissan',
      carModel: 'Kicks',
      carYear: 2021,
      carColor: '銀色'
    },
    {
      name: '趙六',
      phone: '0944444444',
      licensePlate: 'JKL-3456',
      carBrand: 'Mazda',
      carModel: '3',
      carYear: 2022,
      carColor: '紅色'
    },
    {
      name: '陳七',
      phone: '0955555555',
      licensePlate: 'MNO-7890',
      carBrand: 'Ford',
      carModel: 'Focus',
      carYear: 2023,
      carColor: '藍色'
    }
  ]

  for (let i = 0; i < testDrivers.length; i++) {
    const driver = testDrivers[i]
    const fleet = fleets[i % fleets.length] // 輪流分配給不同車隊
    
    // 隨機決定狀態
    const status = ['active', 'inactive', 'pending', 'blocked'][Math.floor(Math.random() * 4)]
    const onlineStatus = status === 'active' ? (Math.random() > 0.5 ? 'online' : 'offline') : 'offline'

    await prisma.driver.upsert({
      where: { phone: driver.phone },
      update: {},
      create: {
        driverCode: `${fleet.fleetCode}-D${String(i + 1).padStart(3, '0')}`,
        fleetId: fleet.id,
        name: driver.name,
        phone: driver.phone,
        password: await bcrypt.hash('test123', 10),
        licensePlate: driver.licensePlate,
        carBrand: driver.carBrand,
        carModel: driver.carModel,
        carYear: driver.carYear,
        carColor: driver.carColor,
        hasInsurance: true,
        experience: '5年經驗，待過大安車隊',
        currentJob: '全職司機',
        selfScore: 8,
        criminalRecord: '無',
        driverLicenseUrl: 'https://example.com/license.jpg',
        carPhotosUrls: JSON.stringify(['https://example.com/car1.jpg', 'https://example.com/car2.jpg']),
        status,
        onlineStatus,
        rating: 4.5 + Math.random() * 0.5,
        totalTrips: Math.floor(Math.random() * 200),
        totalIncome: Math.floor(Math.random() * 50000)
      }
    })
    
    console.log(`✅ 建立司機：${driver.name} (${driver.phone}) - 狀態：${status}`)
  }

  console.log('🎉 測試司機資料建立完成！')
}

createTestDrivers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())