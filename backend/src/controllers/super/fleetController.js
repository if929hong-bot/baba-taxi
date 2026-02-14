const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// 取得待審核車隊列表
const getPendingFleets = async (req, res) => {
  try {
    const pendingFleets = await prisma.fleetManager.findMany({
      where: {
        status: 'pending'
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
        fleet: {
          select: {
            id: true,
            fleetName: true,
            fleetCode: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: pendingFleets
    })

  } catch (error) {
    console.error('取得待審核車隊錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 通過車隊審核
const approveFleet = async (req, res) => {
  try {
    const { id } = req.params

    // 檢查車隊管理員是否存在
    const fleetManager = await prisma.fleetManager.findUnique({
      where: { id },
      include: { fleet: true }
    })

    if (!fleetManager) {
      return res.status(404).json({
        success: false,
        message: '找不到該車隊管理員'
      })
    }

    if (fleetManager.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '該車隊已經處理過'
      })
    }

    // 開始交易（同時更新車隊和車隊管理員狀態）
    const result = await prisma.$transaction(async (tx) => {
      // 更新車隊狀態為 active
      const updatedFleet = await tx.fleet.update({
        where: { id: fleetManager.fleetId },
        data: { status: 'active' }
      })

      // 更新車隊管理員狀態為 active
      const updatedManager = await tx.fleetManager.update({
        where: { id },
        data: { 
          status: 'active',
          reviewedBy: req.user.id,
          reviewedAt: new Date()
        }
      })

      return { updatedFleet, updatedManager }
    })

    res.json({
      success: true,
      message: '車隊審核通過',
      data: result
    })

  } catch (error) {
    console.error('通過車隊審核錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 拒絕車隊審核
const rejectFleet = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: '請填寫拒絕原因'
      })
    }

    // 檢查車隊管理員是否存在
    const fleetManager = await prisma.fleetManager.findUnique({
      where: { id },
      include: { fleet: true }
    })

    if (!fleetManager) {
      return res.status(404).json({
        success: false,
        message: '找不到該車隊管理員'
      })
    }

    if (fleetManager.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '該車隊已經處理過'
      })
    }

    // 開始交易
    const result = await prisma.$transaction(async (tx) => {
      // 更新車隊狀態為 rejected（可以用 suspend 來表示拒絕）
      const updatedFleet = await tx.fleet.update({
        where: { id: fleetManager.fleetId },
        data: { 
          status: 'suspended',
          suspendReason: reason
        }
      })

      // 更新車隊管理員狀態為 blocked
      const updatedManager = await tx.fleetManager.update({
        where: { id },
        data: { 
          status: 'blocked',
          reviewedBy: req.user.id,
          reviewedAt: new Date()
        }
      })

      return { updatedFleet, updatedManager }
    })

    res.json({
      success: true,
      message: '已拒絕車隊申請',
      data: result
    })

  } catch (error) {
    console.error('拒絕車隊審核錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

module.exports = {
  getPendingFleets,
  approveFleet,
  rejectFleet
}
// 取得所有車隊列表（含分頁、篩選）
const getAllFleets = async (req, res) => {
  try {
    const { 
      status, 
      search,
      page = 1, 
      limit = 10 
    } = req.query
    
    const skip = (page - 1) * limit

    // 建立篩選條件
    const where = {}
    
    if (status) where.status = status
    
    // 搜尋（車隊名稱、編號、負責人）
    if (search) {
      where.OR = [
        { fleetName: { contains: search } },
        { fleetCode: { contains: search } },
        { managers: { some: { name: { contains: search } } } }
      ]
    }

    // 查詢總筆數
    const total = await prisma.fleet.count({ where })

    // 查詢車隊列表
    const fleets = await prisma.fleet.findMany({
      where,
      include: {
        managers: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            status: true
          }
        },
        _count: {
          select: {
            drivers: true,
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
    const formattedFleets = fleets.map(fleet => ({
      id: fleet.id,
      fleetCode: fleet.fleetCode,
      fleetName: fleet.fleetName,
      status: fleet.status,
      createdAt: fleet.createdAt,
      suspendedAt: fleet.suspendedAt,
      suspendReason: fleet.suspendReason,
      manager: fleet.managers[0] || null, // 主要管理者
      stats: {
        totalDrivers: fleet._count.drivers,
        totalOrders: fleet._count.orders
      }
    }))

    res.json({
      success: true,
      data: {
        fleets: formattedFleets,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('取得車隊列表錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 取得單一車隊詳細資料
const getFleetById = async (req, res) => {
  try {
    const { id } = req.params

    const fleet = await prisma.fleet.findUnique({
      where: { id },
      include: {
        managers: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            status: true,
            createdAt: true,
            lastLogin: true
          }
        },
        drivers: {
          take: 10,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            name: true,
            phone: true,
            licensePlate: true,
            status: true,
            onlineStatus: true,
            rating: true,
            totalTrips: true
          }
        },
        settings: true,
        payments: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            month: true,
            amount: true,
            status: true,
            createdAt: true,
            confirmedAt: true
          }
        },
        _count: {
          select: {
            drivers: true,
            orders: true
          }
        }
      }
    })

    if (!fleet) {
      return res.status(404).json({
        success: false,
        message: '找不到該車隊'
      })
    }

    // 格式化回應資料
    const formattedFleet = {
      id: fleet.id,
      fleetCode: fleet.fleetCode,
      fleetName: fleet.fleetName,
      status: fleet.status,
      createdAt: fleet.createdAt,
      suspendedAt: fleet.suspendedAt,
      suspendReason: fleet.suspendReason,
      managers: fleet.managers,
      settings: fleet.settings,
      stats: {
        totalDrivers: fleet._count.drivers,
        totalOrders: fleet._count.orders
      },
      recentDrivers: fleet.drivers,
      recentPayments: fleet.payments
    }

    res.json({
      success: true,
      data: formattedFleet
    })

  } catch (error) {
    console.error('取得車隊詳細資料錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 停權車隊
const blockFleet = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: '請填寫停權原因'
      })
    }

    const fleet = await prisma.fleet.findUnique({
      where: { id },
      include: {
        managers: true,
        drivers: true
      }
    })

    if (!fleet) {
      return res.status(404).json({
        success: false,
        message: '找不到該車隊'
      })
    }

    if (fleet.status === 'suspended') {
      return res.status(400).json({
        success: false,
        message: '該車隊已經被停權'
      })
    }

    // 開始交易：停權車隊、所有管理員、所有司機
    const result = await prisma.$transaction(async (tx) => {
      // 停權車隊
      const updatedFleet = await tx.fleet.update({
        where: { id },
        data: {
          status: 'suspended',
          suspendedAt: new Date(),
          suspendReason: reason
        }
      })

      // 停權所有車隊管理員
      await tx.fleetManager.updateMany({
        where: { fleetId: id },
        data: { status: 'blocked' }
      })

      // 停權所有司機
      await tx.driver.updateMany({
        where: { fleetId: id },
        data: { 
          status: 'blocked',
          onlineStatus: 'offline'
        }
      })

      return updatedFleet
    })

    res.json({
      success: true,
      message: '車隊已停權',
      data: {
        id: result.id,
        fleetName: result.fleetName,
        status: result.status,
        suspendReason: result.suspendReason
      }
    })

  } catch (error) {
    console.error('停權車隊錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 復權車隊
const unblockFleet = async (req, res) => {
  try {
    const { id } = req.params

    const fleet = await prisma.fleet.findUnique({
      where: { id }
    })

    if (!fleet) {
      return res.status(404).json({
        success: false,
        message: '找不到該車隊'
      })
    }

    if (fleet.status !== 'suspended') {
      return res.status(400).json({
        success: false,
        message: '該車隊目前不是停權狀態'
      })
    }

    // 開始交易：復權車隊、所有管理員、所有司機
    const result = await prisma.$transaction(async (tx) => {
      // 復權車隊
      const updatedFleet = await tx.fleet.update({
        where: { id },
        data: {
          status: 'active',
          suspendedAt: null,
          suspendReason: null
        }
      })

      // 復權所有車隊管理員（設為 pending 需要重新審核）
      await tx.fleetManager.updateMany({
        where: { fleetId: id },
        data: { status: 'pending' }
      })

      // 復權所有司機（設為 pending 需要重新審核）
      await tx.driver.updateMany({
        where: { fleetId: id },
        data: { 
          status: 'pending',
          onlineStatus: 'offline'
        }
      })

      return updatedFleet
    })

    res.json({
      success: true,
      message: '車隊已復權',
      data: {
        id: result.id,
        fleetName: result.fleetName,
        status: result.status
      }
    })

  } catch (error) {
    console.error('復權車隊錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

module.exports = {
  getPendingFleets,
  approveFleet,
  rejectFleet,
  getAllFleets,      // 新增
  getFleetById,      // 新增
  blockFleet,        // 新增
  unblockFleet       // 新增
}