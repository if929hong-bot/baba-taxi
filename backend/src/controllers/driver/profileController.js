const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const bcrypt = require('bcryptjs')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// 取得個人資料
const getProfile = async (req, res) => {
  try {
    const driverId = req.user.id

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        fleet: {
          select: {
            id: true,
            fleetCode: true,
            fleetName: true,
            settings: true
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: '找不到該司機'
      })
    }

    // 解析 JSON 字串
    const formattedDriver = {
      ...driver,
      carPhotosUrls: driver.carPhotosUrls ? JSON.parse(driver.carPhotosUrls) : [],
      password: undefined
    }

    // 取得今日收入
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayIncome = await prisma.order.aggregate({
      where: {
        driverId,
        status: 'completed',
        completedTime: {
          gte: today
        }
      },
      _sum: { actualFare: true },
      _count: true
    })

    res.json({
      success: true,
      data: {
        profile: formattedDriver,
        stats: {
          totalTrips: driver._count.orders,
          totalIncome: driver.totalIncome,
          todayTrips: todayIncome._count,
          todayIncome: todayIncome._sum.actualFare || 0,
          rating: driver.rating
        }
      }
    })

  } catch (error) {
    console.error('取得個人資料錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 更新個人資料
const updateProfile = async (req, res) => {
  try {
    const driverId = req.user.id
    const {
      name,
      email,
      carBrand,
      carModel,
      carYear,
      carColor,
      hasInsurance,
      currentJob,
      selfScore
    } = req.body

    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (carBrand) updateData.carBrand = carBrand
    if (carModel) updateData.carModel = carModel
    if (carYear) updateData.carYear = parseInt(carYear)
    if (carColor) updateData.carColor = carColor
    if (hasInsurance !== undefined) updateData.hasInsurance = hasInsurance
    if (currentJob) updateData.currentJob = currentJob
    if (selfScore) updateData.selfScore = parseInt(selfScore)

    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: updateData,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        carBrand: true,
        carModel: true,
        carYear: true,
        carColor: true,
        hasInsurance: true,
        currentJob: true,
        selfScore: true
      }
    })

    res.json({
      success: true,
      message: '個人資料更新成功',
      data: updatedDriver
    })

  } catch (error) {
    console.error('更新個人資料錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 更新密碼
const updatePassword = async (req, res) => {
  try {
    const driverId = req.user.id
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '請提供舊密碼和新密碼'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '新密碼長度至少 6 碼'
      })
    }

    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    })

    const isValidPassword = await bcrypt.compare(oldPassword, driver.password)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '舊密碼錯誤'
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.driver.update({
      where: { id: driverId },
      data: { password: hashedPassword }
    })

    res.json({
      success: true,
      message: '密碼更新成功'
    })

  } catch (error) {
    console.error('更新密碼錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 更新位置
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body
    const driverId = req.user.id

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: '請提供位置資訊'
      })
    }

    await prisma.$transaction([
      prisma.driver.update({
        where: { id: driverId },
        data: {
          lastLatitude: latitude,
          lastLongitude: longitude,
          lastLocationUpdate: new Date()
        }
      }),
      prisma.driverLocation.upsert({
        where: { driverId },
        update: {
          latitude,
          longitude,
          updatedAt: new Date()
        },
        create: {
          driverId,
          latitude,
          longitude
        }
      })
    ])

    // 如果有進行中的訂單，更新訂單追蹤
    const ongoingOrder = await prisma.order.findFirst({
      where: {
        driverId,
        status: {
          in: ['accepted', 'picked_up']
        }
      }
    })

    if (ongoingOrder) {
      await prisma.orderTracking.upsert({
        where: { orderId: ongoingOrder.id },
        update: {
          driverLat: latitude,
          driverLng: longitude,
          updatedAt: new Date()
        },
        create: {
          orderId: ongoingOrder.id,
          driverLat: latitude,
          driverLng: longitude
        }
      })
    }

    res.json({
      success: true,
      message: '位置已更新'
    })

  } catch (error) {
    console.error('更新位置錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 取得今日收入
const getTodayIncome = async (req, res) => {
  try {
    const driverId = req.user.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [todayOrders, driver] = await Promise.all([
      prisma.order.findMany({
        where: {
          driverId,
          status: 'completed',
          completedTime: {
            gte: today
          }
        },
        orderBy: {
          completedTime: 'desc'
        },
        select: {
          id: true,
          orderNumber: true,
          actualFare: true,
          paymentMethod: true,
          completedTime: true,
          pickupAddress: true,
          dropoffAddress: true
        }
      }),
      prisma.driver.findUnique({
        where: { id: driverId },
        select: {
          totalTrips: true,
          totalIncome: true
        }
      })
    ])

    const totalToday = todayOrders.reduce((sum, order) => sum + (order.actualFare || 0), 0)
    const cashTotal = todayOrders
      .filter(o => o.paymentMethod === 'cash')
      .reduce((sum, o) => sum + (o.actualFare || 0), 0)
    const streetTotal = todayOrders
      .filter(o => o.paymentMethod === 'street')
      .reduce((sum, o) => sum + (o.actualFare || 0), 0)

    res.json({
      success: true,
      data: {
        today: {
          total: totalToday,
          cash: cashTotal,
          street: streetTotal,
          trips: todayOrders.length
        },
        total: {
          trips: driver.totalTrips,
          income: driver.totalIncome
        },
        orders: todayOrders
      }
    })

  } catch (error) {
    console.error('取得今日收入錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  updateLocation,
  getTodayIncome
}