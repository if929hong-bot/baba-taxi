const express = require('express')
const router = express.Router()
const { authenticateSuperAdmin } = require('../../middleware/auth')
const {
  getBankInfo,
  updateBankInfo
} = require('../../controllers/super/bankController')

// 所有路由都需要超級管理員權限
router.use(authenticateSuperAdmin)

// GET /api/super/bank - 取得銀行資訊
router.get('/', getBankInfo)

// PUT /api/super/bank - 更新銀行資訊
router.put('/', updateBankInfo)

module.exports = router