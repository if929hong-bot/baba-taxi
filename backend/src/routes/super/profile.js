const express = require('express')
const router = express.Router()
const { authenticateSuperAdmin } = require('../../middleware/auth')

// 取得超級管理員個人資料（需要 token）
router.get('/me', authenticateSuperAdmin, async (req, res) => {
  try {
    // req.user 來自 middleware 的 decoded token
    res.json({
      success: true,
      data: {
        user: req.user
      }
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