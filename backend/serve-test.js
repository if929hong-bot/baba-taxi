const express = require('express')
const app = express()
const path = require('path')

app.use(express.static(__dirname))

app.listen(3001, () => {
  console.log('測試頁面伺服器運行在 http://localhost:3001/websocket-test.html')
})