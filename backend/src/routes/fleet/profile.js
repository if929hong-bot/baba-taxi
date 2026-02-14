const express = require('express')
const router = express.Router()
const { authenticateFleetAdmin } = require('../../middleware/auth')
const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

// 所有路由都需要車隊管理員權限
router.use(authenticateFleetAdmin)

// GET /api/fleet/profile/me - 取得個人資料
router.get('/me', async (req, res) => {
  try {
    const manager = await prisma.fleetManager.findUnique({
      where: { id: req.user.id },
      include: {
        fleet: {
          include: {
            settings: true
          }
        }
      }
    })

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: '找不到使用者資料'
      })
    }

    const { password: _, ...managerWithoutPassword } = manager

    res.json({
      success: true,
      data: managerWithoutPassword
    })

  } catch (error) {
    console.error('取得個人資料錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
})

module.exports = router