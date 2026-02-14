const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const bcrypt = require('bcryptjs')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function createTestDriverApplications() {
  console.log('開始建立測試司機申請資料...')

  // 取得所有車隊
  const fleets = await prisma.fleet.findMany()

  if (fleets.length === 0) {
    console.log('沒有車隊資料，請先建立車隊')
    return
  }

  const testApplications = [
    {
      name: '張三',
      phone: '0911111111',
      email: 'zhang.san@test.com',
      licensePlate: 'ABC-1234',
      carBrand: 'Toyota',
      carModel: 'Altis',
      carYear: 2022,
      carColor: '白色',
      hasInsurance: true,
      experience: '3年經驗，待過大安車隊',
      currentJob: '全職司機',
      selfScore: 8,
      criminalRecord: '無',
      driverLicenseUrl: 'https://example.com/license1.jpg',
      carPhotosUrls: ['https://example.com/car1-1.jpg', 'https://example.com/car1-2.jpg'],
      policeCertificateUrl: 'https://example.com/police1.pdf'
    },
    {
      name: '李四',
      phone: '0922222222',
      email: 'li.si@test.com',
      licensePlate: 'DEF-5678',
      carBrand: 'Honda',
      carModel: 'CR-V',
      carYear: 2023,
      carColor: '黑色',
      hasInsurance: true,
      experience: '5年經驗，待過松山車隊',
      currentJob: '全職司機',
      selfScore: 9,
      criminalRecord: '無',
      driverLicenseUrl: 'https://example.com/license2.jpg',
      carPhotosUrls: ['https://example.com/car2-1.jpg', 'https://example.com/car2-2.jpg'],
      policeCertificateUrl: 'https://example.com/police2.pdf'
    },
    {
      name: '王五',
      phone: '0933333333',
      email: 'wang.wu@test.com',
      licensePlate: 'GHI-9012',
      carBrand: 'Nissan',
      carModel: 'Kicks',
      carYear: 2021,
      carColor: '銀色',
      hasInsurance: false,
      experience: '1年經驗',
      currentJob: '兼職司機',
      selfScore: 6,
      criminalRecord: '無',
      driverLicenseUrl: 'https://example.com/license3.jpg',
      carPhotosUrls: ['https://example.com/car3-1.jpg'],
      policeCertificateUrl: null
    }
  ]

  for (let i = 0; i < testApplications.length; i++) {
    const app = testApplications[i]
    const fleet = fleets[i % fleets.length] // 輪流分配給不同車隊

    // 產生司機編號
    const driverCode = `${fleet.fleetCode}-D${String(i + 1).padStart(3, '0')}`

    // 密碼加密
    const hashedPassword = await bcrypt.hash('test123', 10)

    await prisma.driver.upsert({
      where: { phone: app.phone },
      update: {},
      create: {
        driverCode,
        fleetId: fleet.id,
        name: app.name,
        phone: app.phone,
        email: app.email,
        password: hashedPassword,
        licensePlate: app.licensePlate,
        carBrand: app.carBrand,
        carModel: app.carModel,
        carYear: app.carYear,
        carColor: app.carColor,
        hasInsurance: app.hasInsurance,
        experience: app.experience,
        currentJob: app.currentJob,
        selfScore: app.selfScore,
        criminalRecord: app.criminalRecord,
        driverLicenseUrl: app.driverLicenseUrl,
        carPhotosUrls: JSON.stringify(app.carPhotosUrls),
        policeCertificateUrl: app.policeCertificateUrl,
        status: 'pending'
      }
    })
    
    console.log(`✅ 建立司機申請：${app.name} (${app.phone}) - 車隊：${fleet.fleetName}`)
  }

  console.log('🎉 測試司機申請資料建立完成！')
}

createTestDriverApplications()
  .catch(console.error)
  .finally(() => prisma.$disconnect())