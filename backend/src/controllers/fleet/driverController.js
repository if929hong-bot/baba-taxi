const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const bcrypt = require('bcryptjs')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// 取得待審核司機列表
const getPendingDrivers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit
    const fleetId = req.user.fleetId

    // 查詢總筆數
    const total = await prisma.driver.count({
      where: {
        fleetId,
        status: 'pending'
      }
    })

    // 查詢待審核司機
    const drivers = await prisma.driver.findMany({
      where: {
        fleetId,
        status: 'pending'
      },
      select: {
        id: true,
        driverCode: true,
        name: true,
        phone: true,
        email: true,
        licensePlate: true,
        carBrand: true,
        carModel: true,
        carYear: true,
        carColor: true,
        hasInsurance: true,
        experience: true,
        currentJob: true,
        selfScore: true,
        criminalRecord: true,
        driverLicenseUrl: true,
        carPhotosUrls: true,
        policeCertificateUrl: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: Number(limit)
    })

    // 格式化回應（解析 JSON 字串）
    const formattedDrivers = drivers.map(driver => ({
      ...driver,
      carPhotosUrls: driver.carPhotosUrls ? JSON.parse(driver.carPhotosUrls) : []
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
    console.error('取得待審核司機錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 取得單一待審核司機詳細資料
const getPendingDriverById = async (req, res) => {
  try {
    const { id } = req.params
    const fleetId = req.user.fleetId

    const driver = await prisma.driver.findFirst({
      where: {
        id,
        fleetId,
        status: 'pending'
      },
      select: {
        id: true,
        driverCode: true,
        name: true,
        phone: true,
        email: true,
        licensePlate: true,
        carBrand: true,
        carModel: true,
        carYear: true,
        carColor: true,
        hasInsurance: true,
        experience: true,
        currentJob: true,
        selfScore: true,
        criminalRecord: true,
        driverLicenseUrl: true,
        carPhotosUrls: true,
        policeCertificateUrl: true,
        createdAt: true
      }
    })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: '找不到該司機申請'
      })
    }

    // 格式化回應
    const formattedDriver = {
      ...driver,
      carPhotosUrls: driver.carPhotosUrls ? JSON.parse(driver.carPhotosUrls) : []
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

// 通過司機審核
const approveDriver = async (req, res) => {
  try {
    const { id } = req.params
    const fleetId = req.user.fleetId

    // 檢查司機是否存在且為待審核狀態
    const driver = await prisma.driver.findFirst({
      where: {
        id,
        fleetId,
        status: 'pending'
      }
    })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: '找不到該司機申請'
      })
    }

    // 更新司機狀態為 active
    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        status: 'active',
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        phone: true,
        status: true
      }
    })

    // TODO: 發送通知給司機（簡訊或推播）

    res.json({
      success: true,
      message: '司機審核通過，已可開始接單',
      data: updatedDriver
    })

  } catch (error) {
    console.error('通過司機審核錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 拒絕司機審核
const rejectDriver = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    const fleetId = req.user.fleetId

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: '請填寫拒絕原因'
      })
    }

    // 檢查司機是否存在且為待審核狀態
    const driver = await prisma.driver.findFirst({
      where: {
        id,
        fleetId,
        status: 'pending'
      }
    })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: '找不到該司機申請'
      })
    }

    // 更新司機狀態為 blocked（拒絕）
    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        status: 'blocked',
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        phone: true,
        status: true
      }
    })

    // TODO: 發送通知給司機（簡訊或推播）

    res.json({
      success: true,
      message: '已拒絕司機申請',
      data: {
        ...updatedDriver,
        rejectReason: reason
      }
    })

  } catch (error) {
    console.error('拒絕司機審核錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 司機註冊（給司機端用的，之後會移到 driver 控制器）
const registerDriver = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      licensePlate,
      carBrand,
      carModel,
      carYear,
      carColor,
      hasInsurance,
      experience,
      currentJob,
      selfScore,
      criminalRecord,
      driverLicenseUrl,
      carPhotosUrls,
      policeCertificateUrl,
      fleetCode
    } = req.body

    // 驗證輸入
    if (!name || !phone || !password || !licensePlate || !carBrand || !carModel || !carYear || !carColor) {
      return res.status(400).json({
        success: false,
        message: '請填寫所有必填欄位'
      })
    }

    // 檢查手機號碼是否已被註冊
    const existingDriver = await prisma.driver.findUnique({
      where: { phone }
    })

    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: '此手機號碼已被註冊'
      })
    }

    // 檢查車牌是否已被註冊
    const existingPlate = await prisma.driver.findUnique({
      where: { licensePlate }
    })

    if (existingPlate) {
      return res.status(400).json({
        success: false,
        message: '此車牌號碼已被註冊'
      })
    }

    // 查詢車隊
    const fleet = await prisma.fleet.findUnique({
      where: { fleetCode: fleetCode || 'F001' }
    })

    if (!fleet) {
      return res.status(400).json({
        success: false,
        message: '無效的車隊編號'
      })
    }

    // 產生司機編號
    const lastDriver = await prisma.driver.findFirst({
      where: { fleetId: fleet.id },
      orderBy: { driverCode: 'desc' }
    })

    let driverCode = `${fleet.fleetCode}-D001`
    if (lastDriver) {
      const lastNumber = parseInt(lastDriver.driverCode.split('-')[1].substring(1))
      driverCode = `${fleet.fleetCode}-D${String(lastNumber + 1).padStart(3, '0')}`
    }

    // 密碼加密
    const hashedPassword = await bcrypt.hash(password, 10)

    // 建立司機
    const driver = await prisma.driver.create({
      data: {
        driverCode,
        fleetId: fleet.id,
        name,
        phone,
        email,
        password: hashedPassword,
        licensePlate,
        carBrand,
        carModel,
        carYear: parseInt(carYear),
        carColor,
        hasInsurance: hasInsurance || false,
        experience,
        currentJob,
        selfScore: selfScore ? parseInt(selfScore) : null,
        criminalRecord,
        driverLicenseUrl,
        carPhotosUrls: carPhotosUrls ? JSON.stringify(carPhotosUrls) : '[]',
        policeCertificateUrl,
        status: 'pending'
      }
    })

    res.status(201).json({
      success: true,
      message: '註冊成功，請等待車隊管理員審核',
      data: {
        id: driver.id,
        name: driver.name,
        status: driver.status
      }
    })

  } catch (error) {
    console.error('司機註冊錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

module.exports = {
  getPendingDrivers,
  getPendingDriverById,
  approveDriver,
  rejectDriver,
  registerDriver  // 之後會移到 driver 控制器
}
// 取得所有司機列表（含分頁、篩選）
const getAllDrivers = async (req, res) => {
  try {
    const { 
      status, 
      onlineStatus,
      search,
      page = 1, 
      limit = 10 
    } = req.query
    
    const skip = (page - 1) * limit
    const fleetId = req.user.fleetId

    // 建立篩選條件
    const where = { fleetId }
    
    if (status) where.status = status
    if (onlineStatus) where.onlineStatus = onlineStatus
    
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
      select: {
        id: true,
        driverCode: true,
        name: true,
        phone: true,
        email: true,
        licensePlate: true,
        carBrand: true,
        carModel: true,
        carYear: true,
        carColor: true,
        status: true,
        onlineStatus: true,
        rating: true,
        totalTrips: true,
        totalIncome: true,
        lastLatitude: true,
        lastLongitude: true,
        lastLocationUpdate: true,
        createdAt: true,
        reviewedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: Number(limit)
    })

    // 統計資料
    const stats = {
      total: total,
      active: await prisma.driver.count({ where: { fleetId, status: 'active' } }),
      inactive: await prisma.driver.count({ where: { fleetId, status: 'inactive' } }),
      pending: await prisma.driver.count({ where: { fleetId, status: 'pending' } }),
      blocked: await prisma.driver.count({ where: { fleetId, status: 'blocked' } }),
      online: await prisma.driver.count({ where: { fleetId, onlineStatus: 'online' } })
    }

    res.json({
      success: true,
      data: {
        drivers,
        stats,
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
    const fleetId = req.user.fleetId

    const driver = await prisma.driver.findFirst({
      where: {
        id,
        fleetId
      },
      include: {
        orders: {
          take: 20,
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
            createdAt: true,
            completedTime: true
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
      password: undefined // 不返回密碼
    }

    // 計算統計
    const stats = {
      totalTrips: driver._count.orders,
      totalIncome: driver.totalIncome,
      completedTrips: driver.orders.filter(o => o.status === 'completed').length,
      cancelledTrips: driver.orders.filter(o => o.status === 'cancelled').length,
      averageRating: driver.rating
    }

    res.json({
      success: true,
      data: {
        driver: formattedDriver,
        stats,
        recentOrders: driver.orders
      }
    })

  } catch (error) {
    console.error('取得司機詳細資料錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 刪除司機（離職）
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params
    const fleetId = req.user.fleetId

    // 檢查司機是否存在
    const driver = await prisma.driver.findFirst({
      where: {
        id,
        fleetId
      }
    })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: '找不到該司機'
      })
    }

    // 檢查是否有進行中的訂單
    const ongoingOrder = await prisma.order.findFirst({
      where: {
        driverId: id,
        status: {
          in: ['accepted', 'picked_up']
        }
      }
    })

    if (ongoingOrder) {
      return res.status(400).json({
        success: false,
        message: '司機目前有進行中的訂單，無法刪除'
      })
    }

    // 刪除司機（同時會透過 cascade 刪除相關的 location 記錄）
    await prisma.driver.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '司機已刪除'
    })

  } catch (error) {
    console.error('刪除司機錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 更新司機狀態（停權/復權）
const updateDriverStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, reason } = req.body
    const fleetId = req.user.fleetId

    if (!['active', 'blocked', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '無效的狀態值'
      })
    }

    // 檢查司機是否存在
    const driver = await prisma.driver.findFirst({
      where: {
        id,
        fleetId
      }
    })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: '找不到該司機'
      })
    }

    // 如果要停權，檢查是否有進行中的訂單
    if (status === 'blocked') {
      const ongoingOrder = await prisma.order.findFirst({
        where: {
          driverId: id,
          status: {
            in: ['accepted', 'picked_up']
          }
        }
      })

      if (ongoingOrder) {
        return res.status(400).json({
          success: false,
          message: '司機目前有進行中的訂單，無法停權'
        })
      }
    }

    // 更新狀態
    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        status,
        onlineStatus: status === 'blocked' ? 'offline' : driver.onlineStatus
      },
      select: {
        id: true,
        name: true,
        phone: true,
        status: true,
        onlineStatus: true
      }
    })

    res.json({
      success: true,
      message: status === 'blocked' ? '司機已停權' : '司機狀態已更新',
      data: updatedDriver
    })

  } catch (error) {
    console.error('更新司機狀態錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 更新司機線上狀態（給司機端用）
const updateOnlineStatus = async (req, res) => {
  try {
    const { onlineStatus } = req.body
    const driverId = req.user.id // 從 token 取得

    if (!['online', 'offline'].includes(onlineStatus)) {
      return res.status(400).json({
        success: false,
        message: '無效的狀態值'
      })
    }

    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: '找不到該司機'
      })
    }

    if (driver.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: '您的帳號目前無法上線'
      })
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: { onlineStatus },
      select: {
        id: true,
        name: true,
        onlineStatus: true
      }
    })

    res.json({
      success: true,
      message: onlineStatus === 'online' ? '已上線' : '已下線',
      data: updatedDriver
    })

  } catch (error) {
    console.error('更新線上狀態錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 更新司機位置（給司機端用）
const updateDriverLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body
    const driverId = req.user.id

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: '請提供位置資訊'
      })
    }

    // 更新司機最後位置
    await prisma.driver.update({
      where: { id: driverId },
      data: {
        lastLatitude: latitude,
        lastLongitude: longitude,
        lastLocationUpdate: new Date()
      }
    })

    // 更新或建立即時位置記錄
    await prisma.driverLocation.upsert({
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

// 匯出所有函數（記得更新 module.exports）
module.exports = {
  // 審核相關
  getPendingDrivers,
  getPendingDriverById,
  approveDriver,
  rejectDriver,
  
  // 管理相關（新增）
  getAllDrivers,
  getDriverById,
  deleteDriver,
  updateDriverStatus,
  
  // 司機端功能（新增）
  registerDriver,
  updateOnlineStatus,
  updateDriverLocation
}