const express = require('express')
const router = express.Router()
const {
  register,
  login,
  forgotPassword,
  resetPassword
} = require('../../controllers/fleet/authController')

// POST /api/fleet/register - 車隊管理員註冊
router.post('/register', register)

// POST /api/fleet/login - 車隊管理員登入
router.post('/login', login)

// POST /api/fleet/forgot-password - 忘記密碼（驗證手機和信箱）
router.post('/forgot-password', forgotPassword)

// POST /api/fleet/reset-password - 重設密碼
router.post('/reset-password', resetPassword)

module.exports = router