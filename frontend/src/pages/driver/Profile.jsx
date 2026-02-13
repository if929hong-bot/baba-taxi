import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  User,
  Car,
  Phone,
  Mail,
  Calendar,
  Award,
  Shield,
  CreditCard,
  Edit2,
  LogOut,
  ChevronRight,
  Camera,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react'

const Profile = () => {
  const navigate = useNavigate()
  const { fleetCode } = useParams()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

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
      const mockProfile = {
        name: '張三',
        phone: '0911-111-111',
        email: 'zhang.san@example.com',
        licensePlate: 'ABC-1234',
        carBrand: 'Toyota',
        carModel: 'Altis',
        carYear: '2022',
        carColor: '白色',
        joinDate: '2026-01-15',
        status: 'active',
        rating: 4.8,
        trips: 156,
        totalIncome: 245800,
        documents: {
          driverLicense: '已上傳',
          carPhotos: '已上傳',
          policeCertificate: '已上傳'
        }
      }
      setProfile(mockProfile)
      setLoading(false)
    }, 1000)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate(`/fleet/${fleetCode}/driver/login`)
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
      {/* 頭像區域 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <User className="text-yellow-600" size={40} />
            </div>
            <button className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-lg">
              <Camera size={16} className="text-gray-600" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-500">評分 {profile.rating}</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{profile.trips} 趟</span>
            </div>
          </div>
        </div>
      </div>

      {/* 狀態卡片 */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle size={20} className="text-green-600" />
            <span className="text-green-700 font-medium">帳號狀態：啟用中</span>
          </div>
          <span className="text-sm text-green-600">可正常接單</span>
        </div>
      </div>

      {/* 個人資訊 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">個人資訊</h3>
        </div>
        <div className="divide-y">
          <div className="px-6 py-4 flex items-center space-x-3">
            <Phone size={18} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">手機號碼</p>
              <p className="text-sm font-medium">{profile.phone}</p>
            </div>
          </div>
          <div className="px-6 py-4 flex items-center space-x-3">
            <Mail size={18} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">電子信箱</p>
              <p className="text-sm font-medium">{profile.email}</p>
            </div>
          </div>
          <div className="px-6 py-4 flex items-center space-x-3">
            <Calendar size={18} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">加入日期</p>
              <p className="text-sm font-medium">{profile.joinDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 車輛資訊 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">車輛資訊</h3>
        </div>
        <div className="divide-y">
          <div className="px-6 py-4 flex items-center space-x-3">
            <Car size={18} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">車牌號碼</p>
              <p className="text-sm font-medium">{profile.licensePlate}</p>
            </div>
          </div>
          <div className="px-6 py-4">
            <p className="text-xs text-gray-500 mb-2">車輛型號</p>
            <p className="text-sm font-medium">{profile.carBrand} {profile.carModel} {profile.carYear}</p>
            <p className="text-sm text-gray-500 mt-1">顏色：{profile.carColor}</p>
          </div>
        </div>
      </div>

      {/* 文件狀態 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">文件狀態</h3>
        </div>
        <div className="divide-y">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText size={18} className="text-gray-400" />
              <span className="text-sm">駕照</span>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">已上傳</span>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera size={18} className="text-gray-400" />
              <span className="text-sm">車輛照片</span>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">已上傳</span>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield size={18} className="text-gray-400" />
              <span className="text-sm">良民證</span>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">已上傳</span>
          </div>
        </div>
      </div>

      {/* 統計資訊 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">統計資訊</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{profile.trips}</p>
              <p className="text-xs text-gray-500">總趟次</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">${profile.totalIncome.toLocaleString()}</p>
              <p className="text-xs text-gray-500">總收入</p>
            </div>
          </div>
        </div>
      </div>

      {/* 登出按鈕 */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-50 border border-red-200 text-red-600 py-4 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
      >
        <LogOut size={18} />
        <span>登出帳號</span>
      </button>
    </div>
  )
}

export default Profile