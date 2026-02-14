const express = require('express')
const router = express.Router()
const { authenticateSuperAdmin } = require('../../middleware/auth')
const {
  getPendingFleets,
  approveFleet,
  rejectFleet,
  getAllFleets,
  getFleetById,
  blockFleet,
  unblockFleet
} = require('../../controllers/super/fleetController')

// 所有路由都需要超級管理員權限
router.use(authenticateSuperAdmin)

// GET /api/super/fleets/pending - 取得待審核車隊
router.get('/pending', getPendingFleets)

// GET /api/super/fleets - 取得所有車隊列表
router.get('/', getAllFleets)

// GET /api/super/fleets/:id - 取得單一車隊詳細資料
router.get('/:id', getFleetById)

// PUT /api/super/fleets/:id/approve - 通過審核
router.put('/:id/approve', approveFleet)

// PUT /api/super/fleets/:id/reject - 拒絕審核
router.put('/:id/reject', rejectFleet)

// PUT /api/super/fleets/:id/block - 停權車隊
router.put('/:id/block', blockFleet)

// PUT /api/super/fleets/:id/unblock - 復權車隊
router.put('/:id/unblock', unblockFleet)

module.exports = router