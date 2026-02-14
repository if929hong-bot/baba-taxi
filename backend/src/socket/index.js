const { Server } = require('socket.io')
const { verifyToken } = require('../utils/jwt')

// 儲存連線的司機和乘客
const connectedDrivers = new Map() // driverId -> socketId
const connectedPassengers = new Map() // passengerId -> socketId
const driverLocations = new Map() // driverId -> { lat, lng, updatedAt }
const orderTracking = new Map() // orderId -> { driverId, socketId }

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // 前端網址
      methods: ["GET", "POST"],
      credentials: true
    }
  })

  // 認證中間件
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('未提供認證令牌'))
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return next(new Error('無效的認證令牌'))
    }

    socket.user = decoded
    next()
  })

  io.on('connection', (socket) => {
    const user = socket.user
    console.log(`用戶連線：${user.role} - ${user.id}`)

    // 根據角色處理連線
    switch (user.role) {
      case 'driver':
        handleDriverConnection(socket, user)
        break
      case 'passenger':
        handlePassengerConnection(socket, user)
        break
      case 'fleet-admin':
        handleFleetAdminConnection(socket, user)
        break
      case 'super-admin':
        handleSuperAdminConnection(socket, user)
        break
    }

    socket.on('disconnect', () => {
      console.log(`用戶斷線：${user.role} - ${user.id}`)
      
      switch (user.role) {
        case 'driver':
          handleDriverDisconnect(socket, user)
          break
        case 'passenger':
          handlePassengerDisconnect(socket, user)
          break
      }
    })
  })

  return io
}

// ==================== 司機端處理 ====================
function handleDriverConnection(socket, user) {
  const driverId = user.id
  
  // 儲存司機連線
  connectedDrivers.set(driverId, socket.id)
  
  // 加入司機專屬房間
  socket.join(`driver:${driverId}`)
  socket.join(`fleet:${user.fleetId}`)

  // 更新司機狀態為上線
  socket.on('driver:online', () => {
    console.log(`司機上線：${driverId}`)
    socket.broadcast.to(`fleet:${user.fleetId}`).emit('driver:status', {
      driverId,
      status: 'online'
    })
  })

  // 更新司機位置
  socket.on('driver:location', (data) => {
    const { latitude, longitude } = data
    driverLocations.set(driverId, {
      latitude,
      longitude,
      updatedAt: new Date()
    })

    // 廣播位置給相關乘客
    const trackingOrder = Array.from(orderTracking.entries())
      .find(([_, value]) => value.driverId === driverId)

    if (trackingOrder) {
      const [orderId] = trackingOrder
      io.to(`passenger:${orderId}`).emit('driver:location-update', {
        orderId,
        latitude,
        longitude
      })
    }
  })

  // 司機接受訂單
  socket.on('driver:accept-order', (data) => {
    const { orderId } = data
    console.log(`司機接受訂單：${driverId} - ${orderId}`)
    
    // 通知乘客
    io.to(`passenger:${orderId}`).emit('order:accepted', {
      orderId,
      driverId,
      estimatedArrival: 5 // 分鐘
    })

    // 開始追蹤
    orderTracking.set(orderId, { driverId, socketId: socket.id })
  })

  // 司機更新訂單狀態
  socket.on('driver:order-status', (data) => {
    const { orderId, status } = data
    io.to(`passenger:${orderId}`).emit('order:status-update', {
      orderId,
      status
    })
  })
}

function handleDriverDisconnect(socket, user) {
  const driverId = user.id
  connectedDrivers.delete(driverId)
  driverLocations.delete(driverId)
  
  // 通知車隊司機離線
  socket.broadcast.to(`fleet:${user.fleetId}`).emit('driver:status', {
    driverId,
    status: 'offline'
  })
}

// ==================== 乘客端處理 ====================
function handlePassengerConnection(socket, user) {
  const passengerId = user.id
  
  // 乘客可能沒有登入，用訂單 ID 代替
  const orderId = socket.handshake.query.orderId
  if (orderId) {
    socket.join(`passenger:${orderId}`)
  }
}

function handlePassengerDisconnect(socket, user) {
  // 乘客斷線處理
}

// ==================== 車隊管理員端處理 ====================
function handleFleetAdminConnection(socket, user) {
  socket.join(`fleet:${user.fleetId}`)
  
  // 定期發送線上司機數量
  const interval = setInterval(() => {
    const onlineCount = Array.from(connectedDrivers.keys())
      .filter(driverId => {
        // 這裡需要查詢司機所屬車隊
        return true // 簡化處理
      }).length
    
    socket.emit('fleet:stats', {
      onlineDrivers: onlineCount,
      activeOrders: 0 // 可以從資料庫查詢
    })
  }, 5000)

  socket.on('disconnect', () => {
    clearInterval(interval)
  })
}

// ==================== 超級管理員端處理 ====================
function handleSuperAdminConnection(socket, user) {
  socket.join('super-admin')
  
  // 定期發送平台統計
  const interval = setInterval(() => {
    socket.emit('platform:stats', {
      totalFleets: 0,
      totalDrivers: 0,
      totalOrders: 0
    })
  }, 10000)

  socket.on('disconnect', () => {
    clearInterval(interval)
  })
}

// ==================== 公開方法 ====================
function notifyNewOrder(fleetId, orderData) {
  const io = require('./index').io
  io.to(`fleet:${fleetId}`).emit('order:new', orderData)
}

function notifyOrderMatched(orderId, driverId) {
  const io = require('./index').io
  io.to(`passenger:${orderId}`).emit('order:matched', {
    orderId,
    driverId
  })
}

module.exports = {
  initializeSocket,
  notifyNewOrder,
  notifyOrderMatched
}