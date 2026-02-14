const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// 乘客叫車
const createBooking = async (req, res) => {
  try {
    const { fleetCode, pickupAddress, dropoffAddress, passengerPhone, note } = req.body

    // 驗證輸入
    if (!fleetCode || !pickupAddress || !passengerPhone) {
      return res.status(400).json({
        success: false,
        message: '請提供車隊編號、上車地點和聯絡電話'
      })
    }

    // 檢查車隊是否存在且啟用中
    const fleet = await prisma.fleet.findUnique({
      where: { fleetCode },
      include: { settings: true }
    })

    if (!fleet) {
      return res.status(404).json({
        success: false,
        message: '找不到該車隊'
      })
    }

    if (fleet.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: '該車隊目前無法提供服務'
      })
    }

    // 檢查是否有司機上線
    const onlineDrivers = await prisma.driver.count({
      where: {
        fleetId: fleet.id,
        onlineStatus: 'online',
        status: 'active'
      }
    })

    if (onlineDrivers === 0) {
      return res.status(400).json({
        success: false,
        message: '目前沒有司機在線，請稍後再試'
      })
    }

    // 產生訂單編號
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const orderNumber = `ORD-${year}${month}${day}-${random}`

    // 計算預估車資
    let estimatedFare = fleet.settings?.baseFare || 85
    // 這裡可以加入 Google Maps API 計算距離

    // 建立或更新乘客
    const passenger = await prisma.passenger.upsert({
      where: { phone: passengerPhone },
      update: {},
      create: { phone: passengerPhone }
    })

    // 建立訂單
    const order = await prisma.order.create({
      data: {
        orderNumber,
        fleetId: fleet.id,
        passengerId: passenger.id,
        passengerPhone,
        pickupAddress,
        dropoffAddress,
        estimatedFare,
        status: 'pending',
        requestedTime: new Date(),
        note
      }
    })

    // 獲取 WebSocket 實例並發送新訂單通知
    const io = req.app.get('io')
    io.to(`fleet:${fleet.id}`).emit('order:new', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      pickupAddress: order.pickupAddress,
      dropoffAddress: order.dropoffAddress,
      estimatedFare: order.estimatedFare,
      passengerPhone: order.passengerPhone,
      note: order.note
    })

    // 觸發司機配對（實際應用中會用 WebSocket 或背景工作）
    // 這裡簡化處理，直接找一個線上司機
    const availableDriver = await prisma.driver.findFirst({
      where: {
        fleetId: fleet.id,
        onlineStatus: 'online',
        status: 'active'
      }
    })

    let matchedDriver = null
    if (availableDriver) {
      // 自動配對司機
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          driverId: availableDriver.id,
          status: 'accepted',
          acceptedTime: new Date()
        },
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              phone: true,
              licensePlate: true,
              carBrand: true,
              carModel: true,
              carColor: true
            }
          }
        }
      })
      matchedDriver = updatedOrder.driver

      // 通知乘客訂單已被接受
      io.to(`passenger:${order.id}`).emit('order:accepted', {
        orderId: order.id,
        driver: {
          name: matchedDriver.name,
          phone: matchedDriver.phone,
          licensePlate: matchedDriver.licensePlate,
          carInfo: `${matchedDriver.carBrand} ${matchedDriver.carModel} (${matchedDriver.carColor})`
        }
      })
    }

    res.status(201).json({
      success: true,
      message: '叫車成功',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedFare: order.estimatedFare,
        driver: matchedDriver ? {
          name: matchedDriver.name,
          phone: matchedDriver.phone,
          licensePlate: matchedDriver.licensePlate,
          carInfo: `${matchedDriver.carBrand} ${matchedDriver.carModel} (${matchedDriver.carColor})`
        } : null
      }
    })

  } catch (error) {
    console.error('叫車錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 查詢訂單狀態
const getBookingStatus = async (req, res) => {
  try {
    const { orderId } = req.params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            licensePlate: true,
            carBrand: true,
            carModel: true,
            carColor: true,
            rating: true
          }
        },
        tracking: true
      }
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '找不到該訂單'
      })
    }

    // 計算等待時間
    let waitTime = null
    if (order.status === 'accepted' && order.acceptedTime) {
      const now = new Date()
      const waitMs = now - order.acceptedTime
      waitTime = Math.floor(waitMs / 60000) // 轉換為分鐘
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedFare: order.estimatedFare,
        actualFare: order.actualFare,
        pickupAddress: order.pickupAddress,
        dropoffAddress: order.dropoffAddress,
        requestedTime: order.requestedTime,
        acceptedTime: order.acceptedTime,
        completedTime: order.completedTime,
        waitTime,
        driver: order.driver ? {
          name: order.driver.name,
          phone: order.driver.phone,
          licensePlate: order.driver.licensePlate,
          carInfo: `${order.driver.carBrand} ${order.driver.carModel} (${order.driver.carColor})`,
          rating: order.driver.rating,
          currentLocation: order.tracking ? {
            latitude: order.tracking.driverLat,
            longitude: order.tracking.driverLng,
            updatedAt: order.tracking.updatedAt
          } : null
        } : null
      }
    })

  } catch (error) {
    console.error('查詢訂單狀態錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 取消叫車
const cancelBooking = async (req, res) => {
  try {
    const { orderId } = req.params

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '找不到該訂單'
      })
    }

    // 只能取消特定狀態的訂單
    if (!['pending', 'matching', 'accepted'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: '此訂單無法取消'
      })
    }

    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        cancelledTime: new Date()
      }
    })

    // 如果有司機接單，通知司機訂單已取消
    if (order.driverId) {
      const io = req.app.get('io')
      io.to(`driver:${order.driverId}`).emit('order:cancelled', {
        orderId: order.id,
        orderNumber: order.orderNumber
      })
    }

    res.json({
      success: true,
      message: '訂單已取消',
      data: {
        orderId: cancelledOrder.id,
        status: cancelledOrder.status
      }
    })

  } catch (error) {
    console.error('取消叫車錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 取得司機即時位置（用於追蹤）
const getDriverTracking = async (req, res) => {
  try {
    const { orderId } = req.params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            licensePlate: true,
            lastLatitude: true,
            lastLongitude: true,
            lastLocationUpdate: true
          }
        },
        tracking: true
      }
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '找不到該訂單'
      })
    }

    if (!order.driver) {
      return res.status(400).json({
        success: false,
        message: '尚無司機接單'
      })
    }

    // 使用最新的位置資訊
    const location = order.tracking || {
      driverLat: order.driver.lastLatitude,
      driverLng: order.driver.lastLongitude,
      updatedAt: order.driver.lastLocationUpdate
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        status: order.status,
        driver: {
          name: order.driver.name,
          licensePlate: order.driver.licensePlate
        },
        location: {
          latitude: location.driverLat,
          longitude: location.driverLng,
          updatedAt: location.updatedAt
        },
        pickupAddress: order.pickupAddress
      }
    })

  } catch (error) {
    console.error('取得司機追蹤錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 完成訂單（乘客端確認）
const completeBooking = async (req, res) => {
  try {
    const { orderId } = req.params
    const { rating, feedback } = req.body

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { driver: true }
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '找不到該訂單'
      })
    }

    if (order.status !== 'picked_up') {
      return res.status(400).json({
        success: false,
        message: '訂單狀態錯誤'
      })
    }

    // 更新訂單狀態
    const completedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'completed',
          completedTime: new Date()
        }
      })

      // 如果有評分，更新司機評分
      if (rating && order.driver) {
        const driver = await tx.driver.findUnique({
          where: { id: order.driver.id }
        })
        
        // 簡單的平均計算
        const newRating = (driver.rating * driver.totalTrips + rating) / (driver.totalTrips + 1)
        
        await tx.driver.update({
          where: { id: order.driver.id },
          data: { rating: newRating }
        })
      }

      // 更新乘客統計
      await tx.passenger.update({
        where: { id: order.passengerId },
        data: {
          totalTrips: { increment: 1 }
        }
      })

      return updated
    })

    res.json({
      success: true,
      message: '行程已完成，感謝您的搭乘',
      data: {
        orderId: completedOrder.id,
        status: completedOrder.status
      }
    })

  } catch (error) {
    console.error('完成訂單錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

module.exports = {
  createBooking,
  getBookingStatus,
  cancelBooking,
  getDriverTracking,
  completeBooking
}