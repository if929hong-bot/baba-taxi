const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// 取得所有司機列表（含分頁、篩選）
const getAllDrivers = async (req, res) => {
  try {
    const { 
      status, 
      fleetId, 
      search,
      page = 1, 
      limit = 10 
    } = req.query
    
    const skip = (page - 1) * limit

    // 建立篩選條件
    const where = {}
    
    if (status) where.status = status
    if (fleetId) where.fleetId = fleetId
    
    // 搜尋（姓名、電話、車牌）
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { licensePlate: { contains: search } }
      ]
    }

    // 查詢總筆數
    const total = await prisma.driver.count({ where })

    // 查詢司機列表
    const drivers = await prisma.driver.findMany({
      where,
      include: {
        fleet: {
          select: {
            id: true,
            fleetName: true,
            fleetCode: true
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: Number(limit)
    })

    // 格式化回應資料
    const formattedDrivers = drivers.map(driver => ({
      id: driver.id,
      driverCode: driver.driverCode,
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      licensePlate: driver.licensePlate,
      carBrand: driver.carBrand,
      carModel: driver.carModel,
      carYear: driver.carYear,
      carColor: driver.carColor,
      status: driver.status,
      onlineStatus: driver.onlineStatus,
      rating: driver.rating,
      totalTrips: driver._count.orders,
      totalIncome: driver.totalIncome,
      joinDate: driver.createdAt,
      fleet: driver.fleet
    }))

    res.json({
      success: true,
      data: {
        drivers: formattedDrivers,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('取得司機列表錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 取得單一司機詳細資料
const getDriverById = async (req, res) => {
  try {
    const { id } = req.params

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        fleet: {
          select: {
            id: true,
            fleetName: true,
            fleetCode: true
          }
        },
        orders: {
          take: 10,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            orderNumber: true,
            passengerPhone: true,
            pickupAddress: true,
            dropoffAddress: true,
            actualFare: true,
            status: true,
            createdAt: true
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

    // 格式化回應資料
    const formattedDriver = {
      id: driver.id,
      driverCode: driver.driverCode,
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      licensePlate: driver.licensePlate,
      carBrand: driver.carBrand,
      carModel: driver.carModel,
      carYear: driver.carYear,
      carColor: driver.carColor,
      hasInsurance: driver.hasInsurance,
      experience: driver.experience,
      currentJob: driver.currentJob,
      selfScore: driver.selfScore,
      criminalRecord: driver.criminalRecord,
      driverLicenseUrl: driver.driverLicenseUrl,
      carPhotosUrls: driver.carPhotosUrls ? JSON.parse(driver.carPhotosUrls) : [],
      policeCertificateUrl: driver.policeCertificateUrl,
      status: driver.status,
      onlineStatus: driver.onlineStatus,
      rating: driver.rating,
      totalTrips: driver._count.orders,
      totalIncome: driver.totalIncome,
      lastLatitude: driver.lastLatitude,
      lastLongitude: driver.lastLongitude,
      lastLocationUpdate: driver.lastLocationUpdate,
      joinDate: driver.createdAt,
      fleet: driver.fleet,
      recentOrders: driver.orders
    }

    res.json({
      success: true,
      data: formattedDriver
    })

  } catch (error) {
    console.error('取得司機詳細資料錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 停權司機
const blockDriver = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const driver = await prisma.driver.findUnique({
      where: { id }
    })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: '找不到該司機'
      })
    }

    if (driver.status === 'blocked') {
      return res.status(400).json({
        success: false,
        message: '該司機已經被停權'
      })
    }

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        status: 'blocked',
        onlineStatus: 'offline'
      }
    })

    res.json({
      success: true,
      message: '司機已停權',
      data: {
        id: updatedDriver.id,
        name: updatedDriver.name,
        status: updatedDriver.status
      }
    })

  } catch (error) {
    console.error('停權司機錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 復權司機
const unblockDriver = async (req, res) => {
  try {
    const { id } = req.params

    const driver = await prisma.driver.findUnique({
      where: { id }
    })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: '找不到該司機'
      })
    }

    if (driver.status !== 'blocked') {
      return res.status(400).json({
        success: false,
        message: '該司機目前不是停權狀態'
      })
    }

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        status: 'active'
      }
    })

    res.json({
      success: true,
      message: '司機已復權',
      data: {
        id: updatedDriver.id,
        name: updatedDriver.name,
        status: updatedDriver.status
      }
    })

  } catch (error) {
    console.error('復權司機錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

module.exports = {
  getAllDrivers,
  getDriverById,
  blockDriver,
  unblockDriver
}