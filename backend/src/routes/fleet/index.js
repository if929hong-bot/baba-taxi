const express = require('express')
const router = express.Router()

// 認證相關路由（不需要 token）
router.use('/', require('./auth'))

// 個人資料路由（需要 token）
router.use('/profile', require('./profile'))

// 司機審核與管理路由（需要 token）
router.use('/drivers', require('./drivers'))

// 營收報表路由（需要 token）
router.use('/revenue', require('./revenue'))

// 費率設定路由（需要 token）
router.use('/settings', require('./settings'))

// 銀行資訊路由（需要 token）
router.use('/bank', require('./bank'))

module.exports = router