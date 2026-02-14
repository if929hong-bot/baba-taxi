const express = require('express')
const router = express.Router()
const { authenticateFleetAdmin } = require('../../middleware/auth')
const {
  getRevenueStats,
  getOrders,
  getOrderById,
  exportOrders
} = require('../../controllers/fleet/revenueController')

// 所有路由都需要車隊管理員權限
router.use(authenticateFleetAdmin)

// GET /api/fleet/revenue/stats - 取得營收統計
router.get('/stats', getRevenueStats)

// GET /api/fleet/revenue/orders - 取得訂單列表
router.get('/orders', getOrders)

// GET /api/fleet/revenue/orders/:id - 取得單一訂單詳細資料
router.get('/orders/:id', getOrderById)

// GET /api/fleet/revenue/export - 匯出訂單報表
router.get('/export', exportOrders)

module.exports = router