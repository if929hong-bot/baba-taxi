import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Search, 
  Filter,
  Car,
  Phone,
  Mail,
  Calendar,
  Star,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Ban,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const DriverList = () => {
  const navigate = useNavigate()
  const { fleetCode } = useParams()
  const [loading, setLoading] = useState(true)
  const [drivers, setDrivers] = useState([])
  const [filteredDrivers, setFilteredDrivers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showActionMenu, setShowActionMenu] = useState(null)

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
      setDrivers(mockData)
      setFilteredDrivers(mockData)
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    let result = drivers
    
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter)
    }
    
    if (searchTerm) {
      result = result.filter(d => 
        d.name?.includes(searchTerm) || 
        d.phone?.includes(searchTerm) ||
        d.licensePlate?.includes(searchTerm)
      )
    }
    
    setFilteredDrivers(result)
  }, [searchTerm, statusFilter, drivers])

  const handleDelete = (id) => {
    if (window.confirm('確定要刪除此司機嗎？此操作無法復原。')) {
      console.log('刪除司機', id)
    }
  }

  const handleToggleStatus = (id, currentStatus) => {
    const action = currentStatus === 'active' ? '停權' : '啟用'
    if (window.confirm(`確定要${action}此司機嗎？`)) {
      console.log(`${action}司機`, id)
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">上線中</span>
      case 'inactive':
        return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">離線</span>
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">待審核</span>
      case 'suspended':
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">已停權</span>
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
        <h1 className="text-2xl font-bold text-gray-800">司機列表</h1>
        <p className="text-gray-600 mt-1">管理車隊所有司機</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">總司機數</p>
          <p className="text-2xl font-bold text-gray-800">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">上線中</p>
          <p className="text-2xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">待審核</p>
          <p className="text-2xl font-bold text-yellow-600">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">累積趟次</p>
          <p className="text-2xl font-bold text-blue-600">0</p>
        </div>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜尋司機姓名、電話、車牌..."
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
              <option value="active">上線中</option>
              <option value="inactive">離線</option>
              <option value="pending">待審核</option>
              <option value="suspended">已停權</option>
            </select>
          </div>
        </div>
      </div>

      {/* 司機列表 - 空狀態 */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Car className="mx-auto text-gray-300 mb-3" size={48} />
        <p className="text-gray-500 mb-2">目前沒有司機資料</p>
        <p className="text-sm text-gray-400">當司機註冊並通過審核後，會在這裡顯示</p>
      </div>
    </div>
  )
}

export default DriverList