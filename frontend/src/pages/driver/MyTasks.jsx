import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Navigation,
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle
} from 'lucide-react'

const MyTasks = () => {
  const navigate = useNavigate()
  const { fleetCode } = useParams()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [dateFilter, setDateFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    
    if (!token || user?.role !== 'driver') {
      navigate(`/fleet/${fleetCode}/driver/login`)
    }
  }, [navigate, fleetCode])

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const mockTasks = []
      setTasks(mockTasks)
      setFilteredTasks(mockTasks)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let result = tasks
    
    if (searchTerm) {
      result = result.filter(t => 
        t.pickup?.includes(searchTerm) || 
        t.dropoff?.includes(searchTerm)
      )
    }
    
    if (dateFilter !== 'all') {
      const now = new Date()
      result = result.filter(t => {
        const taskDate = new Date(t.date)
        if (dateFilter === 'today') {
          return taskDate.toDateString() === now.toDateString()
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(now.setDate(now.getDate() - 7))
          return taskDate >= weekAgo
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
          return taskDate >= monthAgo
        }
        return true
      })
    }
    
    setFilteredTasks(result)
  }, [searchTerm, dateFilter, tasks])

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">已完成</span>
      case 'cancelled':
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">已取消</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">我的任務</h1>
        <p className="text-gray-600 mt-1">查看所有已完成和取消的訂單</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">總任務數</p>
          <p className="text-2xl font-bold text-gray-800">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">總收入</p>
          <p className="text-2xl font-bold text-green-600">$0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">完成率</p>
          <p className="text-2xl font-bold text-blue-600">0%</p>
        </div>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜尋地點..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">全部時間</option>
              <option value="today">本日</option>
              <option value="week">本週</option>
              <option value="month">本月</option>
            </select>
          </div>
        </div>
      </div>

      {/* 任務列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">任務記錄</h3>
        </div>

        {filteredTasks.length > 0 ? (
          <div className="divide-y">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{task.date}</span>
                  </div>
                  {getStatusBadge(task.status)}
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-start space-x-2">
                    <MapPin size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{task.pickup}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Navigation size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{task.dropoff}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="font-medium text-yellow-600">${task.fare}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Clock size={14} />
                    <span>{task.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 mb-2">暫無任務記錄</p>
            <p className="text-sm text-gray-400">完成訂單後，記錄會在這裡顯示</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyTasks