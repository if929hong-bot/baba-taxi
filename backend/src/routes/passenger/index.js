const express = require('express')
const router = express.Router()
const bookingController = require('../../controllers/passenger/bookingController')

// 乘客端所有路由都不需要 token（免登入）

// POST /api/passenger/booking - 乘客叫車
router.post('/booking', bookingController.createBooking)

// GET /api/passenger/booking/:orderId - 查詢訂單狀態
router.get('/booking/:orderId', bookingController.getBookingStatus)

// DELETE /api/passenger/booking/:orderId/cancel - 取消叫車
router.delete('/booking/:orderId/cancel', bookingController.cancelBooking)

// GET /api/passenger/booking/:orderId/tracking - 取得司機即時位置
router.get('/booking/:orderId/tracking', bookingController.getDriverTracking)

// PUT /api/passenger/booking/:orderId/complete - 完成訂單
router.put('/booking/:orderId/complete', bookingController.completeBooking)

module.exports = router