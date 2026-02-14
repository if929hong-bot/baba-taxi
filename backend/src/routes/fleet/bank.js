const express = require('express')
const router = express.Router()
const { authenticateFleetAdmin } = require('../../middleware/auth')
const {
  getBankInfo
} = require('../../controllers/fleet/bankController')

// 所有路由都需要車隊管理員權限
router.use(authenticateFleetAdmin)

// GET /api/fleet/bank - 取得銀行資訊（唯讀）
router.get('/', getBankInfo)

module.exports = router