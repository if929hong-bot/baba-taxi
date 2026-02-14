const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// 取得營收統計（本日、本週、本月）
const getRevenueStats = async (req, res) => {
  try {
    const fleetId = req.user.fleetId
    const now = new Date()
    
    // 設定時間範圍
    const startOfDay = new Date(now.setHours(0, 0, 0, 0))
    const endOfDay = new Date(now.setHours(23, 59, 59, 999))
    
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // 本週第一天（週日）
    startOfWeek.setHours(0, 0, 0, 0)
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    endOfMonth.setHours(23, 59, 59, 999)

    // 並行查詢各種統計數據
    const [
      todayStats,
      weekStats,
      monthStats,
      totalStats,
      todayOrders,
      weekOrders,
      monthOrders,
      hourlyStats,
      paymentMethodStats
    ] = await Promise.all([
      // 本日統計
      prisma.order.aggregate({
        where: {
          fleetId,
          status: 'completed',
          completedTime: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        _count: true,
        _sum: { actualFare: true }
      }),
      
      // 本週統計
      prisma.order.aggregate({
        where: {
          fleetId,
          status: 'completed',
          completedTime: {
            gte: startOfWeek,
            lte: endOfDay
          }
        },
        _count: true,
        _sum: { actualFare: true }
      }),
      
      // 本月統計
      prisma.order.aggregate({
        where: {
          fleetId,
          status: 'completed',
          completedTime: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _count: true,
        _sum: { actualFare: true }
      }),
      
      // 累計統計
      prisma.order.aggregate({
        where: {
          fleetId,
          status: 'completed'
        },
        _count: true,
        _sum: { actualFare: true }
      }),
      
      // 本日訂單明細（用於圖表）
      prisma.order.findMany({
        where: {
          fleetId,
          status: 'completed',
          completedTime: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        select: {
          completedTime: true,
          actualFare: true
        },
        orderBy: {
          completedTime: 'asc'
        }
      }),
      
      // 本週每日統計
      prisma.$queryRaw`
        SELECT 
          date(completedTime) as date,
          COUNT(*) as count,
          SUM(actualFare) as revenue
        FROM orders
        WHERE fleetId = ${fleetId}
          AND status = 'completed'
          AND completedTime >= ${startOfWeek}
          AND completedTime <= ${endOfDay}
        GROUP BY date(completedTime)
        ORDER BY date ASC
      `,
      
      // 本月每日統計
      prisma.$queryRaw`
        SELECT 
          date(completedTime) as date,
          COUNT(*) as count,
          SUM(actualFare) as revenue
        FROM orders
        WHERE fleetId = ${fleetId}
          AND status = 'completed'
          AND completedTime >= ${startOfMonth}
          AND completedTime <= ${endOfMonth}
        GROUP BY date(completedTime)
        ORDER BY date ASC
      `,
      
      // 付款方式統計
      prisma.order.groupBy({
        by: ['paymentMethod'],
        where: {
          fleetId,
          status: 'completed'
        },
        _count: true,
        _sum: { actualFare: true }
      })
    ])

    // 計算本日每小時營收（用於折線圖）
    const hourlyRevenue = Array(24).fill(0).map((_, hour) => {
      const ordersInHour = todayOrders.filter(order => {
        const orderHour = new Date(order.completedTime).getHours()
        return orderHour === hour
      })
      return {
        hour: `${hour}:00`,
        count: ordersInHour.length,
        revenue: ordersInHour.reduce((sum, order) => sum + (order.actualFare || 0), 0)
      }
    })

    // 計算平均客單價
    const avgOrderValue = {
      today: todayStats._count > 0 ? Math.round(todayStats._sum.actualFare / todayStats._count) : 0,
      week: weekStats._count > 0 ? Math.round(weekStats._sum.actualFare / weekStats._count) : 0,
      month: monthStats._count > 0 ? Math.round(monthStats._sum.actualFare / monthStats._count) : 0,
      total: totalStats._count > 0 ? Math.round(totalStats._sum.actualFare / totalStats._count) : 0
    }

    // 格式化付款方式統計
    const paymentMethods = {
      cash: {
        count: paymentMethodStats.find(p => p.paymentMethod === 'cash')?._count || 0,
        revenue: paymentMethodStats.find(p => p.paymentMethod === 'cash')?._sum.actualFare || 0
      },
      street: {
        count: paymentMethodStats.find(p => p.paymentMethod === 'street')?._count || 0,
        revenue: paymentMethodStats.find(p => p.paymentMethod === 'street')?._sum.actualFare || 0
      }
    }

    res.json({
      success: true,
      data: {
        summary: {
          today: {
            orders: todayStats._count,
            revenue: todayStats._sum.actualFare || 0,
            avgOrderValue: avgOrderValue.today
          },
          week: {
            orders: weekStats._count,
            revenue: weekStats._sum.actualFare || 0,
            avgOrderValue: avgOrderValue.week
          },
          month: {
            orders: monthStats._count,
            revenue: monthStats._sum.actualFare || 0,
            avgOrderValue: avgOrderValue.month
          },
          total: {
            orders: totalStats._count,
            revenue: totalStats._sum.actualFare || 0,
            avgOrderValue: avgOrderValue.total
          }
        },
        charts: {
          hourly: hourlyRevenue,
          daily: {
            week: weekOrders,
            month: monthOrders
          }
        },
        paymentMethods
      }
    })

  } catch (error) {
    console.error('取得營收統計錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 取得訂單列表（含分頁、篩選）
const getOrders = async (req, res) => {
  try {
    const { 
      status,
      startDate,
      endDate,
      search,
      page = 1, 
      limit = 10 
    } = req.query
    
    const skip = (page - 1) * limit
    const fleetId = req.user.fleetId

    // 建立篩選條件
    const where = { fleetId }
    
    if (status) where.status = status
    
    // 日期範圍
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }
    
    // 搜尋（乘客電話、司機姓名）
    if (search) {
      where.OR = [
        { passengerPhone: { contains: search } },
        { driver: { name: { contains: search } } }
      ]
    }

    // 查詢總筆數
    const total = await prisma.order.count({ where })

    // 查詢訂單列表
    const orders = await prisma.order.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            licensePlate: true
          }
        },
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
      },
      skip,
      take: Number(limit)
    })

    // 計算今日、本週、本月訂單數（用於卡片顯示）
    const now = new Date()
    const startOfDay = new Date(now.setHours(0, 0, 0, 0))
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [todayCount, weekCount, monthCount] = await Promise.all([
      prisma.order.count({
        where: {
          fleetId,
          createdAt: { gte: startOfDay }
        }
      }),
      prisma.order.count({
        where: {
          fleetId,
          createdAt: { gte: startOfWeek }
        }
      }),
      prisma.order.count({
        where: {
          fleetId,
          createdAt: { gte: startOfMonth }
        }
      })
    ])

    res.json({
      success: true,
      data: {
        orders,
        stats: {
          today: todayCount,
          week: weekCount,
          month: monthCount,
          total
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
    console.error('取得訂單列表錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 取得單一訂單詳細資料
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params
    const fleetId = req.user.fleetId

    const order = await prisma.order.findFirst({
      where: {
        id,
        fleetId
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
        },
        passenger: {
          select: {
            id: true,
            phone: true,
            totalTrips: true
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

    res.json({
      success: true,
      data: order
    })

  } catch (error) {
    console.error('取得訂單詳細資料錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 匯出報表（CSV格式）
const exportOrders = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query
    const fleetId = req.user.fleetId

    // 建立篩選條件
    const where = { fleetId }
    
    if (status) where.status = status
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    // 查詢所有符合條件的訂單
    const orders = await prisma.order.findMany({
      where,
      include: {
        driver: {
          select: {
            name: true,
            phone: true,
            licensePlate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 轉換為 CSV 格式
    const csvRows = []
    
    // 加入標題列
    csvRows.push([
      '訂單編號',
      '乘客電話',
      '司機姓名',
      '司機電話',
      '車牌號碼',
      '上車地點',
      '下車地點',
      '預估車資',
      '實際車資',
      '付款方式',
      '狀態',
      '叫車時間',
      '完成時間'
    ].join(','))

    // 加入資料列
    for (const order of orders) {
      csvRows.push([
        order.orderNumber,
        order.passengerPhone,
        order.driver?.name || '',
        order.driver?.phone || '',
        order.driver?.licensePlate || '',
        `"${order.pickupAddress}"`, // 用引號包圍可能包含逗號的地址
        `"${order.dropoffAddress || ''}"`,
        order.estimatedFare || '',
        order.actualFare || '',
        order.paymentMethod || '',
        order.status,
        order.createdAt.toISOString().split('T')[0],
        order.completedTime ? order.completedTime.toISOString().split('T')[0] : ''
      ].join(','))
    }

    const csv = csvRows.join('\n')

    // 設定回應標頭
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename=orders-${new Date().toISOString().split('T')[0]}.csv`)
    
    res.send(csv)

  } catch (error) {
    console.error('匯出訂單錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

module.exports = {
  getRevenueStats,
  getOrders,
  getOrderById,
  exportOrders
}