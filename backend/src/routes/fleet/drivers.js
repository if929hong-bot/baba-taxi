const express = require('express')
const router = express.Router()
const { authenticateFleetAdmin } = require('../../middleware/auth')
const {
  // 審核相關
  getPendingDrivers,
  getPendingDriverById,
  approveDriver,
  rejectDriver,
  
  // 管理相關
  getAllDrivers,
  getDriverById,
  deleteDriver,
  updateDriverStatus
} = require('../../controllers/fleet/driverController')

// 所有路由都需要車隊管理員權限
router.use(authenticateFleetAdmin)

// ===== 審核相關路由 =====
// GET /api/fleet/drivers/pending - 取得待審核司機列表
router.get('/pending', getPendingDrivers)

// GET /api/fleet/drivers/pending/:id - 取得單一待審核司機詳細資料
router.get('/pending/:id', getPendingDriverById)

// PUT /api/fleet/drivers/:id/approve - 通過司機審核
router.put('/:id/approve', approveDriver)

// PUT /api/fleet/drivers/:id/reject - 拒絕司機審核
router.put('/:id/reject', rejectDriver)

// ===== 管理相關路由 =====
// GET /api/fleet/drivers - 取得所有司機列表
router.get('/', getAllDrivers)

// GET /api/fleet/drivers/:id - 取得單一司機詳細資料
router.get('/:id', getDriverById)

// DELETE /api/fleet/drivers/:id - 刪除司機（離職）
router.delete('/:id', deleteDriver)

// PUT /api/fleet/drivers/:id/status - 更新司機狀態（停權/復權）
router.put('/:id/status', updateDriverStatus)

module.exports = router
