import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Car,
  Clock,
  Eye,
  Download
} from 'lucide-react'

const OrderList = () => {
  const navigate = useNavigate()
  const { fleetCode } = useParams()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('today')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (!token || user?.role !== 'fleet-admin') {
      navigate('/fleet/login')
    }
  }, [navigate])

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const mockData = []
      setOrders(mockData)
      setFilteredOrders(mockData)
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    let result = orders
    
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter)
    }
    
    if (searchTerm) {
      result = result.filter(o => 
        o.passengerPhone?.includes(searchTerm) || 
        o.driverName?.includes(searchTerm) ||
        o.orderId?.includes(searchTerm)
      )
    }
    
    setFilteredOrders(result)
  }, [searchTerm, statusFilter, orders])

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">已完成</span>
      case 'cancelled':
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">已取消</span>
      case 'ongoing':
        return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">進行中</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">訂單查詢</h1>
          <p className="text-gray-600 mt-1">查看所有乘客訂單記錄</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Download size={18} />
          <span>匯出報表</span>
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">今日訂單</p>
          <p className="text-2xl font-bold text-gray-800">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">本週訂單</p>
          <p className="text-2xl font-bold text-gray-800">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">本月訂單</p>
          <p className="text-2xl font-bold text-gray-800">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">總營收</p>
          <p className="text-2xl font-bold text-green-600">$0</p>
        </div>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜尋訂單編號、乘客電話、司機姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">本日</option>
              <option value="week">本週</option>
              <option value="month">本月</option>
              <option value="custom">自訂區間</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部狀態</option>
              <option value="completed">已完成</option>
              <option value="ongoing">進行中</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
        </div>
      </div>

      {/* 訂單列表 - 空狀態 */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
        <p className="text-gray-500 mb-2">目前沒有訂單記錄</p>
        <p className="text-sm text-gray-400">當乘客完成叫車後，訂單會在這裡顯示</p>
      </div>
    </div>
  )
}

export default OrderList