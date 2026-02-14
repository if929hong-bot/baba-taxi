const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// 更新上線/下線狀態
const updateOnlineStatus = async (req, res) => {
  try {
    const { onlineStatus } = req.body
    const driverId = req.user.id

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

// 取得附近任務（待接單）
const getNearbyTasks = async (req, res) => {
  try {
    const driverId = req.user.id
    const { latitude, longitude, radius = 5 } = req.query // radius 單位：公里

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: { fleet: true }
    })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: '找不到該司機'
      })
    }

    if (driver.onlineStatus !== 'online') {
      return res.status(400).json({
        success: false,
        message: '請先上線'
      })
    }

    // 查詢待接單的訂單
    // 這裡簡化處理，實際應用需要根據距離計算
    const pendingOrders = await prisma.order.findMany({
      where: {
        fleetId: driver.fleetId,
        status: 'pending',
        driverId: null
      },
      orderBy: {
        requestedTime: 'asc'
      },
      take: 20
    })

    // 格式化訂單資訊
    const tasks = pendingOrders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      pickupAddress: order.pickupAddress,
      dropoffAddress: order.dropoffAddress,
      estimatedFare: order.estimatedFare,
      distance: order.distanceKm,
      passengerPhone: order.passengerPhone,
      requestedTime: order.requestedTime,
      note: order.note
    }))

    res.json({
      success: true,
      data: {
        tasks,
        count: tasks.length
      }
    })

  } catch (error) {
    console.error('取得附近任務錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 搶單
const grabTask = async (req, res) => {
  try {
    const { taskId } = req.params
    const driverId = req.user.id

    // 檢查司機狀態
    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    })

    if (!driver || driver.onlineStatus !== 'online') {
      return res.status(400).json({
        success: false,
        message: '請先上線'
      })
    }

    // 檢查訂單是否存在且可接
    const order = await prisma.order.findUnique({
      where: { id: taskId }
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '找不到該任務'
      })
    }

    if (order.status !== 'pending' || order.driverId) {
      return res.status(400).json({
        success: false,
        message: '該任務已被接走'
      })
    }

    if (order.fleetId !== driver.fleetId) {
      return res.status(403).json({
        success: false,
        message: '無權接此車隊的任務'
      })
    }

    // 開始交易：更新訂單狀態
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 更新訂單
      const grabbed = await tx.order.update({
        where: { id: taskId },
        data: {
          driverId,
          status: 'accepted',
          acceptedTime: new Date()
        },
        include: {
          passenger: true
        }
      })

      return grabbed
    })

    // TODO: 發送推播通知乘客

    res.json({
      success: true,
      message: '搶單成功',
      data: {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        pickupAddress: updatedOrder.pickupAddress,
        dropoffAddress: updatedOrder.dropoffAddress,
        passengerPhone: updatedOrder.passengerPhone,
        estimatedFare: updatedOrder.estimatedFare
      }
    })

  } catch (error) {
    console.error('搶單錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 取得我的任務列表
const getMyTasks = async (req, res) => {
  try {
    const driverId = req.user.id
    const { status, page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    const where = { driverId }
    if (status) where.status = status

    const [tasks, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: Number(limit),
        select: {
          id: true,
          orderNumber: true,
          pickupAddress: true,
          dropoffAddress: true,
          estimatedFare: true,
          actualFare: true,
          status: true,
          paymentMethod: true,
          passengerPhone: true,
          requestedTime: true,
          acceptedTime: true,
          completedTime: true,
          distanceKm: true,
          durationMin: true,
          note: true
        }
      }),
      prisma.order.count({ where })
    ])

    // 統計資訊
    const stats = {
      total: total,
      completed: await prisma.order.count({
        where: { driverId, status: 'completed' }
      }),
      cancelled: await prisma.order.count({
        where: { driverId, status: 'cancelled' }
      }),
      totalIncome: await prisma.order.aggregate({
        where: { driverId, status: 'completed' },
        _sum: { actualFare: true }
      })
    }

    res.json({
      success: true,
      data: {
        tasks,
        stats: {
          totalTrips: stats.completed,
          totalIncome: stats.totalIncome._sum.actualFare || 0,
          completedRate: stats.completed / (stats.completed + stats.cancelled) || 0
        },
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('取得我的任務錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 取得單一任務詳細資料
const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params
    const driverId = req.user.id

    const task = await prisma.order.findFirst({
      where: {
        id: taskId,
        driverId
      },
      include: {
        passenger: {
          select: {
            phone: true,
            totalTrips: true
          }
        },
        tracking: true
      }
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: '找不到該任務'
      })
    }

    res.json({
      success: true,
      data: task
    })

  } catch (error) {
    console.error('取得任務詳細資料錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 更新任務狀態（乘客已上車、開始跳表、到達目的地）
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params
    const { status, data } = req.body
    const driverId = req.user.id

    const validStatus = ['picked_up', 'completed']
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '無效的狀態值'
      })
    }

    const task = await prisma.order.findFirst({
      where: {
        id: taskId,
        driverId,
        status: status === 'picked_up' ? 'accepted' : 'picked_up'
      }
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: '找不到該任務或狀態不正確'
      })
    }

    const updateData = {}
    if (status === 'picked_up') {
      updateData.status = 'picked_up'
      updateData.pickedUpTime = new Date()
    } else if (status === 'completed') {
      updateData.status = 'completed'
      updateData.completedTime = new Date()
      updateData.actualFare = data?.actualFare || task.estimatedFare
      updateData.paymentMethod = data?.paymentMethod
    }

    const updatedTask = await prisma.order.update({
      where: { id: taskId },
      data: updateData,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        pickedUpTime: true,
        completedTime: true,
        actualFare: true,
        paymentMethod: true
      }
    })

    // 如果任務完成，更新司機統計
    if (status === 'completed') {
      await prisma.driver.update({
        where: { id: driverId },
        data: {
          totalTrips: { increment: 1 },
          totalIncome: { increment: updatedTask.actualFare || 0 }
        }
      })
    }

    res.json({
      success: true,
      message: status === 'picked_up' ? '乘客已上車' : '行程完成',
      data: updatedTask
    })

  } catch (error) {
    console.error('更新任務狀態錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

module.exports = {
  updateOnlineStatus,
  getNearbyTasks,
  grabTask,
  getMyTasks,
  getTaskById,
  updateTaskStatus
}