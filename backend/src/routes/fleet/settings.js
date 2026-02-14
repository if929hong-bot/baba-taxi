const express = require('express')
const router = express.Router()
const { authenticateFleetAdmin } = require('../../middleware/auth')
const {
  getFareSettings,
  updateFareSettings
} = require('../../controllers/fleet/settingsController')

// 所有路由都需要車隊管理員權限
router.use(authenticateFleetAdmin)

// GET /api/fleet/settings/fare - 取得費率設定
router.get('/fare', getFareSettings)

// PUT /api/fleet/settings/fare - 更新費率設定
router.put('/fare', updateFareSettings)

module.exports = router