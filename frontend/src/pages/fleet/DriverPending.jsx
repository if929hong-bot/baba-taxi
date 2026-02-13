import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Filter,
  Car,
  Phone,
  Mail,
  Calendar,
  Download,
  FileText,
  AlertCircle
} from 'lucide-react'

const DriverPending = () => {
  const navigate = useNavigate()
  const { fleetCode } = useParams()
  const [loading, setLoading] = useState(true)
  const [drivers, setDrivers] = useState([])
  const [filteredDrivers, setFilteredDrivers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  // 檢查登入
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (!token || user?.role !== 'fleet-admin') {
      navigate('/fleet/login')
    }
  }, [navigate])

  // 載入資料
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      // 模擬資料，之後會從 API 取得
      const mockData = []
      setDrivers(mockData)
      setFilteredDrivers(mockData)
      setLoading(false)
    }, 500)
  }, [])

  // 搜尋
  useEffect(() => {
    if (searchTerm) {
      const result = drivers.filter(d => 
        d.name?.includes(searchTerm) || 
        d.phone?.includes(searchTerm) ||
        d.licensePlate?.includes(searchTerm)
      )
      setFilteredDrivers(result)
    } else {
      setFilteredDrivers(drivers)
    }
  }, [searchTerm, drivers])

  const handleApprove = (id) => {
    console.log('通過審核', id)
    // 之後串接 API
  }

  const handleReject = (id) => {
    console.log('拒絕審核', id)
    // 之後串接 API
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
          <Clock size={12} />
          <span>待審核</span>
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
        <h1 className="text-2xl font-bold text-gray-800">司機審核</h1>
        <p className="text-gray-600 mt-1">審核司機的註冊申請</p>
      </div>

      {/* 搜尋列 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜尋司機姓名、電話、車牌..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">待審核司機</p>
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

      {/* 司機列表 - 空狀態 */}
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Car className="mx-auto text-gray-300 mb-3" size={48} />
        <p className="text-gray-500 mb-2">目前沒有待審核的司機</p>
        <p className="text-sm text-gray-400">當司機完成註冊後，會在這裡顯示</p>
      </div>
    </div>
  )
}

export default DriverPending