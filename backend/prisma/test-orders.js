const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function createTestOrders() {
  console.log('開始建立測試訂單資料...')

  // 取得所有車隊和司機
  const fleets = await prisma.fleet.findMany()
  const drivers = await prisma.driver.findMany()

  if (fleets.length === 0 || drivers.length === 0) {
    console.log('沒有車隊或司機資料，請先建立基礎資料')
    return
  }

  const now = new Date()
  const testOrders = []

  // 產生過去30天的訂單
  for (let i = 0; i < 50; i++) {
    const randomDays = Math.floor(Math.random() * 30)
    const randomHours = Math.floor(Math.random() * 24)
    const randomMinutes = Math.floor(Math.random() * 60)
    
    const orderDate = new Date(now)
    orderDate.setDate(orderDate.getDate() - randomDays)
    orderDate.setHours(randomHours, randomMinutes, 0)
    
    const completedDate = new Date(orderDate)
    completedDate.setMinutes(completedDate.getMinutes() + Math.floor(Math.random() * 30) + 10)

    const fare = Math.floor(Math.random() * 300) + 100
    const status = Math.random() > 0.1 ? 'completed' : 'cancelled'
    const paymentMethod = Math.random() > 0.5 ? 'cash' : 'street'
    
    const driver = drivers[Math.floor(Math.random() * drivers.length)]
    const fleet = fleets.find(f => f.id === driver.fleetId)

    // 產生訂單編號
    const orderNumber = `ORD-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`

    testOrders.push({
      orderNumber,
      fleetId: fleet.id,
      driverId: status === 'completed' ? driver.id : null,
      passengerPhone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      pickupAddress: `台北市${['大安區', '信義區', '松山區', '中山區'][Math.floor(Math.random() * 4)]}${['信義路', '忠孝東路', '南京東路'][Math.floor(Math.random() * 3)]}${Math.floor(Math.random() * 100) + 1}號`,
      dropoffAddress: `台北市${['大安區', '信義區', '松山區', '中山區'][Math.floor(Math.random() * 4)]}${['信義路', '忠孝東路', '南京東路'][Math.floor(Math.random() * 3)]}${Math.floor(Math.random() * 100) + 1}號`,
      estimatedFare: fare,
      actualFare: status === 'completed' ? fare : null,
      paymentMethod: status === 'completed' ? paymentMethod : null,
      status,
      requestedTime: orderDate,
      acceptedTime: orderDate,
      pickedUpTime: new Date(orderDate.getTime() + 2 * 60000),
      completedTime: status === 'completed' ? completedDate : null,
      distanceKm: Math.random() * 10 + 1,
      durationMin: Math.floor(Math.random() * 30) + 10
    })
  }

  // 建立訂單
  for (const order of testOrders) {
    await prisma.order.upsert({
      where: { orderNumber: order.orderNumber },
      update: {},
      create: order
    })
  }

  console.log(`✅ 建立 ${testOrders.length} 筆測試訂單`)

  // 更新司機統計資料
  console.log('更新司機統計資料...')
  
  const driversWithOrders = await prisma.driver.findMany({
    include: {
      orders: {
        where: { status: 'completed' }
      }
    }
  })

  for (const driver of driversWithOrders) {
    const completedOrders = driver.orders
    const totalTrips = completedOrders.length
    const totalIncome = completedOrders.reduce((sum, order) => sum + (order.actualFare || 0), 0)
    
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        totalTrips,
        totalIncome
      }
    })
  }

  console.log('🎉 測試訂單資料建立完成！')
}

createTestOrders()
  .catch(console.error)
  .finally(() => prisma.$disconnect())