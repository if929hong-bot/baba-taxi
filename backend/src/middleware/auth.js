const { verifyToken } = require('../utils/jwt')

// 驗證超級管理員權限
const authenticateSuperAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '請先登入'
      })
    }

    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '登入已過期，請重新登入'
      })
    }

    // 檢查是否為超級管理員
    if (decoded.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: '沒有權限執行此操作'
      })
    }

    // 將使用者資訊存入 req
    req.user = decoded
    next()

  } catch (error) {
    console.error('認證錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 驗證車隊管理員權限
const authenticateFleetAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '請先登入'
      })
    }

    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '登入已過期，請重新登入'
      })
    }

    // 檢查是否為車隊管理員
    if (decoded.role !== 'fleet-admin') {
      return res.status(403).json({
        success: false,
        message: '沒有權限執行此操作'
      })
    }

    req.user = decoded
    next()

  } catch (error) {
    console.error('認證錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

// 驗證司機權限
const authenticateDriver = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '請先登入'
      })
    }

    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '登入已過期，請重新登入'
      })
    }

    // 檢查是否為司機
    if (decoded.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: '沒有權限執行此操作'
      })
    }

    req.user = decoded
    next()

  } catch (error) {
    console.error('認證錯誤：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
}

module.exports = {
  authenticateSuperAdmin,
  authenticateFleetAdmin,
  authenticateDriver
}