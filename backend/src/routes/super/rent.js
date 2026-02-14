const express = require('express')
const router = express.Router()
const { authenticateSuperAdmin } = require('../../middleware/auth')
const {
  getRentPayments,
  confirmPayment,
  uploadProof
} = require('../../controllers/super/rentController')

// 所有路由都需要超級管理員權限
router.use(authenticateSuperAdmin)

// GET /api/super/rent - 取得租金繳費列表
router.get('/', getRentPayments)

// PUT /api/super/rent/:id/confirm - 確認收款
router.put('/:id/confirm', confirmPayment)

// 上傳繳費證明（給車隊管理員用的，暫時保留）
// router.post('/upload', upload.single('proof'), uploadProof)

module.exports = router