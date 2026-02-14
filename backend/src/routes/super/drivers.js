const express = require('express')
const router = express.Router()
const { authenticateSuperAdmin } = require('../../middleware/auth')
const {
  getAllDrivers,
  getDriverById,
  blockDriver,
  unblockDriver
} = require('../../controllers/super/driverController')

// 所有路由都需要超級管理員權限
router.use(authenticateSuperAdmin)

// GET /api/super/drivers - 取得所有司機列表
router.get('/', getAllDrivers)

// GET /api/super/drivers/:id - 取得單一司機詳細資料
router.get('/:id', getDriverById)

// PUT /api/super/drivers/:id/block - 停權司機
router.put('/:id/block', blockDriver)

// PUT /api/super/drivers/:id/unblock - 復權司機
router.put('/:id/unblock', unblockDriver)

module.exports = router