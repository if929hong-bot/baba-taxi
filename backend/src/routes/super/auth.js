const express = require('express')
const router = express.Router()
const { login } = require('../../controllers/super/authController')
const profileRouter = require('./profile')

// POST /api/super/login - 超級管理員登入
router.post('/login', login)

// 掛載個人資料路由（所有 /profile 開頭的都需要認證）
router.use('/profile', require('./profile'))

module.exports = router