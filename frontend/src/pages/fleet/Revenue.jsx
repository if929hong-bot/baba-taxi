import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart
} from 'lucide-react'

const Revenue = () => {
  const navigate = useNavigate()
  const { fleetCode } = useParams()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month')

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
      setLoading(false)
    }, 500)
  }, [])

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
          <h1 className="text-2xl font-bold text-gray-800">營收報表</h1>
          <p className="text-gray-600 mt-1">查看車隊營收統計</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Download size={18} />
          <span>匯出報表</span>
        </button>
      </div>

      {/* 時間篩選 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center space-x-2">
          <Calendar size={20} className="text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">本日</option>
            <option value="week">本週</option>
            <option value="month">本月</option>
            <option value="quarter">本季</option>
            <option value="year">今年</option>
          </select>
        </div>
      </div>

      {/* 營收卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +0%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">$0</p>
          <p className="text-sm text-gray-600">總營收</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">0</p>
          <p className="text-sm text-gray-600">總訂單數</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">$0</p>
          <p className="text-sm text-gray-600">平均客單價</p>
        </div>
      </div>

      {/* 圖表區域 - 空狀態 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">每日營收趨勢</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <BarChart3 className="text-gray-300" size={48} />
            <p className="text-gray-400 ml-2">暫無數據</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">營收分布</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <PieChart className="text-gray-300" size={48} />
            <p className="text-gray-400 ml-2">暫無數據</p>
          </div>
        </div>
      </div>

      {/* 近期訂單 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">近期訂單</h3>
        </div>
        <div className="p-8 text-center">
          <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500">暫無訂單記錄</p>
        </div>
      </div>
    </div>
  )
}

export default Revenue