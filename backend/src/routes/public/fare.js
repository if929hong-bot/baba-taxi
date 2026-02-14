const express = require('express')
const router = express.Router()
const { calculateEstimatedFare } = require('../../controllers/fleet/settingsController')

// POST /api/public/fare/estimate - 預估車資（不需要 token）
router.post('/estimate', calculateEstimatedFare)

module.exports = router