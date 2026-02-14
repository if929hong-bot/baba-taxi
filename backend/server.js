const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const http = require('http')
const { initializeSocket } = require('./src/socket')

// 載入環境變數
dotenv.config()

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3000

// 初始化 Socket.io
const io = initializeSocket(server)
// 讓其他檔案可以存取 io
app.set('io', io)

// 中間件
app.use(helmet())
app.use(cors({
  origin: true, 
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 請求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100 // 限制每個IP 100個請求
})
app.use('/api', limiter)

// 基本路由
app.get('/', (req, res) => {
  res.json({ message: '叭叭出行 API 運行中' })
})

// API 路由
app.use('/api', require('./src/routes'))

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: '伺服器錯誤' })
})

// 啟動伺服器
server.listen(PORT, () => {
  console.log(`🚀 伺服器運行在 http://localhost:${PORT}`)
  console.log(`🔌 WebSocket 伺服器已啟動`)
})