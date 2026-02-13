import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Filter,
  Building2,
  Mail,
  Phone,
  Calendar
} from 'lucide-react'

const FleetApproval = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [fleets, setFleets] = useState([])
  const [filteredFleets, setFilteredFleets] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedFleet, setSelectedFleet] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  // 檢查登入
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (!token || user?.role !== 'super-admin') {
      navigate('/super-admin/login')
    }
  }, [navigate])

  // 載入資料 - 改為空陣列
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setFleets([])
      setFilteredFleets([])
      setLoading(false)
    }, 500)
  }, [])

  // 搜尋和篩選
  useEffect(() => {
    let result = fleets
    
    // 狀態篩選
    if (statusFilter !== 'all') {
      result = result.filter(f => f.status === statusFilter)
    }
    
    // 關鍵字搜尋
    if (searchTerm) {
      result = result.filter(f => 
        f.fleetName?.includes(searchTerm) || 
        f.managerName?.includes(searchTerm) ||
        f.phone?.includes(searchTerm)
      )
    }
    
    setFilteredFleets(result)
  }, [searchTerm, statusFilter, fleets])

  const handleApprove = (id) => {
    // 預留API串接
    console.log('通過審核', id)
  }

  const handleReject = (id, reason = '') => {
    // 預留API串接
    console.log('拒絕審核', id, reason)
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
          <Clock size={12} />
          <span>待審核</span>
        </span>
      case 'approved':
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
          <CheckCircle size={12} />
          <span>已通過</span>
        </span>
      case 'rejected':
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
          <XCircle size={12} />
          <span>已拒絕</span>
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
      {/* 頁面標題 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">車隊審核</h1>
        <p className="text-gray-600 mt-1">審核車隊管理員的註冊申請</p>
      </div>

      {/* 搜尋和篩選列 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜尋車隊名稱、負責人、電話..."
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
              <option value="pending">待審核</option>
              <option value="approved">已通過</option>
              <option value="rejected">已拒絕</option>
            </select>
          </div>
        </div>
      </div>

      {/* 統計卡片 - 全部顯示0 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">總申請數</p>
          <p className="text-2xl font-bold text-gray-800">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">待審核</p>
          <p className="text-2xl font-bold text-yellow-600">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">已通過</p>
          <p className="text-2xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">已拒絕</p>
          <p className="text-2xl font-bold text-red-600">0</p>
        </div>
      </div>

      {/* 車隊列表 - 空狀態 */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Building2 className="mx-auto text-gray-300 mb-3" size={48} />
        <p className="text-gray-500 mb-2">目前沒有車隊申請</p>
        <p className="text-sm text-gray-400">當有新車隊註冊時，會在這裡顯示</p>
      </div>
    </div>
  )
}

export default FleetApproval