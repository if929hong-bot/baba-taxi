const express = require('express')
const router = express.Router()

// 公開 API（不需要 token）
router.use('/public', require('./public/fare'))

// 超級管理員路由
router.use('/super', require('./super'))

// 車隊管理員路由
router.use('/fleet', require('./fleet'))

// 司機路由
router.use('/driver', require('./driver'))

// 乘客路由（免登入）
router.use('/passenger', require('./passenger'))

module.exports = router