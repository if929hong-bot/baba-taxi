const express = require('express')
const router = express.Router()
const { authenticateDriver } = require('../../middleware/auth')
const authController = require('../../controllers/driver/authController')
const taskController = require('../../controllers/driver/taskController')
const profileController = require('../../controllers/driver/profileController')

// ===== 公開路由（不需要 token）=====
router.post('/login', authController.login)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

// ===== 需要登入的路由 =====
router.use(authenticateDriver)

// 線上狀態
router.put('/status', taskController.updateOnlineStatus)

// 位置更新
router.put('/location', profileController.updateLocation)

// 任務相關
router.get('/tasks/nearby', taskController.getNearbyTasks)
router.get('/tasks', taskController.getMyTasks)
router.get('/tasks/:taskId', taskController.getTaskById)
router.post('/tasks/:taskId/grab', taskController.grabTask)
router.put('/tasks/:taskId/status', taskController.updateTaskStatus)

// 收入相關
router.get('/income/today', profileController.getTodayIncome)

// 個人資料
router.get('/profile', profileController.getProfile)
router.put('/profile', profileController.updateProfile)
router.put('/profile/password', profileController.updatePassword)

module.exports = router