const express = require('express')
const router = express.Router()

// 認證相關路由（不需要 token）
router.use('/', require('./auth'))

// 車隊管理路由（需要 token）
router.use('/fleets', require('./fleets'))

// 銀行設定路由（需要 token）
router.use('/bank', require('./bank'))

// 租金確認路由（需要 token）
router.use('/rent', require('./rent'))

// 司機總覽路由（需要 token）
router.use('/drivers', require('./drivers'))

module.exports = router