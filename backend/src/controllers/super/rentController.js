const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// 取得租金繳費列表（含篩選）
const getRentPayments = async (req, res) => {
  try {
    const { status, month, fleetId, page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    // 建立篩選條件
    const where = {}
    
    if (status) where.status = status
    if (month) where.month = month
    if (fleetId) where.fleetId = fleetId

    // 查詢總筆數
    const total = await prisma.rentPayment.count({ where })

    // 查詢資料
    const payments = await prisma.rentPayment.findMany({
      where,
      include: {
        fleet: {
          select: {
            id: true,
            fleetName: true,
            fleetCode: true
          }
        },
        confirmer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: Number(limit)
    })

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('取得租金繳費列表錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 確認收款
const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params
    const { remarks } = req.body

    // 檢查繳費記錄是否存在
    const payment = await prisma.rentPayment.findUnique({
      where: { id },
      include: { fleet: true }
    })

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '找不到該筆繳費記錄'
      })
    }

    if (payment.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: '該筆繳費已經確認過'
      })
    }

    // 更新繳費狀態
    const updatedPayment = await prisma.rentPayment.update({
      where: { id },
      data: {
        status: 'confirmed',
        confirmedBy: req.user.id,
        confirmedAt: new Date(),
        remarks: remarks || payment.remarks
      },
      include: {
        fleet: {
          select: {
            id: true,
            fleetName: true,
            fleetCode: true
          }
        },
        confirmer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    })

    res.json({
      success: true,
      message: '收款確認成功',
      data: updatedPayment
    })

  } catch (error) {
    console.error('確認收款錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 上傳繳費證明（車隊管理員用，先保留）
const uploadProof = async (req, res) => {
  try {
    const { fleetId, month, amount } = req.body
    const proofUrl = req.file?.path // 需要先設定 multer

    if (!proofUrl) {
      return res.status(400).json({
        success: false,
        message: '請上傳繳費證明'
      })
    }

    // 檢查是否已經有該月份的繳費記錄
    const existing = await prisma.rentPayment.findUnique({
      where: {
        fleetId_month: {
          fleetId,
          month
        }
      }
    })

    if (existing) {
      return res.status(400).json({
        success: false,
        message: '該月份已經有繳費記錄'
      })
    }

    // 建立繳費記錄
    const payment = await prisma.rentPayment.create({
      data: {
        fleetId,
        month,
        amount: Number(amount),
        proofUrl,
        status: 'pending'
      }
    })

    res.json({
      success: true,
      message: '繳費證明上傳成功',
      data: payment
    })

  } catch (error) {
    console.error('上傳繳費證明錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

module.exports = {
  getRentPayments,
  confirmPayment,
  uploadProof
}