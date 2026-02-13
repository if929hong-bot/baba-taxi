import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  CheckCircle, 
  Clock, 
  Filter,
  DollarSign,
  Building2
} from 'lucide-react'

const RentConfirm = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (!token || user?.role !== 'super-admin') {
      navigate('/super-admin/login')
    }
  }, [navigate])

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setPayments([])
      setFilteredPayments([])
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    let result = payments
    
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter)
    }
    
    if (monthFilter !== 'all') {
      result = result.filter(p => p.month === monthFilter)
    }
    
    if (searchTerm) {
      result = result.filter(p => 
        p.fleetName?.includes(searchTerm)
      )
    }
    
    setFilteredPayments(result)
  }, [searchTerm, statusFilter, monthFilter, payments])

  const handleConfirm = (id) => {
    console.log('確認收款', id)
  }

  const getMonthOptions = () => {
    return []
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
          <Clock size={12} />
          <span>待確認</span>
        </span>
      case 'confirmed':
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
          <CheckCircle size={12} />
          <span>已確認</span>
        </span>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">租金確認</h1>
        <p className="text-gray-600 mt-1">確認車隊管理員繳交的平台租金</p>
      </div>

      {/* 統計卡片 - 全部顯示0 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">總租金收入</p>
          <p className="text-2xl font-bold text-gray-800">$0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">已確認</p>
          <p className="text-2xl font-bold text-green-600">$0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">待確認</p>
          <p className="text-2xl font-bold text-yellow-600">$0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">未繳車隊</p>
          <p className="text-2xl font-bold text-red-600">0</p>
        </div>
      </div>

      {/* 篩選列 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜尋車隊名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部狀態</option>
              <option value="pending">待確認</option>
              <option value="confirmed">已確認</option>
            </select>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部月份</option>
            </select>
          </div>
        </div>
      </div>

      {/* 租金列表 - 空狀態 */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <DollarSign className="mx-auto text-gray-300 mb-3" size={48} />
        <p className="text-gray-500 mb-2">目前沒有租金繳費記錄</p>
        <p className="text-sm text-gray-400">當車隊管理員上傳繳費證明時，會在這裡顯示</p>
      </div>
    </div>
  )
}

export default RentConfirm